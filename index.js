var fs = require("fs");
var request = require('request');

var iconFileUrl = "https://raw.githubusercontent.com/callemall/material-ui/master/src/svg-icons/index.js"
var destFileName = process.argv.slice(2)[0] || "svg-icons.d.ts";
var header = `
// Type definitions for material-ui v0.15.2
// Project: https://github.com/callemall/material-ui
// Definitions by: "Isman Usoh <https://github.com/isman-usoh>"
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

// Generator by: https://github.com/isman-usoh/mui-icon-type-generator

///<reference path='material-ui.d.ts' />

`;



loadIconIndex(iconFileUrl);
function loadIconIndex(url) {
    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            writeToFile(body);
        } else {
            console.log("Fecth file error", error);
        }
    });
}
function writeToFile(body) {
    var declareModuleOuts = [];
    var indexExportOut = [];

    body.split('\n').forEach(function (line) {
        var lineArr = line.split(" ");
        if (lineArr.length < 4) {
            return;
        }

        var moduleName = lineArr[1]
        var modulePath = lineArr[3].replace("'./", "").replace("';\r", "").replace("';", "");

        var declareModule = `
declare module 'material-ui/svg-icons/${modulePath}' {
    import ${moduleName} = __MaterialUI.SvgIcon;
    export default ${moduleName};
}`;
        var indexExport = `\texport import ${moduleName} = __MaterialUI.SvgIcon;\n`;

        declareModuleOuts.push(declareModule);
        indexExportOut.push(indexExport);
    });
    indexExportOut.splice(0, 0, "declare module 'material-ui/svg-icons' {\n");
    indexExportOut.push("}");
    
    fs.writeFileSync(destFileName, header);
    fs.appendFileSync(destFileName, indexExportOut.join(''));
    fs.appendFileSync(destFileName, declareModuleOuts.join(''));
    console.log("successful:",destFileName);
}