"use strict";

// route definitions
var routes = [
    {
        base: "/",
        file: "default"
    }
];


module.exports = {
    setup: function(app) {
        for (let route of routes) {
            app.use(route.base, require("./" + route.file));
        }
    }
};
