const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: "./client/client.ts",
  output: {
    path: __dirname + '/client',
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: "ts-loader" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'SockPipe- GraphQL',
      filename: 'index.html'
    })
  ]
}
