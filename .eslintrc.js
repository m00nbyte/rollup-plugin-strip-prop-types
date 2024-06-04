module.exports = {
    parser: '@babel/eslint-parser',
    extends: ['standard', 'standard-react', 'typescript', 'typescript/react'],
    env: {
        es6: true,
        jest: true
    },
    plugins: ['react', 'typescript', 'prettier'],
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        semi: [2, 'always'],
        indent: ['error', 4],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-boolean-value': 0,
        'space-before-function-paren': 0,
        'prettier/prettier': 'error'
    }
};
