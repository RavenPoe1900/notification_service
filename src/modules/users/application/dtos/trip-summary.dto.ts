import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';

export class TripSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the trip.',
    example: 501,
  })
  id: number;

  @ApiProperty({
    enum: TripStatus,
    description: 'The current status of the trip.',
    example: TripStatus.COMPLETED,
  })
  status: TripStatus;

  @ApiProperty({
    description: 'The total amount charged for the trip.',
    example: 150.75,
  })
  totalAmount: number;
}
