(function(define) {
define([], function() {

    'use strict';

    // Load modules
    
    var esNext = require('./es.next');
    var Rewriter = require('./rewriter');


    /**
     * @api
     */
    var jc = {
        /**
         * @param {string} input
         * @param {string} filename
         * @return {string}
         */
        compile: function(input, filename) {
            try {
                var stmt = new esNext.Parser(input).parse();
                return new Rewriter().rewrite(stmt);
            } catch (err) {
                if (filename) {
                    err.message = "In " + filename + ", " + err.message;
                }
                throw err;
            }
        }
    };

    return jc;
});
})(typeof define !== 'undefined' ?
    // use define for AMD if available
    define :
    // If no define, look for module to export as a CommonJS module.
    // If no define or module, attach to current context.
    typeof module !== 'undefined' ?
    function(deps, factory) { module.exports = factory(); } :
    function(deps, factory) { this['jc'] = factory(); }
);
