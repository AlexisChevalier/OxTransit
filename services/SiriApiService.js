var xml2js = require("xml2js"),
    nconf = require("nconf"),
    request = require("request"),
    cacheService = require("./MemoryCacheService");

var parser = new xml2js.Parser();
var builder = new xml2js.Builder();

function BuildXmlPayload(atcoCode) {
    var timestamp = new Date();
    var jsonObj = {
        "Siri" : {
            $: {
                "xsi:schemaLocation": "http://www.siri.org.uk/siri",
                "version": "1.3",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xmlns": "http://www.siri.org.uk/siri"
            },
            "ServiceRequest": {
                "RequestorRef": nconf.get("SIRI_REQUESTOR_REF"),
                "RequestTimestamp": timestamp.toISOString(),
                "StopMonitoringRequest": {
                    $: {
                        "version": "1.3"
                    },
                    "RequestTimestamp": timestamp.toISOString(),
                    "MonitoringRef": atcoCode,
                    "MaximumStopVisits": 20,
                    "MaximumTextLength": 160,
                    "PreviewInterval": "PT90M"
                }
            }
        }
    };

    return builder.buildObject(jsonObj).toString();
}

function HandleSiriResponse(rawJsonResponse) {
    try {
        var nextBusesRaw = rawJsonResponse["Siri"]["ServiceDelivery"][0]["StopMonitoringDelivery"][0]["MonitoredStopVisit"];

        if (!nextBusesRaw) {
            throw new Error("No results for this stop");
        }
    } catch (ex) {
        return {}; //TODO: Improve error management
    }

    var nextBuses = [];

    for (var i = 0; i < nextBusesRaw.length; i++) {
        try {
            var date = nextBusesRaw[i]["MonitoredVehicleJourney"][0]["MonitoredCall"][0]["AimedArrivalTime"] || nextBusesRaw[i]["MonitoredVehicleJourney"][0]["MonitoredCall"][0]["AimedDepartureTime"];

            nextBuses.push({
                "line": nextBusesRaw[i]["MonitoredVehicleJourney"][0]["PublishedLineName"][0],
                "direction": nextBusesRaw[i]["MonitoredVehicleJourney"][0]["DirectionRef"][0],
                "destination": nextBusesRaw[i]["MonitoredVehicleJourney"][0]["DestinationName"][0],
                "arrivalTime": Date.parse(date[0])
            });
        } catch(ex) {
            console.log(ex);
        }
    }

    return nextBuses;
}

function PerformRequest(atcoCode, callback) {

    var xmlPayload = BuildXmlPayload(atcoCode);

    var requestOptions = {
        url: nconf.get("SIRI_ENDPOINT"),
        body : xmlPayload,
        headers: {'Content-Type': 'application/xml'}
    };

    request.post(requestOptions, function(err, resp, body) {
        if (err) {
            return callback(err, null);
        }
        parser.parseString(body, function (err, result) {
            if (err) {
                return callback(err, null);
            }

            var arrivals = HandleSiriResponse(result);

            cacheService.put(atcoCode, arrivals, 30, function (err, nextBuses) {
                if (err) {
                    console.log(err);
                    return callback(err, null);
                }
                return callback(null, arrivals);
            });
        });
    })
}

function GetRealTimeDataFromAtcoCode(atcoCode, callback) {
    cacheService.get(atcoCode, function (err, nextBuses) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }

        if (nextBuses !== null) {
            return callback(null, nextBuses);
        }

        return PerformRequest(atcoCode, callback);
    });
}

module.exports = {
    GetRealTimeDataFromAtcoCode: GetRealTimeDataFromAtcoCode
};