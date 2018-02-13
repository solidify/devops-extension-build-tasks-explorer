module.exports = function(){
    return {
        "header" : `
            <script src="scripts/VSS.SDK.min.js"></script>
            <link rel="stylesheet" href="scripts/css/main.css" />
            <link rel="stylesheet" href="scripts/css/fabric.min.css">
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