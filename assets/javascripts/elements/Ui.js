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
    this.map = new Map(
        51.745436, 
        -1.227711, 
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