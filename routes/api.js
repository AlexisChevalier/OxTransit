var express = require('express');
var stations = require('../static/StationsList');
var stationsApiService = require('../services/StationsApiService');
var router = express.Router();

router.get('/stations', function(req, res, next) {
    res.json({ stations: stations });
});

router.get('/stations/:naptan_code', function(req, res, next) {
    res.json(stations[req.params.naptan_code]);
});

router.get('/stations/:naptan_code/nextbuses', function(req, res, next) {
    stationsApiService.GetRealTimeDataFromNaptanCode(req.params.naptan_code, function (err, result) {
        if (err) {
            return res.json(err);
        }
        return res.json(result);
    });
});

module.exports = router;