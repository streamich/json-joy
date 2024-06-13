/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PORT = 9993;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    bundle: path.join(__dirname, '/main.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            onlyCompileBundledFiles: true,
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          },
        }],
        exclude: /(node_modules|__tests__)/,
      },
      {
        test: /\.md$/i,
        use: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
    new HtmlWebpackPlugin({
      title: 'Peritext DOM demo',
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
