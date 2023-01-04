/* config-overrides.js */

module.exports = function override(config, env) {
    //do stuff with the webpack config...

    const isEnvProduction = env === 'production'
    const isEnvDevelopment = env === 'development'

    config.output.filename = isEnvProduction
        ? 's/j/[name].js'
        : isEnvDevelopment && 's/j/bundle.js'
    // There are also additional JS chunk files if you use code splitting.
    config.output.chunkFilename = isEnvProduction
        ? 's/j/[name].[contenthash:1].chunk.js'
        : isEnvDevelopment && 's/j/[name].chunk.js'
    config.output.assetModuleFilename = 's/m/[name][ext]'
    // webpack uses `publicPath` to determine where the app is being served from.
    // It requires a trailing slash, or the file assets will get an incorrect path.
    // We inferred the "public path" (such as / or /my-project) from homepage.

    // const MiniCssExtractPlugin = require("mini-css-extract-plugin");

    // config.plugins.push( isEnvProduction &&
    //     new MiniCssExtractPlugin({
    //       // Options similar to the same options in webpackOptions.output
    //       // both options are optional
    //       filename: 's/c/[name].[contenthash:4].css',
    //       chunkFilename: 's/c/[name].[contenthash:4].chunk.css',
    //     })
    // )

    let MiniCssExtractPlugin = config.plugins.find((object) => { 
        if(object.hasOwnProperty("options")) {
            if(object["options"].hasOwnProperty("filename")) {
                return object["options"]["filename"].startsWith("static/css") 
            }
        }
        return false
    })
    if(isEnvProduction) {
        MiniCssExtractPlugin["options"]["filename"] = 's/c/[name].css'
        MiniCssExtractPlugin["options"]["chunkFilename"] = 's/c/[name].chunk.css'
    }


    config.devtool = undefined

    // console.log(config)

    return config;
  }