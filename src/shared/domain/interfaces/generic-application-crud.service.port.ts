// src/shared/domain/interfaces/generic-application-crud.service.port.ts

import { GenericPaginatedResponse } from '../types/pagination.types'; // Your generic pagination type from the domain

/**
 * Generic interface for an Application CRUD Service.
 * This interface defines the high-level operations that a presentation layer
 * (e.g., a Controller) can invoke for managing entities,
 * using DTOs for input and output.
 *
 * @template TCreateDto The DTO type for creating an entity.
 * @template TUpdateDto The DTO type for updating an entity.
 * @template TResponseDto The DTO type for the response (e.g., after create, find, update).
 * @template TPaginationDto The DTO type for pagination and filtering parameters.
 * @template TId The type of the entity's ID (e.g., number, string).
 */
export interface GenericApplicationCrudServicePort<
  TCreateDto,
  TUpdateDto,
  TResponseDto,
  TPaginationDto,
  TId,
> {
  /**
   * Creates a new entity.
   * @param dto The DTO containing data for creating the entity.
   * @returns A promise that resolves with the response DTO of the created entity.
   */
  create(dto: TCreateDto): Promise<TResponseDto>;

  /**
   * Retrieves a paginated list of entities.
   * @param paginationDto The DTO containing pagination and filter parameters.
   * @returns A promise that resolves with a paginated response of entities.
   */
  findAll(
    paginationDto: TPaginationDto,
  ): Promise<GenericPaginatedResponse<TResponseDto>>;

  /**
   * Retrieves a single entity by its ID.
   * @param id The ID of the entity to retrieve.
   * @returns A promise that resolves with the response DTO of the found entity, or null if not found.
   */
  findOne(id: TId): Promise<TResponseDto | null>;

  /**
   * Updates an existing entity.
   * @param id The ID of the entity to update.
   * @param dto The DTO containing data for updating the entity.
   * @returns A promise that resolves with the response DTO of the updated entity.
   */
  update(id: TId, dto: TUpdateDto): Promise<TResponseDto>;

  /**
   * Removes an entity by its ID.
   * @param id The ID of the entity to remove.
   * @returns A promise that resolves with the response DTO of the removed entity.
   */
  remove(id: TId): Promise<TResponseDto>;
}
