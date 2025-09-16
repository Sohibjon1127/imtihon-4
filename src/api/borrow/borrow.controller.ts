import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetRequestUser } from 'src/common/decorator/get-request-user.decorator';
import { AccessRoles } from 'src/common/decorator/role.decorator';
import { Roles } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { RolesGuard } from 'src/common/guard/role.guard';
import type { IToken } from 'src/infrastructure/token/interface';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';

@Controller('borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.READER)
  @Post(':bookId')
  create(
    @GetRequestUser('user') user: IToken,
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Body() createBorrowDto: CreateBorrowDto,
  ) {
    return this.borrowService.createBorrow(createBorrowDto, bookId, user);
  }
  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, Roles.READER)
  @Patch(':id/return')
  returnBook(
    @GetRequestUser('user') user: IToken,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnBook(user, id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @AccessRoles(Roles.SUPERADMIN, Roles.ADMIN, 'ID')
  @Get()
  findAllForReader(@GetRequestUser('user') user: IToken) {
    return this.borrowService.findAll({
      where: { userId: { id: user.id } },
      relations: { bookId: true },
    });
  }
}
