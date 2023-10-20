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
  name: "Backend",
  projenrcTs: true,
  srcdir: ".",
  deps: [
    "cookie",
    "cookie-parser",
    "cors",
    "dotenv", // environment variables
    "socket.io",
    "axios",
    "discord.js",
    "express",
    "http",
    "https",
    "fs",
    "node-fetch@2",
    "path",
    "@types/express",
    "@types/express-serve-static-core",
  ],
  devDeps: [
    "@typescript-eslint/eslint-plugin", // TypeScript ESLint plugin
    "@typescript-eslint/parser", // TypeScript ESLint parser
    "@types/supertest",
    "supertest",
    "eslint", // ESLint
    "prettier", // Prettier
    "eslint-config-prettier", // Prettier ESLint config to avoid conflicts with ESLint
    "eslint-plugin-prettier", // Runs Prettier as an ESLint rule
    "@types/cookie",
    "@types/cors",
    "@types/node-fetch@2",
    "@types/cookie-parser",
    "@types/socket.io",
  ],
  packageManager: NodePackageManager.NPM, // use npm as the package manager
  eslint: true,
  eslintOptions: {
    dirs: [".", "src"], // Files or glob patterns or directories with source files to lint
    devdirs: ["tests", "build"], // Files or glob patterns or directories with source files that include tests and build tools
    fileExtensions: [".ts"], // File types that should be linted
    ignorePatterns: ["node_modules/", "coverage", "*.d.ts"], // List of file patterns that should not be linted
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
      target: "ES2022",
      module: "commonjs", //commonjs
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
    exclude: ["lib", "legacy"],
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
  gitignore: [".env"],
});

// project.package.addField("type", "module");

// const precompileTask = project.tasks.tryFind('pre-compile') || project.addTask('pre-compile');

// // Prepend the step to remove .d.ts files to the compile task
// precompileTask.prependExec('find ./lib -name "*.d.ts" -delete');

project.synth();
