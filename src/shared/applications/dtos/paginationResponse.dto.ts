import { ApiProperty } from '@nestjs/swagger';

export class PageInfo {
  @ApiProperty({ description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ description: 'Total number of results' })
  totalResults: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Array of data items', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Pagination information' })
  pageInfo: PageInfo;
}
