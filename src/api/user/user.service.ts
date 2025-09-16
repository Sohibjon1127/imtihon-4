import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Roles } from 'src/common/enum';
import { config } from 'src/config';
import { User } from 'src/core/entity/user.entity';
import type { UserRepository } from 'src/core/repository/user.entity';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CryptoService } from 'src/infrastructure/crypt/Crypto';
import { successRes } from 'src/infrastructure/response/success';
import { IToken } from 'src/infrastructure/token/interface';
import { TokenService } from 'src/infrastructure/token/Token';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService
  extends BaseService<CreateUserDto, UpdateUserDto, User>
  implements OnModuleInit
{
  constructor(
    @InjectRepository(User) private readonly userRepo: UserRepository,
    private readonly crypto: CryptoService,
    private readonly tokenService: TokenService,
  ) {
    super(userRepo);
  }

  async onModuleInit(): Promise<void> {
    try {
      const existsSuperadmin = await this.userRepo.findOne({
        where: { role: Roles.SUPERADMIN },
      });

      const hashedPassword = await this.crypto.encrypt(
        config.SUPERADMIN.ADMIN_PASSWORD,
      );
      existsSuperadmin;
      if (!existsSuperadmin) {
        const superadmin = this.userRepo.create({
          email: config.SUPERADMIN.ADMIN_EMAIL,
          hashed_password: hashedPassword,
          full_name: 'Sohibjon1127',
          role: Roles.SUPERADMIN,
        });

        await this.userRepo.save(superadmin);
        console.log('Super admin created successfully');
      }
    } catch (error) {
      throw new InternalServerErrorException('Error on creaeting super admin');
    }
  }

  async createUser(creteUserDto: CreateUserDto, role: Roles) {
    const { password, email } = creteUserDto;
    let existsEmail: any = await this.userRepo.findOne({
      where: { email },
    });

    if (existsEmail) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await this.crypto.encrypt(password);
    const newUser = this.userRepo.create({
      hashed_password: hashedPassword,
      email,
      role,
      full_name: creteUserDto.full_name,
    });
    await this.userRepo.save(newUser);
    return successRes(newUser, 201);
  }

  async signIn(signInDto: CreateUserDto, res: Response) {
    const { email, password } = signInDto;
    const user = await this.userRepo.findOne({ where: { email } });
    const isMatchPassword = await this.crypto.decrypt(
      password,
      user?.hashed_password || '',
    );
    if (!user || !isMatchPassword) {
      throw new BadRequestException('Username or password incorrect');
    }
    const payload: IToken = {
      id: user.id,
      role: user.role,
    };
    const accessToken = await this.tokenService.accessToken(payload);
    const refreshToken = await this.tokenService.refreshToken(payload);
    await this.tokenService.writeCookie(res, 'adminToken', refreshToken, 15);
    return successRes({ token: accessToken });
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    userToken: IToken,
  ) {
    const { email, password } = updateUserDto;
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Admin not found');
    }
    if (email) {
      const existsEmail = await this.userRepo.findOne({
        where: { email },
      });
      if (existsEmail && existsEmail.id !== id) {
        throw new ConflictException('Username already exists');
      }
    }
    let hashedPassword = user?.hashed_password;
    if (userToken.role === Roles.SUPERADMIN || userToken.role === Roles.ADMIN) {
      if (password) {
        hashedPassword = await this.crypto.encrypt(password);
      }
    }
    await this.userRepo.update(
      { id },
      { email, hashed_password: hashedPassword },
    );
    return this.findOneById(id);
  }
}
