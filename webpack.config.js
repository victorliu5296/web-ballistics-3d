const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: ['./src/app.ts'].concat(
      glob.sync('./src/ui/styles/**/*.css').map(e => './' + e.replace(/\\/g, '/')) // Correct path formatting
    ),
  },
  mode: 'development', // Change to 'production' as necessary
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS into separate files
          'css-loader'                // Translates CSS into CommonJS
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    alias: {
      // Define aliases if necessary
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // Use 'dist' as it's more conventional
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css' // Combining all CSS into one file
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/index.html', to: 'index.html' }, // This will copy index.html from src to dist
        { from: './assets', to: 'assets' }, // This will copy all assets to dist
      ],
    }),
  ],
};