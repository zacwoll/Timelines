import {
  ArrowParens,
  NodePackageManager,
  QuoteProps,
  TrailingComma,
  TypeScriptModuleResolution,
} from "projen/lib/javascript";
import { TypeScriptAppProject } from "projen/lib/typescript";
import { JsonFile } from "projen";

const project = new TypeScriptAppProject({
  defaultReleaseBranch: "main",
  name: "Frontend",
  projenrcTs: true,
  srcdir: ".",
  deps: [
    "dotenv", // environment variables
    "axios",
    "@angular/core", 
    "@angular/common",
    '@angular/router',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    // ... other Angular dependencies
  ],
  devDeps: [
    "@typescript-eslint/eslint-plugin", // TypeScript ESLint plugin
    "@typescript-eslint/parser", // TypeScript ESLint parser
    "eslint", // ESLint
    "prettier", // Prettier
    "eslint-config-prettier", // Prettier ESLint config
    "eslint-plugin-prettier", // Runs Prettier as an ESLint rule
    "@angular/cli", 
    "@angular/compiler-cli",
    "@angular-devkit/build-angular",
  ],
  packageManager: NodePackageManager.NPM,
  eslint: true,
  eslintOptions: {
    dirs: ["src", "e2e"], // e2e for end-to-end tests in Angular
    devdirs: ["tests", "build"],
    fileExtensions: [".ts", ".html", ".scss"], // include HTML and SCSS for Angular
    ignorePatterns: ["node_modules/", "coverage"],
    prettier: true,
    tsAlwaysTryTypes: true,
    tsconfigPath: "./tsconfig.app.json", // point to Angular's tsconfig
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
      target: "ES2020",
      module: "CommonJS",
      lib: ["ESNext", "DOM"],
      moduleResolution: TypeScriptModuleResolution.NODE,
      esModuleInterop: true,
      declaration: false,
      baseUrl: "./",
      paths: {
        "*": ["src/*"],
      },
    },
    include: [
      "src/**/*.ts",
      ".projenrc.ts",
    ],
    exclude: [
      "node_modules",
      "build",
      "dist",
      "e2e",
    ]
  },
  gitignore: ['.env'],
});

new JsonFile(project, 'tsconfig.app.json', {
    obj: {
        extends: "../tsconfig.json",
        compilerOptions: {
          module: "esnext",
          lib: ["ESNext", "DOM"],
          outDir: "./out-tsc/app", // Angular's compiled output
          sourceMap: true,
          experimentalDecorators: true,
          noImplicitAny: true,
          noImplicitReturns: true,
          noImplicitThis: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          strict: true,
          types: [],
        },
        files: [
            "src/main.ts",
        ],
        include: [
          "src/**/*.ts"
        ],
        exclude: [
          "node_modules",
          "test.ts",
          "**/*.spec.ts"
        ]
      },
  });
  
project.synth();
