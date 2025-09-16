import { Repository } from 'typeorm';
import { BookHistory } from '../entity/bookHistory.entity';

export type BookHistoryRepository = Repository<BookHistory>;
