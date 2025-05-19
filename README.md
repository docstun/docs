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

### Starting the Development Server

To start the development server, run the following NPM command from the root of your documentation project:

```
npm run dev
```

**Note:** Search functionality is not available in development mode.

## Sorting OpenAPI Specification Paths

Mintlify displays paths directly from the OpenAPI specification in the order they appear in the source file.
To sort them alphabetically, use a custom Node.js script. Example usage:

```
node scripts/spec-sort.js -i source.json -o output.json
```
