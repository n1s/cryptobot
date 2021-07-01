module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: [
    "no-floating-promise"
  ],
  rules: {
    "no-floating-promise/no-floating-promise": 2
  },
};
