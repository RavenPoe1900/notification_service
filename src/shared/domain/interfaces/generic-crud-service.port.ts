import { GenericPaginatedResponse } from '../types/pagination.types';

// Generic type definitions for CRUD arguments.
// These types are abstract and do not directly depend on Prisma.
// They only define the expected structure (e.g., { where: object }).
export type GenericWhereArg = { [key: string]: any };
export type GenericOrderByArg = unknown; // Can be more specific if needed
export type GenericSelectArg = unknown;
export type GenericIncludeArg = unknown;

// Arguments for generic CRUD operations.
export type GenericCreateArgs = object;
export type GenericFindManyArgs = {
  take?: number;
  skip?: number;
  where?: GenericWhereArg;
  orderBy?: GenericOrderByArg;
  select?: GenericSelectArg;
  include?: GenericIncludeArg;
};
export type GenericFindUniqueArgs = { where: GenericWhereArg };
export type GenericUpdateArgs = { where: GenericWhereArg; data: object };
export type GenericDeleteArgs = { where: GenericWhereArg };
export type GenericCountArgs = { where?: GenericWhereArg };

/**
 * Generic interface for a CRUD service.
 * This interface defines the basic operations that any persistence service
 * should offer, regardless of the underlying database technology.
 *
 * @template TEntity The type of the domain entity handled by the service.
 * @template TCreateArgs The arguments for the create operation.
 * @template TFindManyArgs The arguments for the find many operation.
 * @template TFindUniqueArgs The arguments for the find unique operation.
 * @template TUpdateArgs The arguments for the update operation.
 * @template TDeleteArgs The arguments for the delete operation.
 */
export interface GenericCrudService<
  TEntity,
  TCreateArgs extends GenericCreateArgs,
  TFindManyArgs extends GenericFindManyArgs,
  TFindUniqueArgs extends GenericFindUniqueArgs,
  TUpdateArgs extends GenericUpdateArgs,
  TDeleteArgs extends GenericDeleteArgs,
> {
  /**
   * Creates a new entity.
   * @param args The arguments for creating the entity.
   * @returns A promise that resolves with the created entity.
   */
  create(args: TCreateArgs): Promise<TEntity>;

  /**
   * Counts the number of entities matching a given filter.
   * @param filter Optional filter arguments.
   * @returns A promise that resolves with the total count of entities.
   */
  count(filter?: GenericCountArgs): Promise<number>;

  /**
   * Retrieves a paginated list of entities.
   * @param params Parameters for pagination and filtering.
   * @returns A promise that resolves with a paginated response containing entities.
   */
  findAll(
    params: TFindManyArgs & {
      page?: number;
      perPage?: number;
      filter?: GenericWhereArg;
    },
  ): Promise<GenericPaginatedResponse<TEntity>>;

  /**
   * Retrieves a list of entities using cursor-based pagination.
   * @param args Arguments for cursor-based retrieval.
   * @returns A promise that resolves with a paginated response containing entities.
   */
  findAllCursor(args: {
    cursor?: number | string;
    take?: number;
    where?: GenericWhereArg;
    orderBy?: GenericOrderByArg;
    select?: GenericSelectArg;
    include?: GenericIncludeArg;
  }): Promise<GenericPaginatedResponse<TEntity>>;

  /**
   * Retrieves a single entity based on unique criteria.
   * @param args The arguments for finding a unique entity.
   * @returns A promise that resolves with the found entity.
   */
  findOne(args: TFindUniqueArgs): Promise<TEntity>;

  /**
   * Updates an existing entity.
   * @param findArgs The unique criteria to find the entity to update.
   * @param updateArgs The data to update the entity with.
   * @returns A promise that resolves with the updated entity.
   */
  update(findArgs: TFindUniqueArgs, updateArgs: TUpdateArgs): Promise<TEntity>;

  /**
   * Removes an entity.
   * @param findArgs The unique criteria to find the entity to remove.
   * @param deleteArgs Additional arguments for the delete operation.
   * @returns A promise that resolves with the removed entity.
   */
  remove(findArgs: TFindUniqueArgs, deleteArgs: TDeleteArgs): Promise<TEntity>;
}
