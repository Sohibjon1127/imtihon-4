import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';

import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowModule } from './borrow/borrow.module';
import { Book } from 'src/core/entity/book.entity';
import { BookHistory } from 'src/core/entity/bookHistory.entity';
import { Borrow } from 'src/core/entity/borrow.entity';
import { User } from 'src/core/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.DB_URL,
      synchronize: config.DB_SYNC,
      entities: [User, Book, BookHistory, Borrow],
      autoLoadEntities: true,
    }),

    JwtModule.register({
      global: true,
    }),

    AuthModule,
    UserModule,
    BookModule,
    BorrowModule,
  ],
})
export class AppModule {}
