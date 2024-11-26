import { IsNumber, IsOptional, Max } from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @IsNumber()
    page: number = 1;
    @IsOptional()
    @IsNumber()
    @Max(100)
    limit: number;
}
