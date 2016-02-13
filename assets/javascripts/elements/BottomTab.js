var $ = require('jquery-browserify'),
    NextBusesDetails = require('./NextBusesDetails'),
    FavoritesDetails = require('./FavoritesDetails'),
    Interact = require("interact.js"),
    PreferencesService = require('../services/LocalStoragePreferencesService'),
    MessagingService = require("../services/MessagingService");

function BottomTab(rootDomElement, mapContainerDomElement, mapObject) {
    var _this = this;

    this.heightPreferenceLabel = "BOTTOM_TAB_HEIGHT";
    this.widthPreferenceLabel = "LEFT_TAB_WIDTH";
    this.preferencesService = new PreferencesService();
    this.mapObject = mapObject;
    this.mapContainerDomElement = $(mapContainerDomElement);
    this.rootDomElement = $(rootDomElement);
    this.nextBusesDetails = new NextBusesDetails(this.rootDomElement.find('#nextBusesDetails'));
    this.favoritesDetails = new FavoritesDetails(this.rootDomElement.find('#favoritesDetails'));
    this.appInfoDetails = null;
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

                MessagingService.messaging.publish(MessagingService.actions.MapContainerResized, event.rect.height);
        });

    this.switchToTab = function(tabId) {
        $(".tab.active").removeClass("active");
        $("#" + tabId).addClass("active");
        _this.rootDomElement.find(".nav .button.selected").removeClass("selected");
        $(".button[data-tab='" + tabId + "']").addClass("selected");
    };

    this.tabButtons.click(function (event) {
        var selected = $(this).attr("data-tab");

        _this.switchToTab(selected);
    });

    var preferedHeight = _this.preferencesService.get(_this.heightPreferenceLabel);

    if (preferedHeight !== null) {
        _this.rootDomElement.css("height", preferedHeight + 'px');
        _this.mapContainerDomElement.css("bottom", preferedHeight + 'px');

        MessagingService.messaging.publish(MessagingService.actions.MapContainerResized, preferedHeight);
    }

    MessagingService.messaging.subscribe(MessagingService.actions.StationSelected, function(msg, data) {
        _this.switchToTab("nextBusesDetails");
    });
}


BottomTab.prototype.getNextBusDetailsObject = function() {
    return this.nextBusesDetails;
};

module.exports = BottomTab;