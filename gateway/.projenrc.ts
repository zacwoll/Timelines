import {
  ArrowParens,
  NodePackageManager,
  QuoteProps,
  TrailingComma,
  TypeScriptModuleResolution,
  Transform,
} from "projen/lib/javascript";
import { TypeScriptAppProject } from "projen/lib/typescript";

const project = new TypeScriptAppProject({
  defaultReleaseBranch: "main",
  name: "gateway",
  projenrcTs: true,
  srcdir: ".",
  deps: [
    "express", // Server library
    "amqplib", // RabbitMQ library
    "dotenv", // environment variables
  ],
  devDeps: [
    "@types/express", // TypeScript definitions for Express
    "@types/amqplib", // TypeScript definitions for amqplib
    "@typescript-eslint/eslint-plugin", // TypeScript ESLint plugin
    "@typescript-eslint/parser", // TypeScript ESLint parser
    "@types/supertest",
    "supertest",
    "eslint", // ESLint
    "prettier", // Prettier
    "eslint-config-prettier", // Prettier ESLint config to avoid conflicts with ESLint
    "eslint-plugin-prettier", // Runs Prettier as an ESLint rule
  ],
  packageManager: NodePackageManager.NPM, // use npm as the package manager
  eslint: true,
  eslintOptions: {
    dirs: [".", "src"], // Files or glob patterns or directories with source files to lint
    devdirs: ["tests", "build"], // Files or glob patterns or directories with source files that include tests and build tools
    fileExtensions: [".ts"], // File types that should be linted
    ignorePatterns: ["node_modules/", "coverage"], // List of file patterns that should not be linted
    prettier: true, // Enable prettier for code formatting
    tsAlwaysTryTypes: true, // Always try to resolve types under <root>@types directory even it doesn’t contain any source code
    tsconfigPath: "./tsconfig.json", // Path to tsconfig.json which should be used by eslint
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
      rootDir: ".",
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
    include: [
      "src/**/*.ts",
      "test/**/*.ts",
      ".projenrc.ts", // add .projenrc.ts to the include array
      "tsconfig.json",
    ],
  },
  jestOptions: {
    jestConfig: {
      testMatch: ["<rootDir>/test/**/*.test.ts"],
      transform: {
        "^.+\\.tsx?$": new Transform("ts-jest", {
          tsconfig: "./tsconfig.json",
        }),
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
  },
});

project.synth();
