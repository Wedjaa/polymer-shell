var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

var path = require('path');

module.exports = {
    // Tell Webpack which file kicks off our app.
    entry: [
      path.resolve(__dirname, 'src/index.js'),
      path.resolve(__dirname, 'style/main.scss'),
    ],
    // Tell Weback to output our bundle to ./dist/bundle.js
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    // Tell Webpack which directories to look in to resolve import statements.
    // Normally Webpack will look in node_modules by default but since we’re overriding
    // the property we’ll need to tell it to look there in addition to the
    // bower_components folder.
    resolve: {
        alias: {
            '/libs': path.resolve(__dirname, 'node_modules'),
            '/components': path.resolve(path.join(__dirname, 'src', 'components'))
        },
        modules: [path.resolve(__dirname, 'node_modules')],
        extensions: [".js", ".scss", ".ejs", ".html"]
    },
    // These rules tell Webpack how to process different module types.
    // Remember, *everything* is a module in Webpack. That includes
    // CSS, and (thanks to our loader) HTML.
    module: {
        rules: [
            {
                // If you see a file that ends in .html, send it to these loaders.
                test: /\.html$/,
                // This is an example of chained loaders in Webpack.
                // Chained loaders run last to first. So it will run
                // polymer-webpack-loader, and hand the output to
                // babel-loader. This let's us transpile JS in our `<script>` elements.
                use: [
                    {
                        loader: 'babel-loader'
                    }, {
                        loader: 'polymer-webpack-loader'
                    }
                ]
            }, {
                // If you see a file that ends in .js, just send it to the babel-loader.
                test: /\.js$/,
                use: 'babel-loader'
                // Optionally exclude node_modules from transpilation except for polymer-webpack-loader:
                // exclude: /node_modules\/(?!polymer-webpack-loader\/).*/
            }, {
                test: /\.scss$/,
                use: extractSass.extract({
                  use: [
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    }, {
                        loader: "sass-loader" // compiles Sass to CSS
                    }
                  ]
                })
            }
        ]
    },
    // Enable the Webpack dev server which will build, serve, and reload our
    // project on changes.
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
    plugins: [

        extractSass,

        // This plugin will generate an index.html file for us that can be used
        // by the Webpack dev server. We can give it a template file (written in EJS)
        // and it will handle injecting our bundle for us.
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'tpl/index.ejs'),
            inject: false
        }),
        // This plugin will copy files over for us without transforming them.
        // That's important because the custom-elements-es5-adapter.js MUST
        // remain in ES2015.
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'node_modules/webcomponents/*.js'),
                to: 'webcomponents/[name].[ext]'
            }, {
                from: path.resolve(__dirname, 'assets'),
                to: 'assets'
            }
        ])
    ]
};
