import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBorrowDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  bookId: string;

  @IsDateString()
  borrow_date: Date;

  @IsDateString()
  due_date: Date;

  @IsOptional()
  @IsDateString()
  return_date?: Date;

  @IsOptional()
  @IsBoolean()
  overdue: boolean;
}
