var $ = require('jquery-browserify'),
    ApiService = require("../services/ApiService"),
    MessagingService = require("../services/MessagingService");

function Search(rootDomElement, searchOpenButtonElement) {
    this.rootDomElement = $(rootDomElement);
    this.searchOpenButtonElement = $(searchOpenButtonElement);
    this.listElement = $(this.rootDomElement).find(".list");
    this.apiService = new ApiService("/api/");
    this.infoMessageElement = $(this.rootDomElement).find(".message");
    this.input = $(this.rootDomElement).find("#searchInput");
    this.close = $(this.rootDomElement).find(".exit");
    this.infoMessageElementText = $(this.infoMessageElement).find("p");
    this.currentTextSearch = "";

    var _this = this;

    this.input.on("input", function() {
        var text = $(this).val();

        if (text.length === 0) {
            _this.infoMessageElementText.text("Search a station by typing its name");
        } else if (text.length <= 2) {
            _this.infoMessageElementText.text("You must type at least three characters");
        } else {
            _this.currentTextSearch = text;
            _this.fetchAndDisplayList(text);
        }
    });

    this.close.click(function () {
        _this.closeSearch();
    });

    this.searchOpenButtonElement.click(function() {
        _this.openSearch();
    });

    this.openSearch = function () {
        $(this.rootDomElement).slideDown("fast");
        $(_this.listElement).html("");
        _this.input.val("");
        _this.infoMessageElementText.text("Search a station by typing its name");
        _this.input.focus();
    };

    this.closeSearch = function () {
        $(this.rootDomElement).slideUp("fast");
        $(_this.listElement).html("");
        _this.input.val("");
        _this.infoMessageElementText.text("Search a station by typing its name");
    };

    this.fetchAndDisplayList = function (text) {
        var _this = this;

        $(_this.listElement).html("");

        _this.apiService.searchStation(text, function (err, stations) {
            if (text !== _this.currentTextSearch) {
                return;
            }

            if (stations && stations.length > 0) {
                _this.infoMessageElement.hide();
                for (var i in stations) {
                    if (stations.hasOwnProperty(i)) {
                        (function(index) {
                            var element = $(buildListItem(stations[index]));
                            $(element).click(function() {
                                MessagingService.messaging.publish(MessagingService.actions.StationSelected, {
                                    atcoCode: stations[index].atcoCode
                                });
                                _this.closeSearch();
                            });
                            $(_this.listElement).append(element);
                        }(i));
                    }
                }
            } else {
                _this.infoMessageElementText.text("Your research returned no results");
                _this.infoMessageElement.show();
            }
        });
    };

    MessagingService.messaging.subscribe(MessagingService.actions.FavorisListUpdated, function(msg, data) {
        _this.fetchAndDisplayList();
    });

    _this.fetchAndDisplayList();
}

function buildListItem(details) {
    return "<li>" + details.name + " (" + details.indicator + ") <i class='fa fa-caret-right'></i></li>";
}

module.exports = Search;