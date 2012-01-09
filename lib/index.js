(function() {

    'use strict';

    var key, val, ref;

    ref = require('./jc.js');
    for (key in ref) {
        val = ref[key];
        exports[key] = val;
    }

}).call(this);
