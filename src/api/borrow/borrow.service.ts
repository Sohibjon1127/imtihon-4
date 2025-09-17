import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HistoryAction, Roles } from 'src/common/enum';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/bookHistory.entity';
import { Borrow } from 'src/core/entity/borrow.entity';
import { User } from 'src/core/entity/user.entity';
import type { BorrowRepository } from 'src/core/repository/borrow.entity';
import { BaseService } from 'src/infrastructure/base/base.service';
import { IToken } from 'src/infrastructure/token/interface';
import { DataSource, Repository } from 'typeorm';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';

@Injectable()
export class BorrowService extends BaseService<
  CreateBorrowDto,
  UpdateBorrowDto,
  Borrow
> {
  constructor(
    @InjectRepository(Borrow) private readonly borrowRepo: Repository<Borrow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Book) private readonly bookRepo: Repository<Book>,
    @InjectRepository(BookHistory) private readonly historyRepo: Repository<BookHistory>,
    private readonly dataSourse: DataSource,
  ) {
    super(borrowRepo);
  }

  async createBorrow(
    createBorrowDto: CreateBorrowDto,
    bookId: string,
    user: IToken,
  ) {
    const checkBook = await this.bookRepo.findOneBy({
      id: bookId,
      available: true,
    });
    if (!checkBook) throw new BadRequestException(`Book closed`);

    const userHistory = await this.userRepo.findOne({
      where: { id: user.id, role: Roles.READER },
      relations: { bookHistory: true },
    });

    let count = 0;
    userHistory?.bookHistory.forEach((history) => {
      count = history.action == HistoryAction.BORROW ? count + 1 : count;
    });
    if (count > 2)
      throw new BadRequestException(
        `A user is not allowed to have more than 3 books`,
      );

    if (
      createBorrowDto.borrow_date.getTime() > createBorrowDto.due_date.getTime()
    )
      throw new BadRequestException(`The date was incorrect.`);
    await this.dataSourse.transaction(async (manager) => {
      await manager.update(Book, { id: bookId }, { available: false });
      const history = manager.create(BookHistory, {
        bookId: checkBook,
        userId: userHistory!,
        action: HistoryAction.BORROW,
      });
      manager.save(BookHistory, history);

      const borrow = manager.create(Borrow, {
        bookId: checkBook!,
        userId: userHistory!,
        borrow_date: createBorrowDto.borrow_date!,
        due_date: createBorrowDto.due_date!,
      });

      await manager.save(borrow);
    });
  }

  async returnBook(id: string, user: IToken) {
    const borrowBook = await this.borrowRepo.findOne({
      where: { bookId: { id }, userId: { id: user.id } },
    });

    if (!borrowBook) throw new NotFoundException(`Borrow not found`);

    if (borrowBook?.due_date.getTime()! < new Date().getTime()) {
      borrowBook.overdue = false;
    }

    const history = await this.historyRepo.findOne({
      where: { bookId: { id } },
    });

    if (history?.action === HistoryAction.RETURN)
      throw new BadRequestException(`given book`);

    borrowBook.return_date = new Date();

    await this.dataSourse.transaction(async (manager) => {
      await manager.update(
        Book,
        { id: borrowBook.bookId.id },
        { available: true },
      );

      await manager.update(
        BookHistory,
        { id: history?.id },
        { action: HistoryAction.RETURN },
      );

      await manager.save(Borrow, borrowBook);
    });
  }
}
