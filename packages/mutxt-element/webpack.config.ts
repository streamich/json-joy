import path from 'path';
import webpack, {type Configuration} from 'webpack';

const config: Configuration = {
  mode: 'production',
  entry: './src/index.ts',
  target: ['web', 'es2020'],
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'mutxt-element.min.js',
    globalObject: 'self',
    library: {
      type: 'window',
      name: 'mutxtElement',
    },
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.js', '.jsx'],
  },
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
  performance: {
    hints: false,
  },
  plugins: [
    // Collapse all dynamic `import()` chunks (e.g. React.lazy) into the main bundle
    // so consumers can load the editor with a single <script> tag.
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff2?|ttf|eot)$/,
        type: 'asset/inline',
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        type: 'asset/inline',
      },
    ],
  },
};

export default config;
