const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

const projectRoot = path.resolve(__dirname, '../../');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.tsx',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  target: 'web',
  // resolve: {
  //   extensions: ['.ts', '.js', '.json', '.ttf'],
  //   fallback: {
  //     path: path.resolve(projectRoot, 'node_modules', 'path-browserify'),
  //   },
  // },
  plugins: [
    new MonacoWebpackPlugin(),
    new htmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};
