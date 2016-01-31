var $ = require('jquery-browserify'),
    FavoritesService = require("../services/FavoritesService"),
    MessagingService = require("../services/MessagingService");

function FavoriteDetails(rootDomElement) {
    this.rootDomElement = $(rootDomElement);
    this.listElement = $(this.rootDomElement).find(".content");
    this.favoritesService = new FavoritesService();
    this.infoMessageElement = $(this.rootDomElement).find(".message");
    this.infoMessageElementText = $(this.infoMessageElement).find("p");

    var _this = this;

    this.fetchAndDisplayList = function () {
        var _this = this;

        var favorites = _this.favoritesService.getAllFavorites();
        $(_this.listElement).html("");

        if (favorites && Object.keys(favorites).length > 0) {
            _this.infoMessageElement.hide();
            for (var i in favorites) {
                if (favorites.hasOwnProperty(i)) {
                    (function(index) {
                        var element = $(buildListItem(favorites[index]));
                        $(element).click(function() {
                            MessagingService.messaging.publish(MessagingService.actions.StationSelected, {
                                atcoCode: index
                            });
                        });
                        $(_this.listElement).append(element);
                    }(i));
                }
            }
        } else {
            _this.infoMessageElementText.text("You don't have any favorites at the moment");
            _this.infoMessageElement.show();
        }

    };

    MessagingService.messaging.subscribe(MessagingService.actions.FavorisListUpdated, function(msg, data) {
        console.log("Hey");
        _this.fetchAndDisplayList();
    });

    _this.fetchAndDisplayList();
}

function buildListItem(details) {
    return "<li class='favorite'>" + details.name + "</li>";
}

module.exports = FavoriteDetails;