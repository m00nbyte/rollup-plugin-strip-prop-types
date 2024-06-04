const assert = require('assert');
const { rollup } = require('rollup');
const tsConfigPaths = require('rollup-plugin-tsconfig-paths');
const typescript = require('rollup-plugin-typescript2');
const external = require('rollup-plugin-peer-deps-external');
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const async = require('async');

const stripPropTypes = require('../dist/cjs/index.min.js');

const buildExample = async (path, options, keywords, expect) => {
    const bundle = await rollup({
        input: path,
        external: ['react', 'prop-types'],
        plugins: [
            tsConfigPaths(),
            typescript(),
            external(),
            commonjs(),
            babel({
                extensions: ['.jsx', '.tsx'],
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            }),
            stripPropTypes(options)
        ]
    });

    const { output } = await bundle.generate({ format: 'cjs' });

    keywords.forEach((word) => assert.strictEqual(output[0].code.includes(word), expect));
};

async.eachLimit(['jsx', 'tsx'], 1, (fileType, callback) => {
    const filePath = `test/fixtures/component.${fileType}`;
    const keywords = ['prop-types', 'propTypes'];
    const include = [`test/fixtures/*.${fileType}`];

    describe(`test: ${fileType}`, () => {
        it('should strip prop-types', async () => await buildExample(filePath, { include }, keywords, false));
        it('should not strip prop-types', async () =>
            await buildExample(filePath, { include, exclude: [filePath] }, keywords, true));
        it('should strip additional imports', async () =>
            await buildExample(filePath, { include, imports: ['react'] }, [...keywords, 'react'], false));
    });

    callback();
});
