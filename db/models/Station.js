var mongoose = require('mongoose');
var stationsList = require('../../static/StationsList');

var stationSchema = mongoose.Schema({
    "_about": String,
    "atcoCode": String,
    "easting": Number,
    "indicator": String,
    "lat": Number,
    "long": Number,
    "name": String,
    "naptanCode": String,
    "northing": Number
});

var Station = mongoose.model('Station', stationSchema);

function InitializeStations(callback) {
    Station.remove({}, function (err, result) {
        var bulk = Station.collection.initializeOrderedBulkOp();

        for(var index in stationsList) {
            if (stationsList.hasOwnProperty(index)) {
                bulk.insert(stationsList[index]);
            }
        }

        bulk.execute(function(err,result) {
            if (err) {
                if (callback) {
                    return callback(err, false);
                } else {
                    throw err;
                }
            }   // or something
            if (callback) callback(null, true);
        });
    });
}

module.exports = {
    Station: Station,
    InitializeStationsDb: InitializeStations
};