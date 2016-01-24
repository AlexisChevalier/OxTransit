var $ = require('jquery-browserify'),
    NextBusesDetails = require('./NextBusesDetails'),
    Interact = require("interact.js"),
    PreferencesService = require('../services/LocalStoragePreferencesService'),
    PubSub = require("pubsub-js");

function BottomTab(rootDomElement, mapContainerDomElement, mapObject) {
    var _this = this;
    
    this.heightPreferenceLabel = "BOTTOM_TAB_HEIGHT";
    
    this.preferencesService = new PreferencesService();
    this.mapObject = mapObject;
    this.mapContainerDomElement = $(mapContainerDomElement);
    this.rootDomElement = $(rootDomElement);
    this.nextBusesDetails = new NextBusesDetails(this.rootDomElement.find('#nextBusesDetails'));
    
    Interact(this.rootDomElement[0])
        .resizable({
            edges: { top: "#resizeGripBar" }
        })
        .on('resizemove', function HandleTabResize(event, mapContainer) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);

            if (event.rect.height < 100 || event.rect.height > 400) {
                return;
            }
        
            _this.rootDomElement.css("height", event.rect.height + 'px');
            _this.mapContainerDomElement.css("bottom", event.rect.height + 'px');
        
            _this.preferencesService.set(_this.heightPreferenceLabel, event.rect.height + 'px');
        
            PubSub.publish("MAP_CONTAINER_RESIZED", event.rect.height + 'px');
        });
    
    var preferedHeight = _this.preferencesService.get(_this.heightPreferenceLabel);
    
    if (preferedHeight !== null) {
        _this.rootDomElement.css("height", preferedHeight);
        _this.mapContainerDomElement.css("bottom", preferedHeight);
        
        PubSub.publish("MAP_CONTAINER_RESIZED", preferedHeight);
    }
}


BottomTab.prototype.getNextBusDetailsObject = function() {
    return this.nextBusesDetails;
};

module.exports = BottomTab;