const path = require('path')
// const webpack = require('webpack')
const HtmlWebpckPlugin = require('html-webpack-plugin')
// const InterpolateHtmlPlugin = require('interpolate-html-plugin')
// const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const safeParser = require('postcss-safe-parser')
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const {TsConfigPathsPlugin} = require('awesome-typescript-loader')
const pkg = require('./package.json')

console.log(__dirname)
const env = process.env.NODE_ENV || 'dev'
const isDev = env === 'dev'

const stylusModuleRegex = /\.module\.styl$/

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, './dist'),
    filename: `${pkg.version}/[name].js`,
    // chunkFilename:
  },
  devServer: {
    contentBase: path.join(__dirname, './dist'),
    // open: true, // 自动打开浏览器
    host: 'localhost',
    port: 3000,
    inline: true,
    hot: true,
    clientLogLevel: 'warning',
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    noInfo: true,
    watchOptions: {
      aggregateTimeout: 600,
    },
    proxy: {
      '/v2': {
        target: 'http://localhost:8081',
        // pathRewrite: {
        //   '^/api': '', // 替换掉代理地址中的 /api
        // },
        changeOrigin: true,
      },
    },
    // proxy: {
    //   '/api': {
    //     target: 'https://192.168.10.128:8443',
    //     pathRewrite: {
    //       '^/api': '',
    //     },
    //     changeOrigin: true,
    //   },
    // },
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/] || src\//,
          chunks: 'all',
          name: 'common',
          minSize: 0,
          minChunks: 2,
          enforce: true,
        },
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // alias: {
    //   '@c': path.resolve(__dirname, 'src/components/'),
    //   '@p': path.resolve(__dirname, 'src/pages/'),
    // },
    plugins: [
      new TsConfigPathsPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpckPlugin({
      filename: 'index.html',
      template: './public/index.html', // 实例化
      chunks: ['main'],
    }),
    // isDev && new CleanWebpackPlugin(),
    // new InterpolateHtmlPlugin({
    //   PUBLIC_URL: '/public'
    // }),
    // isDev && new BundleAnalyzerPlugin({
    //   openAnalyzer: false,
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [{
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false, // 不使用.babelrc文件
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime'],
            cacheDirectory: true,
          },
        }],
        include: [
          path.join(__dirname, './src'),
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        loader: ['babel-loader', 'awesome-typescript-loader'],
        include: [
          path.join(__dirname, './src'),
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.styl$/,
        exclude: stylusModuleRegex,
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'stylus-loader'],
        include: [path.resolve(__dirname, 'src')],
      },
      {
        test: stylusModuleRegex,
        include: [path.resolve(__dirname, 'src')],
        use: [
          // isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'style-loader',
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: isDev ? '[name]-[local]-[hash:base64:5]' : '[hash:base64]',
              },
            },
          },
          'postcss-loader',
          'stylus-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
        exclude: [path.resolve(__dirname, './src/icons')],
        // use: [{
        //   loader: 'svg-inline-react',
        //   options: {
        //     jsx: true, // true outputs JSX tags
        //     svgo: {
        //       plugins: [
        //         {removeTitle: false},
        //       ],
        //       floatPrecision: 2,
        //     },
        //   },
        // }],
        use: [
          {
            loader: 'url-loader',
            query: {
              name: `${pkg.version}/[name].[hash:8].[ext]`,
              limit: 1024 * 1024,
            },
          },
        ],
      },
      {
        test: /^((?!\.color).)*((?!\.color).)\.svg$/,
        include: [path.resolve(__dirname, './src/icons')],
        use: [
          {loader: 'svg-sprite-loader'},
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                {removeTitle: true},
                {convertColors: {shorthex: true}},
                {convertPathData: true},
                {removeComments: true},
                {removeDesc: true},
                {removeUselessDefs: true},
                {removeEmptyAttrs: true},
                {removeHiddenElems: true},
                {removeEmptyText: true},
                {removeUselessStrokeAndFill: true},
                {moveElemsAttrsToGroup: true},
                {removeStyleElement: true},
                {cleanupEnableBackground: true},
                {removeAttrs: {attrs: '(stroke|fill|filter)'}},
              ],
            },
          },
        ],
      },
    ],
  },
}

if (isDev) {
  module.exports.devtool = 'eval-cheap-module-source-map'
} else {
  module.exports.devtool = 'source-map'
}
