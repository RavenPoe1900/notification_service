// src/shared/infrastructure/persistence/prisma/utils/prisma-filter-builders.ts

import { Prisma } from '@prisma/client';

/**
 * Builds a complete Prisma 'where' clause object for filtering by a unique ID field.
 * This utility is designed to be directly usable with Prisma's findUnique, update, or delete methods.
 *
 * @template TWhereUniqueInput The specific Prisma model's WhereUniqueInput type (e.g., Prisma.UserWhereUniqueInput).
 * @param idValue The unique identifier value (e.g., number for 'id', string for 'email').
 * @param fieldName The name of the unique field to filter by (defaults to 'id').
 * @returns An object with the structure { where: { [fieldName]: idValue } }.
 */
export function buildPrismaUniqueWhereClause<
  TWhereUniqueInput extends Prisma.AtLeast<any, string>, // <-- Here AtLeast is used with generics
>(
  idValue: number | string,
  fieldName: string = 'id',
): { where: TWhereUniqueInput } {
  // <-- The return type now uses TWhereUniqueInput
  return {
    where: {
      [fieldName]: idValue,
    } as TWhereUniqueInput, // <-- A cast is needed here to satisfy the type
  };
}


/**
 * Builds a complete Prisma 'where' clause object specifically for filtering by the 'id' field.
 * This utility is designed to be directly usable with Prisma's findUnique, update, or delete methods.
 * It assumes 'id' is the unique identifier field.
 *
 * @template TWhereUniqueInput The specific Prisma model's WhereUniqueInput type (e.g., Prisma.UserWhereUniqueInput).
 * @param idValue The unique identifier value (number or string).
 * @returns An object with the structure { where: { id: idValue } }.
 */
export function idWhereClause<
  TWhereUniqueInput extends Prisma.AtLeast<any, string>,
>(idValue: number | string): { where: TWhereUniqueInput } {
  return {
    where: {
      id: idValue,
    } as TWhereUniqueInput,
  };
}
