var jsdom = require("jsdom"),
    cacheService = require("./MemoryCacheService"),
    NAPTAN_CODE_MAP = {
        "a": "2",
        "b": "2",
        "c": "2",
        "d": "3",
        "e": "3",
        "f": "3",
        "g": "4",
        "h": "4",
        "i": "4",
        "j": "5",
        "k": "5",
        "l": "5",
        "m": "6",
        "n": "6",
        "o": "6",
        "p": "7",
        "q": "7",
        "r": "7",
        "s": "7",
        "t": "8",
        "u": "8",
        "v": "8",
        "w": "9",
        "x": "9",
        "y": "9",
        "z": "9"
    };

function NaptanCodeToNumericCode(naptanCode) {
    var splitted = naptanCode.split('');
    var numberStr = "";
    for(var i = 0; i < splitted.length; i++) {
        numberStr += NAPTAN_CODE_MAP[splitted[i]];
    }
    return numberStr;
}

function ParseWebData(numericCode, callback) {
    var url = "http://www.oxontime.co.uk/Naptan.aspx?t=departure&dc=&ac=96&vc=&x=0&y=0&format=xhtml&sa=" + numericCode;
    var arrivals = [];
    jsdom.env(url, function (err, window) {
        if (err) {
            return callback(err, null);
        }
        try {
            var table = window.document.getElementsByTagName("Table")[1];
            
            if (!table.children[1]) { //No data
                arrivals = [];
            } else {
                var rows = table.children[1].children;
            
                for (var i = 0; i < rows.length; i++) {
                    var cells = rows[i].children;

                    var busArrival = {
                        serviceNumber: cells[0].innerHTML,
                        destination: cells[1].innerHTML,
                        departureTime: cells[2].innerHTML,
                        operatorName: cells[3].children[1].innerHTML
                    };

                    arrivals.push(busArrival);
                }   
            }
        } catch (ex) {
            console.log("PARSING FAILURE FOR URL " + url);
            arrivals = [];
        }
        
        cacheService.put(numericCode, arrivals, 60, function (err, nextBuses) {
                if (err) {
                    console.log(err);
                    return callback(err, null); 
                }
                return callback(null, arrivals); 
            });
    });
}

function GetRealTimeDataFromNaptanCode(naptanCode, callback) {
    var numericCode = NaptanCodeToNumericCode(naptanCode);
    return this.GetRealTimeDataFromNumericCode(numericCode, callback);
}

function GetRealTimeDataFromNumericCode(numericCode, callback) {
    cacheService.get(numericCode, function (err, nextBuses) {
        if (err) {
            console.log(err);
            return callback(err, null); 
        }
        
        if (nextBuses !== null) {
            return callback(null, nextBuses);
        }
        
        return ParseWebData(numericCode, callback);         
    });
}

module.exports = {
    GetRealTimeDataFromNaptanCode: GetRealTimeDataFromNaptanCode,
    GetRealTimeDataFromNumericCode: GetRealTimeDataFromNumericCode
};