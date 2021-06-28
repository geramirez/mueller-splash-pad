module.exports = {
  env: {
    node: true,
    es6: true,
    es2017: true,
    es2020: true,
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  parserOptions: {
    ecmaVersion: 12,
  },
};
