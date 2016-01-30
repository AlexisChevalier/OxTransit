var PreferencesService = require('../services/LocalStoragePreferencesService'),
    preferencesService = new PreferencesService(),
    favorites = {},
    favoritesLabel = "FAVORITES";

var favoritesRaw = preferencesService.get(favoritesLabel);

if (favoritesRaw !== null) {
    favorites = JSON.parse(favoritesRaw);
}

function FavoritesService() {
    var _this = this;

    this.saveFavoritesToPreferences = function() {
        var favoritesString = JSON.stringify(favorites);
        preferencesService.set(favoritesLabel, favoritesString);
    }
}

FavoritesService.prototype.add = function(atcoCode, name) {
    var _this = this;

    favorites[atcoCode] = {isFavorite: true, name: name};

    _this.saveFavoritesToPreferences();

    return true;
};

FavoritesService.prototype.isFavorite = function(atcoCode) {
    var _this = this;

    return (favorites[atcoCode] && favorites[atcoCode].isFavorite === true);
};

FavoritesService.prototype.remove = function(atcoCode) {
    var _this = this;

    delete favorites[atcoCode];

    _this.saveFavoritesToPreferences();

    return null;
};

FavoritesService.prototype.getAllFavorites = function() {
    return favorites;
};

module.exports = FavoritesService;