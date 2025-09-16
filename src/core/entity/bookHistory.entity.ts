import { BaseEntity } from 'src/common/database/base.entity';
import { HistoryAction } from 'src/common/enum';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('BookHistory')
export class BookHistory extends BaseEntity {
  @ManyToOne(() => Book, (book) => book.bookHistory, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  bookId: Book;

  @ManyToOne(() => User, (user) => user.bookHistory, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userId: User;

  @Column({ type: 'enum', enum: HistoryAction, default: HistoryAction.BORROW })
  action: HistoryAction;

  @Column({ type: 'date'})
  date: Date;
}
