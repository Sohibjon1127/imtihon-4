import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/core/entity/book.entity';
import type { BookRepository } from 'src/core/repository/book.repository';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService extends BaseService<
  CreateBookDto,
  UpdateBookDto,
  Book
> {
  constructor(
    @InjectRepository(Book) private readonly bookRepo: BookRepository,
  ) {
    super(bookRepo);
  }
}
