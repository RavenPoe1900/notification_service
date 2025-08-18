import { ApiProperty } from '@nestjs/swagger';

export class ChangeRoleResponseDto {
  @ApiProperty({
    example: 'Role changed successfully',
    description: 'Success message for role change',
  })
  message: string;
} 