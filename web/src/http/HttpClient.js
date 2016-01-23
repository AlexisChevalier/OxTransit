var ErrorHandler = require("./HttpErrorHandler");

function HttpClient(apiUrl) {
    this.apiUrl = apiUrl;

    this.getAbsoluteUri = function (relativeUri) {
        return this.apiUrl + relativeUri;
    };

    this.getHeaders = function () {
        var headers = [];
        
        headers.push({name: "X-Requested-With", value: "XMLHttpRequest"});
        headers.push({name: "Content-type", value: "application/json"});
        headers.push({name: "Accept", value: "application/json"});
        
        return headers;
    };

    this.doAjaxRequest = function (type, relativeUrl, dataObject, callback) {
        try {

            var _this = this;

            var headers = this.getHeaders();
            var absoluteUrl = this.getAbsoluteUri(relativeUrl);
            var jsonData = JSON.stringify(dataObject);

            var x = new(window.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');

            x.open(type, absoluteUrl, 1);

            for(var header in headers) {
                if (headers.hasOwnProperty(header)) {
                    x.setRequestHeader(headers[header].name, headers[header].value);
                }
            }

            x.onreadystatechange = function () {
                if (x.readyState > 3) {
                    var text = x.responseText;

                    var error = ErrorHandler.handleError(x.status, text);

                    if (error) {
                        callback(error, null);
                    } else {
                        var json = true;

                        try {
                            json = JSON.parse(text);
                        } catch(e) {}

                        callback(error, json);
                    }
                }
            };

            x.send(jsonData)

        } catch (e) {
            var error = ErrorHandler.handleError(0, e.toString());
            callback(error, null);
        }
    }
}

HttpClient.prototype.doGet = function (relativeUrl, callback) {
    return this.doAjaxRequest("GET", relativeUrl, null, callback);
};

HttpClient.prototype.doPost = function (relativeUrl, dataObject, callback) {
    return this.doAjaxRequest("POST", relativeUrl, dataObject, callback);
};

HttpClient.prototype.doPut = function (relativeUrl, dataObject, callback) {
    return this.doAjaxRequest("PUT", relativeUrl, dataObject, callback);
};

HttpClient.prototype.doDelete = function (relativeUrl, callback) {
    return this.doAjaxRequest("DELETE", relativeUrl, null, callback);
};

module.exports = HttpClient;