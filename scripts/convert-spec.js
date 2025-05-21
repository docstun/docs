import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { exit } from 'process';
import yargs from 'yargs/yargs';
import { promisify } from 'util';
import { hideBin } from 'yargs/helpers';
import swagger2openapi from 'swagger2openapi';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const convertSwagger = promisify(swagger2openapi.convertObj);

const argv = yargs(hideBin(process.argv))
  .option('v3', {
    alias: 'i',
    type: 'string',
    description: 'Path to the input OpenAPI JSON file',
    demandOption: false,
  })
  .option('v2', {
    alias: 's',
    type: 'string',
    description: 'Path to the input Swagger v2 YAML file to convert to OpenAPI v3',
    demandOption: false,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Path to the output OpenAPI JSON file',
    demandOption: true,
  })
  .check((argv) => {
    if (!argv.v3 && !argv.v2) {
      throw new Error('Either --v3 or --v2 must be provided');
    }
    if (argv.v3 && argv.v2) {
      throw new Error('Only one of --v3 or --v2 should be provided, not both');
    }
    return true;
  })
  .parse();

const outputPath = path.resolve(argv.output);

/**
 * Sorts API paths based on the first tag of the first method
 * 
 * @param {Object} paths - An object containing API paths where each path has method objects
 * @param {Object} paths[path] - Method objects for a specific path
 * @param {Object} paths[path][method] - Method object containing tags and other properties
 * @param {Array} paths[path][method].tags - Array of tags for the method
 * 
 * @returns {Object} A new object with the same paths but sorted by their first tag alphabetically
 */
const sortPaths = (paths) => {
  const sortedPaths = {};
  
  const pathsWithTags = Object.keys(paths).map(path => {
    const methods = paths[path];
    const firstMethod = Object.keys(methods).find(method => 
      methods[method].tags && methods[method].tags.length > 0
    );
    const tag = firstMethod && methods[firstMethod].tags ? methods[firstMethod].tags[0] : '';
    return { path, tag };
  });
  
  pathsWithTags.sort((a, b) => a.tag.localeCompare(b.tag));
  
  pathsWithTags.forEach(({ path }) => {
    sortedPaths[path] = paths[path];
  });
  
  return sortedPaths;
};

const parseFileContent = (fileContent) => {
  try {
    // Try to parse as YAML first
    return yaml.load(fileContent);
  } catch (yamlError) {
    // If YAML parsing fails, try JSON
    try {
      return JSON.parse(fileContent);
    } catch (jsonError) {
      throw new Error('Failed to parse file as YAML or JSON');
    }
  }
};

const main = async () => {
  try {
    let jsonData;

    if (argv.v2) {
      const swaggerPath = path.resolve(argv.v2);
      console.log(`Converting Swagger v2 from ${swaggerPath} to OpenAPI v3...`);
      const fileContent = await readFile(swaggerPath, 'utf8');
      const swaggerContent = parseFileContent(fileContent);
      const options = { patch: true, warnOnly: true };
      const converted = await convertSwagger(swaggerContent, options);
      jsonData = converted.openapi;
    } else {
      const inputPath = path.resolve(argv.v3);
      console.log(`Processing OpenAPI v3 from ${inputPath}...`);
      const fileContent = await readFile(inputPath, 'utf8');
      jsonData = parseFileContent(fileContent);
    }

    if (!jsonData.paths) {
      console.error('No paths found in the API spec');
      exit(1);
    }

    console.log('Sorting paths by tags...');
    jsonData.paths = sortPaths(jsonData.paths);
    await writeFile(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`Sorted OpenAPI JSON saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    exit(1);
  }
};

main();
