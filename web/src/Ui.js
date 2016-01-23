var Map = require("./Map"),
    NextBusesDetails = require("./NextBusesDetails"),
    Locator = require("./Locator");

function Ui() {}

Ui.prototype.Initialize = function () {
    this.nextBusesDetails = new NextBusesDetails(document.getElementById('nextBusesDetails'));
    //this.map = new Map(51.757044, -1.214670, document.getElementById('map'), this.nextBusesDetails);
    this.map = new Map(51.755436, -1.226711, document.getElementById('map'), this.nextBusesDetails); 
    
    this.locator = new Locator(document.getElementById('geoloc'), this.map); 
};

module.exports = Ui;