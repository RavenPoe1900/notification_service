import {
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../applications/dtos/paginationResponse.dto';

import {
  PrismaCountArgs,
  PrismaCrudDelegate,
  PrismaIncludeArg,
  PrismaOrderByArg,
  PrismaSelectArg,
  PrismaWhereArg,
} from './prisma-crud-delegate.type';
import { DictSection, ServiceOptions, SoftDeleteCfg } from './service-options.interface';
import { GenericCrudService } from 'src/shared/domain/interfaces/generic-crud-service.port';

@Injectable()
export class PrismaGenericService<
  TEntity,
  TCreateArgs extends object,
  TFindManyArgs extends { take?: number; skip?: number; where?: object },
  TFindUniqueArgs extends { where: any },
  TUpdateArgs extends { where: any; data: any },
  TDeleteArgs extends { where: any },
> implements
    GenericCrudService<
      TEntity,
      TCreateArgs,
      TFindManyArgs,
      TFindUniqueArgs,
      TUpdateArgs,
      TDeleteArgs
    >
{
  /* ---------------- Error dictionary ---------------- */
  private static readonly DEFAULT_DICTIONARY: Record<string, DictSection> = {
    default: {
      unique:     { default: 'Unique constraint failed.' },
      foreignKey: { default: 'Foreign key constraint failed.' },
    },
  };

  private readonly errorDictionary: Record<string, DictSection>;
  private readonly modelName: string;

  /* ---------------- Soft-delete config ---------------- */
  private readonly deletedAtField: string;

  constructor(
    private readonly model: PrismaCrudDelegate<
      TEntity,
      TCreateArgs,
      TFindManyArgs,
      TFindUniqueArgs,
      TUpdateArgs,
      TDeleteArgs
    >,
    opts: ServiceOptions & SoftDeleteCfg = {},
  ) {
    this.modelName = opts.modelName ?? 'default';
    this.errorDictionary = {
      ...PrismaGenericService.DEFAULT_DICTIONARY,
      ...(opts.errorDictionary ?? {}),
    };

    this.deletedAtField = opts.deletedAtField ?? 'deletedAt';
  }

  /* --------------------------------------------------------
     Public CRUD methods
     --------------------------------------------------------*/
  async create(args: TCreateArgs): Promise<TEntity> {
    return this.tryPrisma(() => this.model.create(args));
  }

  async count(filter: PrismaCountArgs<TFindManyArgs> = {}): Promise<number> {
    const whereFinal = this.mergeWhere(filter.where);
    return this.tryPrisma(() =>
      this.model.count({ ...(filter as any), ...(whereFinal ? { where: whereFinal as any } : {}) } as PrismaCountArgs<TFindManyArgs>),
    );
  }

  async findAll(
    params: TFindManyArgs & {
      page?: number;
      perPage?: number;
      filter?: PrismaWhereArg<TFindManyArgs>;
    },
  ): Promise<PaginatedResponse<TEntity>> {
    const { page, perPage, filter, ...baseArgs } = params;

    /* Pagination */
    const take = perPage ?? (baseArgs as any).take ?? 10;
    const skip =
      page !== undefined ? (page - 1) * take : ((baseArgs as any).skip ?? 0);

    /* Merge soft-delete filter + external filter */
    const whereMerged = this.mergeWhere(
      (baseArgs as any).where,
      filter as any,
    );

    const findArgs = {
      ...baseArgs,
      skip,
      take,
      ...(whereMerged ? { where: whereMerged } : {}),
    } as unknown as TFindManyArgs;

    const countArgs = (whereMerged ? { where: whereMerged as any } : {}) as PrismaCountArgs<TFindManyArgs>;

    const [totalResults, data] = await this.tryPrisma(() =>
      this.model.$transaction
        ? this.model.$transaction([
            this.model.count(countArgs),
            this.model.findMany(findArgs),
          ])
        : Promise.all([
            this.model.count(countArgs),
            this.model.findMany(findArgs),
          ]),
    );

    const totalPages  = Math.max(1, Math.ceil(totalResults / take));
    const currentPage = page ?? Math.floor(skip / take) + 1;

    return { data, pageInfo: { currentPage, totalPages, totalResults } };
  }

  async findAllCursor(args: {
    cursor?: number | string;
    take?: number;
    where?: PrismaWhereArg<TFindManyArgs>;
    orderBy?: PrismaOrderByArg<TFindManyArgs>;
    select?: PrismaSelectArg<TFindManyArgs>;
    include?: PrismaIncludeArg<TFindManyArgs>;
  }): Promise<PaginatedResponse<TEntity>> {
    const { cursor, take = 20, ...rest } = args;

    const findArgs = {
      ...rest,
      take,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: this.mergeWhere(rest.where),
    } as unknown as TFindManyArgs;

    const data = await this.tryPrisma(() => this.model.findMany(findArgs));
    return {
      data,
      pageInfo: {
        currentPage: 1,
        totalPages: 1,
        totalResults: data.length,
      },
    };
  }

  async findOne(args: TFindUniqueArgs): Promise<TEntity> {
    /* Apply soft-delete filter to `where` */
    const where = this.mergeWhere(args.where);
    const item  = await this.tryPrisma(() => this.model.findUnique({ ...args, where }));
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async update(
    findArgs: TFindUniqueArgs,
    updateArgs: TUpdateArgs,
  ): Promise<TEntity> {
    const where = this.mergeWhere(findArgs.where);
    return this.tryPrisma(async () => {
      try {
        return await this.model.update({ ...updateArgs, where });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025')
          {throw new NotFoundException('Item not found');}
        throw e;
      }
    });
  }

  async remove(
    findArgs: TFindUniqueArgs,
    deleteArgs: TDeleteArgs,
  ): Promise<TEntity> {
    const where = this.mergeWhere(findArgs.where);

    /* Soft-delete: set deletedAt = now() */
    const updateData = {
      ...(deleteArgs as any).data,
      [this.deletedAtField]: new Date(),
    };
    return this.update({ ...findArgs, where }, { ...(deleteArgs as any), data: updateData });
  }

  /* --------------------------------------------------------
     Internal utilities
     --------------------------------------------------------*/
  /** Adds condition `deletedAt IS NULL` when soft-delete is enabled */
  private mergeWhere(
    ...fragments: (Record<string, any> | undefined)[]
  ): Record<string, any> | undefined {
    const merged = fragments.filter(Boolean).reduce(
      (acc, cur) => ({ ...acc, ...cur }),
      {},
    );

    return Object.keys(merged).length
      ? { ...merged, [this.deletedAtField]: null }
      : { [this.deletedAtField]: null };
  }

  /** Helper to wrap Prisma errors */
  private async tryPrisma<TResult>(fn: () => Promise<TResult>): Promise<TResult> {
    try {
      return await fn();
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  private handlePrismaError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const code         = e.code;
      const uniqueField  = Array.isArray(e.meta?.target)
        ? e.meta.target[0]
        : (e.meta?.target as string | undefined);
      const foreignField = e.meta?.field_name as string | undefined;

      const dict    = this.errorDictionary[this.modelName] ?? this.errorDictionary.default;
      const message =
        code === 'P2002'
          ? dict.unique?.[uniqueField ?? '']           ?? dict.unique!.default
          : code === 'P2003'
          ? dict.foreignKey?.[foreignField ?? '']      ?? dict.foreignKey!.default
          : 'Database error';

      const status = ['P2002', 'P2003', 'P2004', 'P2025'].includes(code) ? 400 : 500;
      throw new HttpException({ statusCode: status, message }, status);
    }

    if (e instanceof HttpException) throw e;

    throw new HttpException(
      {
        statusCode: 500,
        message: 'Server Error: an unexpected error occurred processing the request',
      },
      500,
    );
  }
}