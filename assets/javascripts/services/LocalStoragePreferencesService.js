function LocalStoragPreferencesService() {
    
    this.keyPrefix = "OXBUSPREF_";
    
    this.isLocalStorageAvailable = function() {
        return window.localStorage;
    }
}

LocalStoragPreferencesService.prototype.set = function(key, value) {
    var _this = this;
    
    if (_this.isLocalStorageAvailable()) {
        key = _this.keyPrefix + key.toString();
        
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch(ex) {
            return false;
        }
    }
    
    return true;
};

LocalStoragPreferencesService.prototype.get = function(key) {
    var _this = this;
    
    if (_this.isLocalStorageAvailable()) {
        key = _this.keyPrefix + key.toString();
        
        try {
            return JSON.parse(window.localStorage.getItem(key));
        } catch(ex) {
            return null;
        }
    }
    
    return null;
};

module.exports = LocalStoragPreferencesService;