import jsdom from "jsdom";

var cache = {};

let NAPTAN_CODE_MAP = {
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

function ParseWebData(numericCode) {

    return new Promise((resolve, reject) => {
        let url = "http://www.oxontime.co.uk/Naptan.aspx?t=departure&dc=&ac=96&vc=&x=0&y=0&format=xhtml&sa=" + numericCode;
        console.log(url);
        let arrivals = [];
            jsdom.env(
                url,
                function (err, window) {
                    try {
                        var rows = window.document.getElementsByTagName("Table")[1].children[1].children;
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

                        if (err) {
                            return reject(err);
                        }

                        cache[numericCode] = {
                            timestamp: new Date().getTime(),
                            data: arrivals
                        };

                        return resolve(arrivals);
                    } catch (ex) {
                        return reject(err);
                    }
                }
            );   
    })
}

function GetCachedValueIfValid(numericCode) {
    if (cache.hasOwnProperty(numericCode)) {
        if (new Date().getTime() - cache[numericCode].timestamp < 3600) {
            return cache[numericCode].data;
        }
    }
    return null;
}

export default class RealTimeDataService {

    constructor() {

    }

    GetRealTimeDataFromNaptanCode(naptanCode) {
        var numericCode = NaptanCodeToNumericCode(naptanCode);

        return this.GetRealTimeDataFromNumericCode(numericCode);
    }

    GetRealTimeDataFromNumericCode(numericCode) {

        var cachedValue = GetCachedValueIfValid(numericCode);

        if (cachedValue !== null) {
            return new Promise((resolve, reject) => {
                return resolve(cachedValue);
            });
        }

        return ParseWebData(numericCode);
    }
}