var $ = require('jquery-browserify'),
    ApiService = require("../services/ApiService"),
    MarkerClusterer = require("../../libraries/MarkerClusterer"),
    InfoBox = require("../../libraries/InfoBox"),
    PubSub = require("pubsub-js");

function Map(lat, lng, rootMapDomElement, nextBusesDetailsObject) {
    var _this = this;
    
    this.nextBusesDetailsObject = nextBusesDetailsObject;
    this.lat = lat;
    this.lng = lng;
    this.rootMapDomElement = $(rootMapDomElement);
    this.mapDomElement = (this.rootMapDomElement.find('#map'))[0];
    this.mapObject = null;
    this.markerCluster = null;
    this.currentInfoBox = null;
    this.markers = [];
    this.apiService = new ApiService("/api/");
    this.markerImage = {
        url: 'images/station.png',
        size: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 10)
    };
    
    this.mapBounds = bounds = new google.maps.Circle({radius: 11000, center: new google.maps.LatLng(this.lat, this.lng)}).getBounds();
    
    this.initializeMap = function initializeMap() {
        var _this = this;
        this.mapObject = new google.maps.Map(this.mapDomElement, {
            center: { 
                lat: this.lat,
                lng: this.lng
            },
            zoom: 15,
            styles: [
                {
                    featureType: "transit.station.bus",
                    stylers: [
                        {
                            visibility: "off"
                        }
                    ]
                }
            ],
            streetViewControl: false,
            mapTypeControlOptions: {
                mapTypeIds: []
            }
        });

        this.initializeMarkers(function(result) {
            _this.MarkerCluster = new MarkerClusterer(_this.mapObject, _this.markers, {
                gridSize: 50, 
                maxZoom: 16
            }); 
        });
    };
    
    this.initializeMarkers = function initializeMarkers(callback) {
        var _this = this;
        this.apiService.getStations(function(err, result) {
            var stations = result.stations;
            for (var index in stations) {
                (function(id) {
                    var position = {
                        lat: parseFloat(stations[id].lat),
                        lng: parseFloat(stations[id].long)
                    };

                    var marker = new google.maps.Marker({
                        position: position,
                        map: _this.mapObject,
                        title: stations[id].name + " (" + stations[id].indicator + ")",
                        icon: _this.markerImage
                    });
                    
                    var infoWindowContent = $([
                        "<div>",
                        "<div class='content'>",
                        stations[id].name, 
                        " (",
                        stations[id].indicator,
                        ")",
                        "</div>",
                        "<div class='icon close'>",
                        "<i class='fa fa-times fa-fw'></i>",
                        /*"<div class='icon favorite'><i class='fa fa-star-o fa-fw'></i></div>",*/
                        "</div>",
                        "</div>"
                    ].join(''));
                    
                    infoWindowContent.find(".close").on('click', function() {
                        _this.onMarkerClosedManually();
                    });

                    var boxOptions = {
                        disableAutoPan: false,
                        maxWidth: 0,
                        pixelOffset: new google.maps.Size(-140, 9),
                        zIndex: null,
                        boxClass: "infobox",
                        closeBoxMargin: "",
                        closeBoxURL: "",
                        infoBoxClearance: new google.maps.Size(1, 1),
                        isHidden: false,
                        pane: "floatPane",
                        enableEventPropagation: false
                    };

                    var infoBox = new InfoBox(boxOptions);
                    
                    infoBox.setContent(infoWindowContent.get(0));

                    marker.addListener('click', function() {
                        _this.onMarkerSelected(marker, infoBox, stations[id]);
                    });

                    _this.markers.push(marker);  
                }(index));
            }
            callback(true);
        });
    };
    
    this.onMarkerClosedManually = function() {
        this.nextBusesDetailsObject.setSelectedStation(null);
        
        if (this.currentInfoBox !== null) {
            this.currentInfoBox.close();
            this.currentInfoBox = null;
        }
    }
    
    this.onMarkerSelected = function(marker, infoBox, station) {
        
        this.nextBusesDetailsObject.setSelectedStation(station);
        
        if (this.currentInfoBox !== null) {
            this.currentInfoBox.close();
            this.currentInfoBox = null;
        }

        this.currentInfoBox = infoBox;

        infoBox.open(this.mapObject, marker);
        
        this.mapObject.panTo(marker.position);
    };
    
    this.initializeMap();
    
    PubSub.subscribe('MAP_CONTAINER_RESIZED', function(msg, data) {
        console.log("RESIZED");
        google.maps.event.trigger(_this.mapObject, "resize");
    });
}

Map.prototype.getGoogleMapsObject = function() {
    return this.mapObject;
};

Map.prototype.getBounds = function() {
    return this.mapBounds;
};

module.exports = Map;