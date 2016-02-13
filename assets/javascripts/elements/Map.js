var $ = require('jquery-browserify'),
    ApiService = require("../services/ApiService"),
    FavoritesService = require("../services/FavoritesService"),
    MarkerClusterer = require("../../libraries/MarkerClusterer"),
    InfoBox = require("../../libraries/InfoBox"),
    StationsService = require("../services/StationsService"),
    MessagingService = require("../services/MessagingService");


function Map(lat, lng, rootMapDomElement, nextBusesDetailsObject) {
    var _this = this;
    
    this.nextBusesDetailsObject = nextBusesDetailsObject;
    this.lat = lat;
    this.lng = lng;
    this.rootMapDomElement = $(rootMapDomElement);
    this.mapDomElement = (this.rootMapDomElement.find('#map'))[0];
    this.mapObject = null;
    this.markerCluster = null;
    this.stationsService = new StationsService();
    this.favoritesService = new FavoritesService();
    this.currentInfoBox = null;
    this.markers = [];
    this.infoBoxes = [];
    this.apiService = new ApiService("/api/");
    this.markerImage = {
        url: 'images/station.png',
        size: new google.maps.Size(20, 20),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(10, 10)
    };
    
    this.mapBounds = new google.maps.Circle({radius: 11000, center: new google.maps.LatLng(this.lat, this.lng)}).getBounds();
    
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

        _this.markerCluster = new MarkerClusterer(_this.mapObject, [], {
            gridSize: 50,
            maxZoom: 16
        });

        this.initializeMarkers();
    };
    
    this.initializeMarkers = function initializeMarkers() {
        var _this = this;
        this.stationsService.getStations(function(err, result) {
            var stations = result.stations;
            for (var index in stations) {
                if (stations.hasOwnProperty(index)) {
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
                            "<div class='content'><p>",
                            stations[id].name,
                            " (",
                            stations[id].indicator,
                            ")",
                            "</p></div>",
                            "<div class='icon close'>",
                            "<i class='fa fa-times fa-fw'></i>",
                            "</div>",
                            "<div class='icon favorite'>",
                            "<i class='fa fa-star-o fa-fw'></i>",
                            "</div>",
                            "</div>"
                        ].join(''));

                        infoWindowContent.find(".close").on('click', function() {
                            _this.onMarkerClosedManually();
                        });

                        infoWindowContent.find(".favorite").on('click', function() {
                            if (!_this.favoritesService.isFavorite(stations[id].atcoCode)) {
                                _this.favoritesService.add(stations[id].atcoCode, stations[id].name + " (" + stations[id].indicator + ")");
                                $(this).addClass("isFavorite");
                            } else {
                                _this.favoritesService.remove(stations[id].atcoCode);
                                $(this).removeClass("isFavorite");
                            }
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

                        google.maps.event.addListener(infoBox, 'domready', function(){
                            if (_this.favoritesService.isFavorite(stations[id].atcoCode)) {
                                $(infoBox.div_).find(".favorite").addClass("isFavorite");
                            } else {
                                $(infoBox.div_).find(".favorite").removeClass("isFavorite");
                            }
                        });

                        infoBox.setContent(infoWindowContent.get(0));

                        marker.addListener('click', function() {
                            MessagingService.messaging.publish(MessagingService.actions.StationSelected, {
                                atcoCode: id
                            });
                        });

                        //_this.markerCluster.addMarker(marker);
                        _this.markers[stations[id].atcoCode] = marker;
                        _this.infoBoxes[stations[id].atcoCode] = infoBox;
                    }(index));
                }
            }
        });
    };
    
    this.onMarkerClosedManually = function() {
        this.nextBusesDetailsObject.setSelectedStation(null);
        
        if (this.currentInfoBox !== null) {
            this.currentInfoBox.close();
            this.currentInfoBox = null;
        }
    };

    this.initializeMap();

    MessagingService.messaging.subscribe(MessagingService.actions.MapContainerResized, function(msg, data) {
        google.maps.event.trigger(_this.mapObject, "resize");
    });

    MessagingService.messaging.subscribe(MessagingService.actions.StationSelected, function(msg, data) {
        var atcoCode = data.atcoCode;

        var marker = _this.markers[atcoCode];
        var infoBox = _this.infoBoxes[atcoCode];

        if (_this.currentInfoBox !== null) {
            _this.currentInfoBox.close();
            _this.currentInfoBox = null;
        }

        _this.currentInfoBox = infoBox;

        infoBox.open(_this.mapObject, marker);

        _this.mapObject.panTo(marker.position);
    });
}

Map.prototype.getGoogleMapsObject = function() {
    return this.mapObject;
};

Map.prototype.getBounds = function() {
    return this.mapBounds;
};

module.exports = Map;