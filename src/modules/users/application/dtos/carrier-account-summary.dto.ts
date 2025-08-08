import { ApiProperty } from '@nestjs/swagger';

export class CarrierAccountSummaryDto {
  @ApiProperty({
    description: 'Unique identifier for the carrier account.',
    example: 301,
  })
  id: number;

  @ApiProperty({
    description: 'The current balance of the carrier account.',
    example: 1250.5,
  })
  balance: number;

  @ApiProperty({
    description: 'The currency of the account balance.',
    example: 'CUP',
  })
  currency: string;
}