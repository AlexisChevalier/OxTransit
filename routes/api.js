var express = require('express');
var stations = require('../static/StationsList');
var siriApiService = require('../services/SiriApiService');
var router = express.Router();

router.get('/stations', function(req, res, next) {
    res.json({ stations: stations });
});

router.get('/stations/:atco_code', function(req, res, next) {
    res.json(stations[req.params.atco_code]);
});

router.get('/crash', function(req, res, next) {
   return test[0].a;
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

module.exports = router;