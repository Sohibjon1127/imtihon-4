import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CookieGetter } from 'src/common/decorator/cookie-getter.decorator';
import { GetRequestUser } from 'src/common/decorator/get-request-user.decorator';

import { QueryPaginationDto } from 'src/common/dto/query-pagination.dto';
import { Roles } from 'src/common/enum';
import type { IToken } from 'src/infrastructure/token/interface';
import { ILike } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('admin')
  createAdmin(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.ADMIN);
  }

  @Post('librarian')
  createLibrarian(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.LIBRARIAN);
  }

  @Post('reader')
  signUp(@Body() userAdminDto: CreateUserDto) {
    return this.userService.createUser(userAdminDto, Roles.READER);
  }

  @Post('signin')
  signin(
    @Body() signInDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  @Post('token')
  newToken(@CookieGetter('adminToken') token: string) {
    return this.authService.newToken(this.userService.getRepository, token);
  }

  @Post('signout')
  signOut(
    @CookieGetter('adminToken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(
      this.userService.getRepository,
      token,
      res,
      'adminToken',
    );
  }

  @Get()
  findAllWithPagination(@Query() queryDto: QueryPaginationDto) {
    const { query, page, limit } = queryDto;
    const where = query
      ? { email: ILike(`%${query}%`), role: Roles.READER }
      : { role: Roles.READER };
    return this.userService.findAllWithPagination({
      where,
      order: { createdAt: 'DESC' },
      relations: { bookHistory: true, borrows: true },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
      },
      skip: page,
      take: limit,
    });
  }

  @Get('all')
  findAll() {
    return this.userService.findAll({
      where: { role: Roles.READER },
      relations: { bookHistory: true, borrows: true },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
      },
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneById(id, {
      where: { role: Roles.READER },
      relations: { bookHistory: true, borrows: true },
    });
  }

  @Patch(':id')
  update(
    @GetRequestUser('user') user: IToken,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, UpdateUserDto, user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const admin = await this.userService.getRepository.findOne({
      where: { id },
    });
    if (admin && admin.role === Roles.SUPERADMIN) {
      throw new ForbiddenException('Deleting super admin is restricted');
    }
    return this.userService.delete(id);
  }
}
