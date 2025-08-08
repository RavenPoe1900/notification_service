/**
 * Represents a generic paginated response structure.
 * This type is defined in the domain layer to be independent of
 * specific application DTOs or infrastructure implementations.
 *
 * @template T The type of data items in the paginated response.
 */
export interface GenericPaginatedResponse<T> {
  data: T[];
  pageInfo: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
}