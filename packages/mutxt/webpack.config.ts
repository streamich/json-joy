import fs from 'fs/promises';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {Compilation, sources, type Compiler, type Configuration} from 'webpack';
import type {Configuration as DevServerConfiguration} from 'webpack-dev-server';

const root = path.resolve(__dirname, '..');
const isDev = process.env.NODE_ENV !== 'production';

class CopyPublicAssetsPlugin {
  constructor(private readonly assets: Array<{from: string; to?: string}>) {}

  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap('CopyPublicAssetsPlugin', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'CopyPublicAssetsPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          await Promise.all(
            this.assets.map(async ({from, to = from}) => {
              const assetPath = path.resolve(__dirname, 'public', from);
              const source = await fs.readFile(assetPath);
              compilation.emitAsset(to, new sources.RawSource(source));
            }),
          );
        },
      );
    });
  }
}

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
    // Redirect workspace package lib/ imports to TypeScript source.
    alias: {
      // @jsonjoy.com/pkg/lib/path -> packages/pkg/src/path
      // Handled by the rules below using webpack alias with functions isn't ideal;
      // instead we use resolve.alias with regex patterns via the nsm approach.
    },
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
            } else {
              const mutxtReactLibMatch = req.match(/^mutxt-react\/lib(?:\/(.+))?$/);
              if (mutxtReactLibMatch) {
                rewritten = path.join(root, 'mutxt-react', 'src', mutxtReactLibMatch[1] ?? '');
              } else if (req === 'mutxt-react') {
                rewritten = path.join(root, 'mutxt-react', 'src');
              }
            }

            if (!rewritten) {
              const joyMatch = req.match(/^json-joy\/lib\/(.+)$/);
              if (joyMatch) {
                rewritten = path.join(root, 'json-joy', 'src', joyMatch[1]);
              } else if (req === 'json-joy') {
                rewritten = path.join(root, 'json-joy', 'src');
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
    new CopyPublicAssetsPlugin([
      {from: 'manifest.webmanifest'},
      {from: 'icon.svg'},
      {from: 'icons/icon-192.png'},
      {from: 'icons/icon-512.png'},
    ]),
    ...(isDev ? [] : [new MiniCssExtractPlugin({filename: 'assets/[name].[contenthash:8].css'})]),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: false,
  },
  optimization: {
    splitChunks: {chunks: 'all'},
  },
};

export default config;
