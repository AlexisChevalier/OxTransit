"use strict";
import express from 'express';
import bodyParser from 'body-parser';
import stopsRouter from "./routes/stops";
import realtimeRouter from "./routes/realTime";

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With'); 
    next();
});

router.get('/', function(req, res) {
  res.json({ message: 'Api Endpoint' });
});

app.use('/api', router);
app.use('/api/stops', stopsRouter);
app.use('/api/realtime', realtimeRouter);

app.listen(port);

console.log('Magic happens on port ' + port);