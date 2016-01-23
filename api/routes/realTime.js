import express from 'express';
import stops from '../static/stops';
import RealTimeDataService from "../services/RealTimeDataService";

let realtimeRouter = express.Router();
let realtimeDataService = new RealTimeDataService();

realtimeRouter.get('/:naptan_code', function (req, res) {
    realtimeDataService.GetRealTimeDataFromNaptanCode(req.params.naptan_code)
        .then(arrivals => {
            return res.json(arrivals);
        })
        .catch(err => {
            return res.err(err);
        });
});

export default realtimeRouter;