import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class BookQueryDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsNumber()
  @IsOptional()
  year?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}
