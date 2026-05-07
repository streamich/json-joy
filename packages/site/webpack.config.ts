import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import type {Configuration} from 'webpack';
import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';

const root = path.resolve(__dirname, '..');
const isDev = process.env.NODE_ENV !== 'production';

const config: Configuration & {devServer?: DevServerConfiguration} = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash:8].js',
    chunkFilename: 'assets/[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    plugins: [
      {
        apply(resolver) {
          // Rewrite @jsonjoy.com/pkg/lib/... -> packages/pkg/src/...
          const target = resolver.ensureHook('resolve');
          resolver.getHook('resolve').tapAsync('WorkspaceSourceAlias', (request, resolveContext, callback) => {
            const req = request.request ?? '';
            let rewritten: string | null = null;

            const jsonjoyMatch = req.match(/^@jsonjoy\.com\/([^/]+)\/lib\/(.+)$/);
            if (jsonjoyMatch) {
              rewritten = path.join(root, jsonjoyMatch[1], 'src', jsonjoyMatch[2]);
            } else if (/^@jsonjoy\.com\/([^/]+)$/.test(req)) {
              const m = req.match(/^@jsonjoy\.com\/([^/]+)$/)!;
              rewritten = path.join(root, m[1], 'src');
            }

            if (!rewritten) {
              const nanoThemeLibMatch = req.match(/^nano-theme\/lib(?:\/(.+))?$/);
              if (nanoThemeLibMatch) {
                rewritten = path.join(root, 'nano-theme', 'src', nanoThemeLibMatch[1] ?? '');
              } else if (req === 'nano-theme') {
                rewritten = path.join(root, 'nano-theme', 'src');
              }
            }

            if (!rewritten) return callback();
            resolver.doResolve(
              target,
              {...request, request: rewritten},
              `WorkspaceSourceAlias: ${req} -> ${rewritten}`,
              resolveContext,
              callback,
            );
          });
        },
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.app.json'),
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: isDev ? ['style-loader', 'css-loader'] : [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(woff2?|ttf|eot|svg|png|jpg|gif)$/,
        type: 'asset/resource',
        generator: {filename: 'assets/[name].[hash:8][ext]'},
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({template: './public/index.html'}),
    ...(isDev ? [] : [new MiniCssExtractPlugin({filename: 'assets/[name].[contenthash:8].css'})]),
  ],
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    open: false,
  },
  optimization: {
    splitChunks: {chunks: 'all'},
  },
};

export default config;
