import { ApiProperty } from '@nestjs/swagger';

export class OperationResultDto {
  @ApiProperty({ description: 'Indicates if the operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Message describing the result of the operation' })
  message: string;
}
