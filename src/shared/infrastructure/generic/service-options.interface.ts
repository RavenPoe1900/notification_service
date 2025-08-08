export type DictSection = {
  unique?: Record<string, string>;
  foreignKey?: Record<string, string>;
  [key: string]: any;
};

/**
 * Opciones de configuración para el PrismaGenericService,
 * incluyendo nombres de modelo y diccionarios de errores personalizados.
 */
export interface ServiceOptions {
  modelName?: string;
  errorDictionary?: Record<string, DictSection>;
}
