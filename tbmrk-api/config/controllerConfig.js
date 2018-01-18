'use strict';

const fs = require('fs');

module.exports = function requireAll(dirname) {

    let modules = {};
    let files;
    try {
        files = fs.readdirSync(dirname);
    } catch (e) {
        console.log(`error:${e}`)
        return {};
    }

    files.forEach(function(file) {
        let filepath = dirname + '/' + file;

        if (fs.statSync(filepath).isDirectory()) {
            if (file.match(/^\./)) return;
            modules[file] = requireAll(filepath);

        } else {
            let match = file.match(/^([^\.].*)\.js(on)?$/);
            if (!match) return;
            modules[match[1]] = require(filepath);
        }
    });
    return modules;
};
