import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } } },
    rules: { "no-constant-condition": "error", "no-dupe-keys": "error", "no-unreachable": "error" },
  },
  globalIgnores([".next/**", "node_modules/**"]),
]);
