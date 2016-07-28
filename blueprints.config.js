module.exports = [{
  name: 'exobot',
  webpack: {
    devtool: 'source-map',
    entry: {
      exobot: './src/exobot.js',
    },
    output: {
      library: '[name].js',
      libraryTarget: 'umd',
    },
    externals: {
      generator: 'node-modules',
      additional: ['readline'],
    },
    resolve: {
      generator: 'npm-and-modules',
      extensions: ['.js', '.json'],
    },
    loaders: [
      {
        test: /\.es6\.js$|\.js$|\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'es2015-native-modules',
          ],
          plugins: [
            'syntax-decorators',
            'syntax-class-properties',
            'transform-decorators-legacy',
            'transform-decorators',
            'transform-class-properties',
            'transform-async-to-generator',
            'transform-object-rest-spread',
          ],
        },
      },
      'json',
    ],
    plugins: [
      'production-loaders',
      'minify-and-treeshake',
      'set-node-env',
      'abort-if-errors',
      'node-load-sourcemaps',
    ],
    node: {
      Buffer: false,
      process: false,
      global: false,
      __filename: true,
      __dirname: true,
    },
  },
}];
