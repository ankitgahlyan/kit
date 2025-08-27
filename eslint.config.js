const toolchainConfig = require('@ton/toolchain');
const globals = require('globals');
const { globalIgnores } = require('eslint/config');

module.exports = [
    ...toolchainConfig,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                // ...globals.nodeBuiltin
            },
        },
        rules: {},
    },
    globalIgnores(['dist/*', 'dist_extension/*']),
];
