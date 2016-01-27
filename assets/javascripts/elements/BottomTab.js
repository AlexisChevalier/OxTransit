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
    this.favoritesDetails = new NextBusesDetails(this.rootDomElement.find('#favoritesDetails'));
    this.appInfoDetails = new NextBusesDetails(this.rootDomElement.find('#appInfoDetails'));
    this.tabButtons = this.rootDomElement.find(".nav .button");

    Interact(this.rootDomElement[0])
        .resizable({
            edges: { top: "#resizeGripBar" }
        })
        .on('resizemove', function HandleTabResize(event, mapContainer) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);

            if (event.rect.height < 200 || event.rect.height > 400) {
                return;
            }
        
            _this.rootDomElement.css("height", event.rect.height + 'px');
            _this.mapContainerDomElement.css("bottom", event.rect.height + 'px');
        
            _this.preferencesService.set(_this.heightPreferenceLabel, event.rect.height);
        
            PubSub.publish("MAP_CONTAINER_RESIZED", event.rect.height);
        });

    this.tabButtons.click(function (event) {
        var selected = $(this).attr("data-tab");
        $(".tab.active").removeClass("active");
        $("#" + selected).addClass("active");
        _this.rootDomElement.find(".nav .button.selected").removeClass("selected");
        $(this).addClass("selected");
    });
    
    var preferedHeight = _this.preferencesService.get(_this.heightPreferenceLabel);
    
    if (preferedHeight !== null) {
        _this.rootDomElement.css("height", preferedHeight + 'px');
        _this.mapContainerDomElement.css("bottom", preferedHeight + 'px');
        
        PubSub.publish("MAP_CONTAINER_RESIZED", preferedHeight);
    }
}


BottomTab.prototype.getNextBusDetailsObject = function() {
    return this.nextBusesDetails;
};

module.exports = BottomTab;