var keys = {
    UNAUTHORIZED: "unauthorized",
    NOT_FOUND: "notfound",
    SERVER_ERROR: "servererror",
    UNKNOWN_ERROR: "unknownerror"
};

function reverseKeys(original) {
    var values = {};

    for (var key in keys) {
        if (keys.hasOwnProperty(key)) {
            values[original[key]] = key;
        }
    }

    return values;
}

var values = reverseKeys(keys);

module.exports = {
    keys: keys,
    values: values
};