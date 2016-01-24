var Map = require("./Map"),
    BottomTab = require("./BottomTab"),
    Locator = require("./Locator");

function Ui() {}

Ui.prototype.Initialize = function () {
    /* Bottom Tab */
    this.bottomTab = new BottomTab(
        document.getElementById('bottomTab'), 
        document.getElementById('mapContainer')
    );
    
    /* Map */
    //this.map = new Map(51.757044, -1.214670, document.getElementById('map'), this.nextBusesDetails);
    this.map = new Map(
        51.755436, 
        -1.226711, 
        document.getElementById('mapContainer'), 
        this.bottomTab.getNextBusDetailsObject()
    );
    
    /* Locator */
    this.locator = new Locator(
        document.getElementById('geoloc'),
        this.map
    ); 
};

module.exports = Ui;