import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'Page',
    required: false,
    example: `0`,
    default: 0,
    minimum: 0,
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(250)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'Number of items',
    example: `50`,
    required: false,
    default: 50,
    maximum: 250,
    minimum: 1,
  })
  perPage?: number = 50;
}
