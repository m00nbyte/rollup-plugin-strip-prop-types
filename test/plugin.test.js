import assert from 'assert';
import { rollup } from 'rollup';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import typescript from 'rollup-plugin-typescript2';
import external from 'rollup-plugin-peer-deps-external';
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import stripPropTypes from '../dist/index.es.min.js';

const buildExample = async (exampleConfig) => {
    const bundle = await rollup({
        input: 'test/fixtures/component.tsx',
        external: ['react', 'prop-types'],
        plugins: [
            tsConfigPaths(),
            typescript(),
            external(),
            dynamicImportVars(),
            commonjs(),
            babel({
                extensions: ['tsx'],
                presets: ['@babel/preset-env', '@babel/preset-react'],
                babelHelpers: 'bundled',
                exclude: 'node_modules/**'
            }),
            stripPropTypes(exampleConfig)
        ]
    });

    const { output } = await bundle.generate({ format: 'cjs' });

    return output;
};

describe('rollup-plugin-strip-prop-types', () => {
    it('should strip propTypes', async () => {
        const output = await buildExample({
            include: ['test/fixtures/*.tsx']
        });

        assert.strictEqual(output[0].code.includes('prop-types'), false);
        assert.strictEqual(output[0].code.includes('propTypes'), false);
    });

    it('should not strip propTypes', async () => {
        const output = await buildExample({
            include: ['test/fixtures/*.tsx'],
            exclude: ['test/fixtures/component.tsx']
        });

        assert.strictEqual(output[0].code.includes('prop-types'), true);
        assert.strictEqual(output[0].code.includes('propTypes'), true);
    });

    it('should strip additional imports', async () => {
        const output = await buildExample({
            include: ['test/fixtures/*.tsx'],
            imports: ['react']
        });

        assert.strictEqual(output[0].code.includes('prop-types'), false);
        assert.strictEqual(output[0].code.includes('propTypes'), false);
        assert.strictEqual(output[0].code.includes('react'), false);
    });
});
