/**
 * Default pages controller.
 */

"use strict";

const util = require("../app/util");


module.exports = {
    /**
     * Index page.
     */
    index: function(req, res) {
        util.renderLayout(req, res, "index", "Kalles sida", { age: util.getAge() });
    },
    
    
    /**
     * About page.
     */
    about: function(req, res) {
        util.renderLayout(req, res, "about", "Om webbplatsen");
    },
    
    
    /**
     * Report page.
     */
    report: function(req, res) {
        util.renderLayout(req, res, "report", "Redovisningar");
    },
    
    
    /**
     * Application page.
     */
    app: function(req, res) {
        util.renderLayout(req, res, "app", "Applikation");
    },
    
    
    /**
     * Chat page.
     */
    chat: function(req, res) {
        util.renderLayout(req, res, "chat", "Chatt");
    }
};
