(function() {

    'use strict';

    var key, val, ref;

    ref = require('./ocha');
    for (key in ref) {
        val = ref[key];
        exports[key] = val;
    }

}).call(this);
