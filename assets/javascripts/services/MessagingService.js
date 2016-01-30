var PubSub = require("pubsub-js");

var actions = {
    MapContainerResized: "MAP_CONTAINER_RESIZED",
    StationSelected: "STATION_SELECTED",
    MapPositionChanged: "MAP_POSITION_CHANGED" //TODO: Use this
};

module.exports = {
    actions: actions,
    messaging: PubSub
};