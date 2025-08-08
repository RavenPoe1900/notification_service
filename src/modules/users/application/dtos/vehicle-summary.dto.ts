import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';

export class VehicleSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the vehicle.',
    example: 201,
  })
  id: number;

  @ApiProperty({
    description: 'The license plate number of the vehicle.',
    example: 'ABC-123',
  })
  plate: string;

  @ApiProperty({
    enum: VehicleType,
    description: 'The type of the vehicle.',
    example: VehicleType.CAR,
  })
  type: VehicleType;
}
