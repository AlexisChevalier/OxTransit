var express = require('express');
var stations = require('../static/StationsList');
var siriApiService = require('../services/SiriApiService');
var mongoose = require("mongoose");
var router = express.Router();

router.get('/stations', function(req, res, next) {
    res.json({ stations: stations });
});

router.get('/v2/stations', function(req, res, next) {
    mongoose.model('Station').find({}, function (err, results) {
        if (err) {
            console.log(err);
            return res.json({});
        }

        return res.json(results);
    });
});

router.get('/stations/:atco_code', function(req, res, next) {
    res.json(stations[req.params.atco_code]);
});

router.get('/stations/:atco_code/nextbuses', function(req, res, next) {

    if (!stations[req.params.atco_code]) {
        return res.json({}); //TODO: Throw error
    }

    siriApiService.GetRealTimeDataFromAtcoCode(req.params.atco_code, function (err, result) {
        if (err) {
            return res.json({});
        }
        return res.json(result);
    });
});

router.get('/search/station/:text', function(req, res, next) {
    mongoose.model('Station').find({name: new RegExp(req.params.text,"i")}, function (err, results) {
        if (err) {
            console.log(err);
            return res.json({});
        }

        return res.json(results);
    });
});

module.exports = router;