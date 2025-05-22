# Phrase Developer Portal

## Publishing Changes

Changes are automatically deployed to production after pushing to the default branch.

You can access the Mintlify dashboard [here](https://dashboard.mintlify.com/phrase/phrase).

## Development

### Prerequisites

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview documentation changes locally. To install it, run the following command:

```
npm i -g mintlify
```

Install project dependencies:

```
npm install
```

### Starting the Development Server

To start the development server, run the following command from the root of your documentation project:

```
npm run dev
```

**Note:** Search functionality is not available in development mode.

### Custom Styles

Custom styles should be placed in the `styles/global.scss` file. These styles will be:

- Automatically compiled when you run `npm run dev`
- Processed before committing code via Husky pre-commit hooks

This ensures your custom styling is properly applied throughout the documentation.

### Sorting and converting OpenAPI Specification

Mintlify displays paths directly from the OpenAPI specification in the order they appear in the source file.
To sort them alphabetically, use the custom Node.js script. Example usage:

```
node scripts/convert-spec.js --v3 open-api-source.json -o output.json
```

If you're using an OpenAPI specification in version 2 (Swagger - YAML or JSON), use the `--v2` flag.
The file will be converted to version 3 and sorted automatically. Example usage:

```
node scripts/convert-spec.js --v2 swagger.json -o output.json
```
