type Prop<T, K extends PropertyKey, Fallback = never> = K extends keyof T
  ? T[K]
  : Fallback;

export type PrismaWhereArg<T> = Prop<T, 'where', Record<string, any>>;
export type PrismaOrderByArg<T> = Prop<T, 'orderBy', unknown>;
export type PrismaSelectArg<T> = Prop<T, 'select', unknown>;
export type PrismaIncludeArg<T> = Prop<T, 'include', unknown>;

export type PrismaCountArgs<TFindManyArgs> = {
  where?: PrismaWhereArg<TFindManyArgs>;
};

/**
 * Define la interfaz mínima que un delegado de Prisma (e.g., prismaService.user)
 * debe cumplir para ser usado por PrismaGenericService.
 * Esto asegura que el servicio genérico solo dependa de un subconjunto de métodos de Prisma.
 */
export type PrismaCrudDelegate<
  TEntity,
  TCreateArgs extends object,
  TFindManyArgs extends object,
  TFindUniqueArgs extends object,
  TUpdateArgs extends object,
  TDeleteArgs extends object,
> = {
  create(args: TCreateArgs): Promise<TEntity>;
  count(args?: PrismaCountArgs<TFindManyArgs>): Promise<number>;
  findMany(args: TFindManyArgs): Promise<TEntity[]>;
  findUnique(args: TFindUniqueArgs): Promise<TEntity | null>;
  update(args: TUpdateArgs): Promise<TEntity>;
  delete(args: TDeleteArgs): Promise<TEntity>;
  $transaction?: <A extends Promise<unknown>[]>(
    ops: [...A],
  ) => Promise<{ [K in keyof A]: Awaited<A[K]> }>;
};
