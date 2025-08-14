import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Aquí puedes añadir tus reglas personalizadas, por ejemplo:
      // "no-console": "warn",
      // "@typescript-eslint/no-unused-vars": "warn",
    },
    // Define qué archivos debe procesar esta configuración
    files: ["**/*.ts", "**/*.js"],
    // Opcional: Ignorar archivos/directorios específicos
    ignores: ["node_modules/", "dist/", "*.js"], // Ajusta según tus necesidades
  },
];