var PubSub = require("pubsub-js");

var actions = {
    MapContainerResized: "MAP_CONTAINER_RESIZED",
    StationSelected: "STATION_SELECTED",
    FavorisListUpdated: "FAVORIS_LIST_UPDATED",
    MapPositionChanged: "MAP_POSITION_CHANGED" //TODO: Use this
};

module.exports = {
    actions: actions,
    messaging: PubSub
};