module.exports = function(){
    return {
        "header" : `
            <script src="https://unpkg.com/react@0.14.9/dist/react.min.js"></script>
            <script src="https://unpkg.com/react-dom@0.14.9/dist/react-dom.min.js"></script>
            <script src="https://unpkg.com/vss-web-extension-sdk@2.117.0/lib/VSS.SDK.min.js"></script>
            <link href="css/main.css" rel="stylesheet" />
            <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/2.6.1/fabric.min.css">
            <link rel="stylesheet" href="https://appsforoffice.microsoft.com/fabric/2.6.1/fabric.components.min.css">
        `,

        "init" : `
            VSS.init({
                usePlatformScripts: true, 
                usePlatformStyles: true,
            });

            
            VSS.require(["dist/scripts/app"], function (App) {
                App.init("root-component");
            });      
        `
    }
}