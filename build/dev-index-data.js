module.exports = function(){
    return {
        "header" : `
            <script src="../node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js"></script>
            <link href="../css/main.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/2.6.1/fabric.min.css">
            <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/2.6.1/fabric.components.min.css">
        `,

        "init" : `
            VSS.init({
                usePlatformScripts: true, 
                usePlatformStyles: true,
                moduleLoaderConfig: {
                    paths: {
                        local : '//localhost:8080'
                    }
                }
            });

            
            VSS.require(["local/dist/scripts/app"], function (App) {
                App.init("root-component");
            });    
        `
    }
}