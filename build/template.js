var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var template = fs.readFileSync(process.argv[2]);
var data = require(process.argv[3]);
var outputPath = process.argv[4];

var compiledTemplate = _.template(template);
var output = compiledTemplate(data());

var destDir = path.dirname(outputPath);
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir)
}

fs.writeFileSync(outputPath, output);