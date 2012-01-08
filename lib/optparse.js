(function(define) {
define([], function() {

    'use strict';

    // Private properties.
    
    var LONG_FLAG = /^(--\w[\w\-]+)/;
    var SHORT_FLAG = /^(-\w)/;
    var OPTIONAL = /\[(\w+(\*?))\]/;


    /**
     * @param {Array.<string>} rules
     * @param {string} banner
     * @constructor
     */
    var OptionParser = function(rules, banner) {
        this.rules_ = this.buildRules_(rules);
        this.banner_ = banner;
    };

    /**
     * @type {Array.<string>}
     * @private
     */
    OptionParser.prototype.rules_;

    /**
     * @param {Array.<string>} rules
     * @Private
     */
    OptionParser.prototype.buildRules_ = function(rules) {
        var results = [];
        for (var i = 0, len = rules.length; i < len; i++) {
            var rule = rules[i];
            if (rule.length < 3) {
                rule.unshift();
            }
            results.push(this.buildRule_.apply(null, rule));
        }
        return results;
    };

    /**
     * @param {string} shortFlag
     * @param {string} longFlag
     * @param {string} description
     * @private
     */
    OptionParser.prototype.buildRule_ = function(shortFlag, longFlag, description) {
        var match = longFlag.match(OPTIONAL);
        longFlag = longFlag.match(LONG_FLAG)[1];
        return {
            name: longFlag.substr(2),
            shortFlag: shortFlag,
            longFlag: longFlag,
            description: description,
            hasArgument: !!(match && match[1])
        };
    };

    /**
     * @param {Array.<string>} args
     * @return {Object}
     */
    OptionParser.prototype.parse = function(args) {
        var options = {
            sources: []
        };

        for (var i = 0, len = args.length; i < len; i++) {
            var arg = args[i];
            if (arg === '--') {
                var pos = args.indexOf('--');
                options.sources = [args[pos + 1]];
                break;
            }
            var isOption = !!(arg.match(LONG_FLAG) || arg.match(SHORT_FLAG));
            var matchedRule = false;
            for (var j = 0, len2 = this.rules_.length; j < len2; j++) {
                var rule = this.rules_[j];
                if (rule.shortFlag === arg || rule.longFlag === arg) {
                    options[rule.name] = rule.hasArgument ? args[++i] : true;
                    matchedRule = true;
                    break;
                }
            }
            if (isOption && !matchedRule) {
                throw Error("unrecognized option: " + arg);
            }
            if (!isOption) {
                options.sources = args.slice(args.indexOf(arg));
                break;
            }
        }
        return options;
    };

    /**
     * @return {string}
     */
    OptionParser.prototype.help = function() {
        var str = this.banner_ + '\n';
        str += 'Options:';
        this.rules_.forEach(function(rule) {
            str += '\n  ' + rule.shortFlag + ' , ' + rule.longFlag;
            str += '\n    ' + rule.description;
        });
        return str;
    };


    return OptionParser;

});
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['OptionParser'] = factory(); }
);
