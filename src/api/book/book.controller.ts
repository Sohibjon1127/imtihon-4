import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookQueryDto } from 'src/common/dto/book-query.dto';
import { HistoryAction } from 'src/common/enum';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get(':id/history')
  historyBook(
    @Query('action') action: HistoryAction,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const where = action
      ? { bookHistory: { action: action } }
      : { bookHistory: { action: HistoryAction.BORROW } };

    return this.bookService.findOneBy({
      where: { bookHistory: { action: HistoryAction.BORROW } },
    });
  }

  @Get()
  findAll(@Query() bookQuery: BookQueryDto) {
    const { title, author, year, available } = bookQuery;
    const where: any = {};

    if (title) where.title = title;
    if (author) where.author = author;
    if (year) where.published_year = year;
    if (available) where.available = available;

    return this.bookService.findAll({
      where,
      relations: { bookHistory: true, borrows: true },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOneBy({
      where: { id },
      relations: { bookHistory: true, borrows: true },
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.bookService.delete(id);
  }
}
