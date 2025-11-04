const {
    defineConfig,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const node = require("eslint-plugin-node");

const {
    fixupPluginRules,
} = require("@eslint/compat");

const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,

        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: __dirname,
        },

        globals: {
            ...globals.node,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        import: fixupPluginRules(_import),
        node,
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),

    rules: {
        "no-console": "off",
    },
}]);
