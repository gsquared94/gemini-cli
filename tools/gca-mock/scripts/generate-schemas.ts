import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs';

const require = createRequire(import.meta.url);
const TJS = require('typescript-json-schema');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.resolve(__dirname, '../../');

const config = {
  path: path.join(projectRoot, 'tools/gca-mock/tsconfig.json'),
  type: '*',
};

const outputDir = path.join(__dirname, '../client/src/schemas');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Map of Schema Name -> Type Name
const schemasToGenerate = {
  LoadCodeAssistResponse: 'LoadCodeAssistResponse',
  GenerateContentResponse: 'CaGenerateContentResponse',
  CountTokensResponse: 'CaCountTokenResponse',
  ListExperimentsResponse: 'ListExperimentsResponse',
  RetrieveUserQuotaResponse: 'RetrieveUserQuotaResponse',
  OnboardUserResponse: 'OnboardUserResponse', // Or LongRunningOperationResponse depending on how it's used
  FetchAdminControlsResponse: 'FetchAdminControlsResponse',
  // Add others as needed
};

console.log('Generating schemas...');

// Generate schemas
// Note: We might need to adjust creating the program to include all necessary files
// specific to how typescript-json-schema works with project references or massive projects.
// For now, we point to the tsconfig which includes core.

const program = TJS.programFromConfig(
  path.resolve(__dirname, '../tsconfig.schema.json'),
);

const generator = TJS.buildGenerator(program, {
  required: true,
  ref: false, // Don't use $ref, inline everything for RJSF simplicity if possible, or handle refs in UI
  ignoreErrors: true,
});

for (const [schemaName, typeName] of Object.entries(schemasToGenerate)) {
  try {
    const schema = generator?.getSchemaForSymbol(typeName);

    if (schema) {
      fs.writeFileSync(
        path.join(outputDir, `${schemaName}.json`),
        JSON.stringify(schema, null, 2),
      );
      console.log(`Generated ${schemaName}.json`);
    } else {
      console.warn(`Failed to generate schema for ${typeName}`);
    }
  } catch (e) {
    console.error(`Error generating ${typeName}:`, e);
  }
}
