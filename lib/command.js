(function(define) {
define([], function() {

    'use strict';

    // load modules

    var fs = require('fs');
    var path = require('path');
    var OptionParser = require('./optparse');
    var jc = require('./jc');


    // Private properties.

    var RULES = [
        ['-c', '--compile', 'compile to JavaScript and save as js file'],
        ['-p', '--print', 'print out the compiled JavaScript'],
        ['-o', '--output [DIR]', 'set the output directory for compiled JavaScript'],
        ['-h', '--help', 'display this help message']
    ];
    var BANNER = 'Usage: jc [options] /path/to/target.jc';
    var opts = {};


    // Private methods

    /**
     * @param {string} line
     * @private
     */
    function printLine(line) {
        process.stdout.write(line + '\n');
    };

    /**
     * @param {string} file
     * @param {string} base
     * @private
     */
    function compilePath(file, base) {
        fs.stat(file, function(err, stats) {
            if (err) {
                printLine('[ERROR] ' + err.message);
            } else if (path.extname(file) === '.jc') {
                fs.readFile(file, function(err, code) {
                    if (err) {
                        printLine('[ERROR] ' + err.message);
                        return;
                    }
                    compileScript(file, code.toString(), base);
                });
            } else {
                printLine('[ERROR] File extension must be ".jc"');
            }
        });
    };

    /**
     * @param {string} file
     * @param {string} input
     * @param {string} base
     * @private
     */
    function compileScript(file, input, base) {
        try {
            var output = jc.compile(input, file);
            if (opts.print) {
                printLine(output.trim());
            } else if (opts.compile) {
                writeJs(file, output, base);
            }
        } catch (err) {
            process.stderr.write(
              '[ERROR] ' +  (err instanceof Error ? err.stack : err) + '\n');
            process.exit(1);
        }
    };

    /**
     * @param {string} file
     * @param {string} js
     * @param {string} base
     * @private
     */
    function writeJs(file, js, base) {
        var jsPath = outputPath(file, base);
        var jsDir = path.dirname(jsPath);
        var compile = function() {
            if (0 >= js.length) {
                js = ' ';
            }
            fs.writeFile(jsPath, js, function(err) {
                if (err) {
                    printLine('[ERROR] ' + err.message);
                } else if (opts.compile) {
                    printLine('[COMPILED] ' + file + ', OUTPUT => ' + jsPath);
                }
            });
        };
        path.exists(jsDir, function(exists) {
            if (exists) {
                compile();
            } else {
                exec("mkdir -p " + jsDir, compile);
            }
        });
    };

    /**
     * @param {string} file
     * @param {string} base
     * @private
     */
    function outputPath(file, base) {
        var filename = path.basename(file, path.extname(file)) + '.js';
        var srcDir = path.dirname(file);
        var baseDir = (base === '.') ? srcDir : srcDir.substring(base.length);
        var dir = opts.output ? path.join(opts.output, baseDir) : srcDir;
        return path.join(dir, filename);
    };


    /**
     * @api
     */
    var commands = {
        /**
         * Action to compile jc script to JavaScript.
         */
        run: function() {
            var optionParser = new OptionParser(RULES, BANNER);
            opts = optionParser.parse(process.argv.slice(2));
            if (opts.help) {
                printLine(optionParser.help());
                process.exit(1);
            }
            for (var i = 0, len = opts.sources.length; i < len; i++) {
                var source = opts.sources[i];
                compilePath(source, path.normalize(source));
            }
        }
    };

    return commands;

});
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['commands'] = factory(); }
);
