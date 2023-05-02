import {
  ArrowParens,
  NodePackageManager,
  QuoteProps,
  TrailingComma,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptAppProject } from "projen/lib/typescript";

const project = new TypeScriptAppProject({
  defaultReleaseBranch: "main",
  name: "gateway",
  projenrcTs: true,
  deps: [
    "express",
    "amqplib", // RabbitMQ library
  ],
  devDeps: [
    "@types/express", // TypeScript definitions for Express
    "@types/amqplib", // TypeScript definitions for amqplib
    "@typescript-eslint/eslint-plugin", // TypeScript ESLint plugin
    "@typescript-eslint/parser", // TypeScript ESLint parser
    "eslint", // ESLint
    "prettier", // Prettier
    "eslint-config-prettier", // Prettier ESLint config to avoid conflicts with ESLint
    "eslint-plugin-prettier", // Runs Prettier as an ESLint rule
  ],
  packageManager: NodePackageManager.NPM, // use npm as the package manager
  eslint: true,
  eslintOptions: {
    dirs: ["src"], // Files or glob patterns or directories with source files to lint
    devdirs: ["test", "build"], // Files or glob patterns or directories with source files that include tests and build tools
    fileExtensions: [".ts"], // File types that should be linted
    ignorePatterns: ["node_modules/", "coverage"], // List of file patterns that should not be linted
    prettier: true, // Enable prettier for code formatting
    tsAlwaysTryTypes: true, // Always try to resolve types under <root>@types directory even it doesn’t contain any source code
    tsconfigPath: "./gateway/tsconfig.json", // Path to tsconfig.json which should be used by eslint Why ./gateway???
  },
  prettierOptions: {
    settings: {
      arrowParens: ArrowParens.AVOID,
      bracketSpacing: true,
      printWidth: 80,
      quoteProps: QuoteProps.ASNEEDED,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: TrailingComma.ALL,
      useTabs: true,
    },
  },
  tsconfig: {
    compilerOptions: {
      target: "ES2019",
      module: "commonjs",
      lib: ["ESNext"],
      strict: true,
      moduleResolution: TypeScriptModuleResolution.NODE,
      esModuleInterop: true,
      noImplicitAny: true,
      noImplicitReturns: true,
      noImplicitThis: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      baseUrl: ".",
      paths: {
        "*": ["src/*"],
      },
    },
  },
});

project.synth();