"use strict";

var cache = {};

function put(key, value, validityInSeconds, callback) {
    key = key.toString();
    
    if (validityInSeconds <= 0) {
        return callback(new Error("Invalid validity"), null);
    }
    
    cache[key] = {
        value: value,
        expiration: Date.now() + (validityInSeconds * 1000)
    };
    
    return callback(null, true);
}

function invalidateValue(key) {
    key = key.toString();
    delete cache[key];
}

function get(key, callback) {
    key = key.toString();
    
    if (cache[key] && Date.now() <= cache[key].expiration) {
        return callback(null, cache[key].value);
    } else {
        invalidateValue(key);
        return callback(null, null);
    }
}

module.exports = {
    put: put,
    get: get
};