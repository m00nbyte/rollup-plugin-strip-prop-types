# rollup-plugin-strip-prop-types

[![npm version](https://img.shields.io/npm/v/@m00nbyte/rollup-plugin-strip-prop-types.svg)](https://www.npmjs.org/package/@m00nbyte/rollup-plugin-strip-prop-types) [![npm downloads](https://img.shields.io/npm/dm/@m00nbyte/rollup-plugin-strip-prop-types)](https://www.npmjs.org/package/@m00nbyte/rollup-plugin-strip-prop-types)

---

## Features

-   Remove `propTypes` and `defaultProps` statements from react components
-   Remove `require` and `import` statements for the `prop-types` package
-   Custom import paths
-   TypeScript support

## Installation

```bash
npm install -D @m00nbyte/rollup-plugin-strip-prop-types
yarn add -D @m00nbyte/rollup-plugin-strip-prop-types
```

## Usage

```js
// rollup.config.js
import stripPropTypes from '@m00nbyte/rollup-plugin-strip-prop-types';

export default {
    plugins: [
        stripPropTypes({
            include: ['**/*.jsx', '**/*.tsx'],
            exclude: ['node_modules/**'],
            imports: ['/some_other_module'],
            sourceMap: true
        })
    ]
};
```

## Options

### `include`

Type: `String | RegExp | Array[...String|RegExp]`
Default: `['**/*.jsx', '**/*.tsx']`<br />

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should operate on. If defined, it will overwrite the default values.

### `exclude`

Type: `String | RegExp | Array[...String|RegExp]`
Default: `['node_modules/**']`<br />

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files in the build the plugin should ignore. If defined, it will overwrite the default values.

### `imports`

Type: `Array[...String]`
Default: `['prop-types']`<br />

By default only `require` and `import` statements for the `prop-types` package are removed. Additional module paths can be defined. These paths will be merged with the default values without duplicates.

### `sourceMap`

Type: `Boolean`
Default: `true`<br />

Set to `false` if source maps are not used.

## Contribution

Feel free to submit issues or pull requests.

## Like my work?

This project needs a :star: from you.
Don't forget to leave a star.

<a href="https://www.buymeacoffee.com/m00nbyte" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="217" height="60">
</a>

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
