// To run the script, use the following command:
// node scripts/spec-sort.js -i path/to/input.json -o path/to/output.json

import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { promisify } from 'util';
import { exit } from 'process';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Path to the input OpenAPI JSON file',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Path to the output OpenAPI JSON file',
    demandOption: true,
  })
  .parse();

const inputPath = path.resolve(argv.input);
const outputPath = path.resolve(argv.output);

const isValidJson = (json) => {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Sorts API paths based on the first tag of the first method
 * 
 * @param {Object} paths - An object containing API paths where each path has method objects
 * @param {Object} paths[path] - Method objects for a specific path
 * @param {Object} paths[path][method] - Method object containing tags and other properties
 * @param {Array} paths[path][method].tags - Array of tags for the method
 * 
 * @returns {Object} A new object with the same paths but sorted by their first tag alphabetically
 * 
 * @example
 * const sortedPaths = sortPaths({
 *   '/users': {
 *     'get': { tags: ['Users'] }
 *   },
 *   '/products': {
 *     'get': { tags: ['Products'] }
 *   }
 * });
 * // Returns paths sorted with 'Products' before 'Users'
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

const main = async () => {
  try {
    const data = await readFile(inputPath, 'utf8');
    if (!isValidJson(data)) {
      console.error('Invalid JSON format');
      exit(1);
    }

    const jsonData = JSON.parse(data);
    if (!jsonData.paths) {
      console.error('No paths found in the OpenAPI JSON file');
      exit(1);
    }

    jsonData.paths = sortPaths(jsonData.paths);
    await writeFile(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`Sorted OpenAPI JSON saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    exit(1);
  }
};

main();

