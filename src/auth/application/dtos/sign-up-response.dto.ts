import { ApiProperty } from '@nestjs/swagger';

export class SignUpResponseDto {
  @ApiProperty({
    example: `User successfully registered`,
    description: 'Message',
  })
  message: string;
}
