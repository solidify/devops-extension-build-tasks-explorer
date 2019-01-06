module.exports = function(){
    return {
        "header" : `
            <script src="scripts/VSS.SDK.min.js"></script>
            <link href="scripts/css/main.css" rel="stylesheet" />
            <link rel="stylesheet" href="scripts/css/fabric.min.css">
        `,

        "init" : `
            VSS.init({
                usePlatformScripts: true, 
                usePlatformStyles: true,
                moduleLoaderConfig: {
                    paths: {
                        local : '//localhost:9001'
                    }
                }
            });

            
            VSS.require(["local/dist/scripts/app"], function (App) {
                App.init("root-component");
            });    
        `
    }
}