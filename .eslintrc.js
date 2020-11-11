module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'babel',
    'react',
  ],
  rules: {
    'react/jsx-filename-extension': [1, {
      extensions: ['.js', '.jsx'],
    }],
    'no-use-before-define': [0], // 不允许使用前定义
    'no-unused-vars': [1], // 不允许没有使用的变量
    'react/jsx-props-no-spreading': [0], // 扩展运算符
    'no-nested-ternary': [0], // 不允许嵌套三元
    'arrow-parens': ['warn', 'as-needed'], // 箭头函数格式 (as-needed为单参数情况无需括号)
    'react/static-property-placement': [0], // 静态属性书写位置
    'react/no-unused-prop-types': [1], // 没有使用到的propTypes
    'func-names': [1, 'as-needed'], // 函数名
    'space-before-function-paren': [1, {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }], // 函数参数前是否要空格
  },
};
