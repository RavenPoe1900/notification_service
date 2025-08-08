import { ApiProperty } from '@nestjs/swagger';

export class RatingDetailDto {
  @ApiProperty({
    description: 'Unique identifier for the rating.',
    example: 601,
  })
  id: number;

  @ApiProperty({
    description: 'The number of stars given in the rating (1-5).',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  stars: number;

  @ApiProperty({
    description: 'An optional comment provided with the rating.',
    nullable: true,
    example: 'Excellent service, very punctual!',
  })
  comment?: string;
}
