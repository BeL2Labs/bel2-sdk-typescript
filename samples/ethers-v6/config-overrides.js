const path = require('path');
const { override, addWebpackAlias, addWebpackResolve, addWebpackPlugin } = require("customize-cra");
const webpack = require('webpack');

module.exports = override(
    addWebpackResolve({
        fallback: {
            crypto: 'crypto-browserify',
            stream: 'stream-browserify',
            vm: false,
        }
    }),
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    )
);
