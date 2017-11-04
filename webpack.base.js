const path = require('path');
//const bundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: './src/MainComponent.tsx',
    output: {
        filename: "app.js",
        path: __dirname + "/dist/scripts",
        libraryTarget: "amd"
    },

    externals: [
        {
            'react': true,
            'react-dom': true,
            'q': true
        },
        /^TFS\//, // Ignore TFS/* since they are coming from VSTS host 
        /^VSS\//  // Ignore VSS/* since they are coming from VSTS host
    ],
    
    resolve: {
        alias: 
        { 
            "OfficeFabric": path.join(__dirname, "./node_modules/office-ui-fabric-react/lib-amd")
        },

        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

    //plugins: [new bundleAnalyzer({analyzerMode : 'static'})],
    
    devtool: 'source-map'
};