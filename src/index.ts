import { PluginContext } from 'rollup';
import { createFilter, FilterPattern } from '@rollup/pluginutils';
import { Program, Identifier } from 'estree';
import { walk, Node } from 'estree-walker-ts';
import { parse } from 'acorn';
import MagicString from 'magic-string';

import { createRequire } from 'module';
const rollup = createRequire(import.meta.url)('rollup');

// #region helpers
/**
 * Checks if a node is a `ImportDeclaration` for `import` statements with specific imports.
 *
 * @param {Node} node - The AST node to check.
 * @param {string[]} imports - The imports to match against.
 * @returns {boolean} - True if the node matches the expressions.
 */
const isImportDeclaration = (node: Node, imports: string[]): boolean =>
    node?.type === 'ImportDeclaration' && imports.includes(node?.source?.value as string);

/**
 * Checks if a node is a `CallExpression` for `require` statements with specific imports.
 *
 * @param {Node} node - The AST node to check.
 * @param {string[]} imports - The paths to match against.
 * @returns {boolean} - True if the node matches the expressions.
 */
const isCallExpression = (node: Node, imports: string[]): boolean =>
    node?.type === 'CallExpression' &&
    node?.callee?.type === 'Identifier' &&
    node?.callee?.name === 'require' &&
    node?.arguments?.length === 1 &&
    node?.arguments?.[0]?.type === 'Literal' &&
    imports.includes(node?.arguments?.[0]?.value as string);

/**
 * Checks if a node is an `ExpressionStatement` for `propTypes` or `defaultProps`.
 *
 * @param {Node} node - The AST node to check.
 * @returns {boolean} - True if the node matches the expressions.
 */
const isExpressionStatement = (node: Node): boolean =>
    node?.type === 'ExpressionStatement' &&
    node?.expression?.type === 'AssignmentExpression' &&
    node?.expression?.left?.type === 'MemberExpression' &&
    ['propTypes', 'defaultProps'].includes((node?.expression?.left?.property as Identifier)?.name as string);

/**
 * Determines if a node should be stripped based on it's type and specific imports.
 *
 * @param {Node} node - The AST node to check.
 * @param {string[]} imports - Additional imports to match against.
 * @returns {boolean} - True if the node should be stripped.
 */
const shouldBeStripped = (node: Node, imports: string[]): boolean =>
    isImportDeclaration(node, imports) || isCallExpression(node, imports) || isExpressionStatement(node);

/**
 * Formats the filter pattern based on the input type and returns an array of patterns.
 *
 * @param {FilterPattern | undefined} pattern - The filter pattern to format.
 * @param {string[]} fallback - The fallback array to return if the pattern is invalid.
 * @returns {string[]} - An array of formatted filter patterns.
 */
const formatPatterns = (pattern: FilterPattern | undefined, fallback: string[]): string[] =>
    ((typeof pattern === 'string' || pattern instanceof RegExp) && [pattern]) ||
    (Array.isArray(pattern) && pattern) ||
    fallback;

/**
 * Validates the types of options parameters.
 *
 * @param {object} options - The options object to validate.
 * @param {FilterPattern} [options.include] - The include pattern(s).
 * @param {FilterPattern} [options.exclude] - The exclude pattern(s).
 * @param {string[]} [options.imports] - The import paths.
 * @param {boolean} [options.sourceMap] - Whether to generate source maps.
 * @throws {Error} - Throws an error if any parameter has an invalid type.
 */
const validateOptions = (options: {
    include?: FilterPattern;
    exclude?: FilterPattern;
    imports?: string[];
    sourceMap?: boolean;
}): void =>
    Object.entries(options).forEach(
        ([key, value]) =>
            value &&
            ((key === 'imports' && !Array.isArray(value)) ||
                (key === 'sourceMap' && !(typeof value === 'boolean')) ||
                (!(typeof value === 'string') && !(value instanceof RegExp) && !Array.isArray(value))) &&
            (() => {
                throw new Error(`${process.env.MODULE_NAME} | options.${key} | invalid type`);
            })()
    );
// #endregion

/**
 * A Rollup plugin to strip prop-types from code.
 *
 * @param {object} options - The options for the plugin.
 * @param {FilterPattern} [options.include] - A pattern or array of patterns to include.
 * @param {FilterPattern} [options.exclude] - A pattern or array of patterns to exclude.
 * @param {string[]} [options.imports] - Additional imports to strip.
 * @param {boolean} [options.sourceMap] - Whether to generate source maps.
 * @returns {object | boolean} - The Rollup plugin object.
 */
const stripPropTypes = (options: {
    include?: FilterPattern;
    exclude?: FilterPattern;
    imports?: string[];
    sourceMap?: boolean;
}): object | boolean => {
    // Get rollup version
    const [major = 0, minor = 0] = rollup.VERSION.split('.').map(Number);

    // Check rollup version
    if (major === 0 && minor < 60) {
        throw new Error(`"${process.env.MODULE_NAME}" requires rollup 0.60.0 or higher.`);
    }

    // Check parameter types
    validateOptions(options);

    // Define filter patterns
    const include = Array.from(new Set(formatPatterns(options?.include, ['**/*.jsx', '**/*.tsx'])));
    const exclude = Array.from(new Set(formatPatterns(options?.exclude, ['node_modules/**'])));

    // Add `prop-types` to the list of paths to strip, along with any additional paths provided
    const imports = Array.from(new Set(['prop-types', ...(options?.imports || [])]));

    // Determine whether to generate source maps
    const sourceMap = options?.sourceMap || false;

    // Create a filter function
    const filter = createFilter(include, exclude) as (id: string) => boolean;

    return {
        name: 'strip-prop-types',
        /**
         * Transforms the code by stripping prop-types.
         *
         * @param {string} code - The source code.
         * @param {string} id - The module ID.
         * @returns {object | null} - The transformed code and source map, or null if the file is excluded.
         */
        transform(this: PluginContext, code: string, id: string): object | null {
            // Skip files that don't match the filter
            if (!filter(id)) return null;

            // Initialize `MagicString` with the original code
            const magicString = new MagicString(code);

            // Parse the code into an AST
            const AST = parse(code, {
                sourceType: 'module',
                ecmaVersion: 6
            }) as Program;

            // Walk through the AST
            walk(AST, {
                enter(node: Node) {
                    // Check if the current node should be stripped
                    if (shouldBeStripped(node, imports)) {
                        // Ensure the node has `start` and `end` properties
                        if (['start', 'end'].every((prop) => prop in node)) {
                            const { start, end } = node as Node & { start: number; end: number };

                            // Add source map locations if needed
                            if (sourceMap) {
                                magicString.addSourcemapLocation(start);
                                magicString.addSourcemapLocation(end);
                            }

                            // Remove the node's code from the original code
                            magicString.remove(start, end);
                        }
                    }
                },
                leave() {}
            });

            return {
                // Format the transformed code
                code: magicString.toString(),
                // Generate the source map if needed
                map: sourceMap ? magicString.generateMap({ hires: true }) : null
            };
        }
    };
};

export default stripPropTypes;
