var $ = require('jquery-browserify');

function Locator(rootDomElement, map) {
    this.rootDomElement = $(rootDomElement);
    this.mapObject = map.getGoogleMapsObject();
    this.positionMarker = null;
    
    this.refreshButton = $(this.rootDomElement).find("#geolocalizationButton");
    
    this.localising = false;
    
    var _this = this;
    
    $(this.refreshButton).click(function() {
        _this.Localize();
    });
}

Locator.prototype.Localize = function() {
    var _this = this;

    if (this.localising) {
        return;
    }
    
    this.localising = true;
    
    if (_this.positionMarker !== null) {
        _this.positionMarker.setMap(null);
        _this.positionMarker = null;
    }
    
    if (navigator.geolocation) {
        $(_this.rootDomElement).addClass("loading");
        navigator.geolocation.getCurrentPosition(function(position) {
            var position = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            _this.positionMarker = new google.maps.Marker({
                position: position,
                map: _this.mapObject,
                title: "Your position"
            });

            _this.mapObject.setCenter(position);
            this.localising = false;
            $(_this.rootDomElement).removeClass("loading");
            
        }, function() {
            $(_this.rootDomElement).removeClass("loading");
            this.localising = false;
            //handleLocationError(true, infoWindow, map.getCenter());
            //TODO: Handle errors
        });
    } else {
        $(_this.rootDomElement).removeClass("loading");
        this.localising = false;
        // Browser doesn't support Geolocation
        //handleLocationError(false, infoWindow, map.getCenter());
        //TODO: Handle errors
    }
};

module.exports = Locator;