const path = require('path')

const {
  LoaderOptionsPlugin,
  HotModuleReplacementPlugin
} = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')

// #region Configuration Constants

const SRC_PATH = path.resolve(__dirname, 'src')

const ENTRY_FILE = path.join(__dirname, 'src/index.js')
const BUILD_DIR = path.join(__dirname, 'fake_dir')

const PUBLIC_DIR = path.join(__dirname, 'public')
const MAIN_HTML_FILE = path.join(PUBLIC_DIR, 'index.html')

// #endregion

// #region Webpack Configuration Object

module.exports = {
  mode: 'development',
  entry: {
    bundle: ENTRY_FILE
  },
  output: {
    library: 'PeerClient',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: BUILD_DIR,
    filename: 'PeerClient.js'
  },
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    aggregateTimeout: 300
  },
  resolve: {
    extensions: ['*', '.js']
  },
  resolveLoader: {
    modules: [
      path.join(__dirname, '../../node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js)?$/,
        loaders: ['babel-loader'],
        include: [SRC_PATH]
      }
    ]
  },
  plugins: [
    new LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      options: {
        context: SRC_PATH,
        output: {
          path: BUILD_DIR
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: MAIN_HTML_FILE,
      filename: 'index.html'
    }),
    new HotModuleReplacementPlugin()
  ]
}

// #endregion
