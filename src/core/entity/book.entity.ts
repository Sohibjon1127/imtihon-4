import { BaseEntity } from 'src/common/database/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BookHistory } from './bookHistory.entity';
import { Borrow } from './borrow.entity';

@Entity('Book')
export class Book extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  author: string;

  @Column({ type: 'int' })
  published_year: number;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @OneToMany(() => BookHistory, (history) => history.bookId)
  bookHistory: BookHistory[];

  @OneToMany(() => Borrow, (borrow) => borrow.bookId)
  borrows: Borrow[];
}
