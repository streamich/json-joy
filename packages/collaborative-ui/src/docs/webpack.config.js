/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const PORT = 9963;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    bundle: __dirname + '/main.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.md$/i,
        use: 'raw-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    sourceMapFilename: '[file].map',
    asyncChunks: true,
    path: path.resolve(__dirname, 'dist'),
    publicPath: `http://localhost:${PORT}/`,
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Nice UI',
    }),
  ],
  devServer: {
    port: PORT,
    hot: false,
    historyApiFallback: {
      index: '',
      disableDotRule: true,
    },
  },
};
