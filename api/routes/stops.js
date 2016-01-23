import express from 'express';
import stops from '../static/stops';

let stopsRouter = express.Router();

stopsRouter.get('/', (req, res) => {
    res.json({ stops: stops });
});

stopsRouter.get('/:naptan_code', (req, res) => {
    res.json(stops[req.params.naptan_code]);
});

export default stopsRouter;