var ApiErrors = require ("./ApiErrors");

var ErrorHandler = {};

var httpOkRegex = /^2[0-9]{2}/;
var httpServerErrorRegex = /^2[0-9]{2}/;

function hasError(httpCode, jsonContent) {
    return !httpOkRegex.test(httpCode.toString());
}

function makeError(statusCode, content, originalError, errorType) {
    return {
        statusCode: statusCode,
        content: content,
        originalError: originalError,
        errorType: errorType
    }
}

ErrorHandler.handleError = function (httpCode, textContent) {

    var jsonContent = null;
    var errorType = null;

    try {
        jsonContent = JSON.parse(textContent);
    } catch (e) {
        jsonContent = null;
    }

    if (!hasError(httpCode, jsonContent)) {
        return null;
    }

    if (ApiErrors.values.hasOwnProperty(jsonContent && jsonContent !== null && jsonContent.error)) {
        errorType = ApiErrors.keys[ApiErrors.values[jsonContent.error]];
    } else {
        if (httpCode == 404) {
            errorType = ApiErrors.keys.NOT_FOUND;
        } else if (httpCode == 401) {
            errorType = ApiErrors.keys.UNAUTHORIZED;
        } else if (!httpServerErrorRegex.test(httpCode.toString())) {
            errorType = ApiErrors.keys.SERVER_ERROR;
        } else {
            errorType = ApiErrors.keys.UNKNOWN_ERROR;
        }
    }

    return makeError(httpCode, textContent, jsonContent, errorType);
};

module.exports = ErrorHandler;