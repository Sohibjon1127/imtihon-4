import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/bookHistory.entity';
import { Borrow } from 'src/core/entity/borrow.entity';
import { User } from 'src/core/entity/user.entity';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';

@Module({
  imports: [TypeOrmModule.forFeature([Borrow, User, Book, BookHistory])],
  controllers: [BorrowController],
  providers: [BorrowService],
})
export class BorrowModule {}
