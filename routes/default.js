/**
 * Default routes.
 */

"use strict";

const express = require("express");
const util = require("../app/util");


var router = express.Router();


/**
 * Index page.
 */
router.get("/", function(req, res) {
    util.renderLayout(req, res, "index", "Kalles sida");
});


/**
 * About page.
 */
router.get("/about", function(req, res) {
    util.renderLayout(req, res, "about", "Om webbplatsen");
});


/**
 * Report page.
 */
router.get("/report", function(req, res) {
    util.renderLayout(req, res, "report", "Redovisningar");
});


module.exports = router;
