/**
 * Route setup.
 *
 * @module routes/routes
 */

"use strict";

// route definitions
var routes = [
    {
        base: "/",
        file: "default"
    }
];


module.exports = {
    /**
     * Sets up the application's routes.
     *
     * @param   {object}    app     Express application object.
     */
    setup: function(app) {
        for (let route of routes) {
            app.use(route.base, require("./" + route.file));
        }
    }
};
