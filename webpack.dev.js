const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.base');

module.exports = 
    Merge(CommonConfig, {
        output: {
            publicPath : "https://localhost:8080/dist/scripts"
        },
        devServer: {
            contentBase: __dirname,
            port: 8080,
            https: true,
            //hotOnly: true,
            //inline: true
        }
    })