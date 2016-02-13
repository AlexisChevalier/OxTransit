var Map = require("./Map"),
    BottomTab = require("./BottomTab"),
    Search = require("./Search"),
    Locator = require("./Locator");

function Ui() {}

Ui.prototype.Initialize = function () {
    /* Bottom Tab */
    this.bottomTab = new BottomTab(
        document.getElementById('bottomTab'), 
        document.getElementById('mapContainer')
    );

    this.search = new Search(
        document.getElementById("searchContainer"),
        document.getElementById("searchButton")
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