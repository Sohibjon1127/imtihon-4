import { BaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('Borrow')
export class Borrow extends BaseEntity {
  @ManyToOne(() => Book, (book) => book.borrows)
  bookId: Book;

  @ManyToOne(() => User, (user) => user.borrows)
  userId: User;

  @Column({ type: 'date' })
  borrow_date: Date;

  @Column({
    type: 'date',
  })
  due_date: Date;

  @Column({
    type: 'date',
  })
  return_date: Date;

  @Column({ type: 'boolean', default: false })
  overdue: boolean;
}
