"use strict";

const express = require("express");
const util = require("../app/util");


var router = express.Router();

router.get("/", function(req, res) {
    util.renderLayout(req, res, "index", "Kalles sida");
});

router.get("/about", function(req, res) {
    util.renderLayout(req, res, "about", "Om webbplatsen");
});

router.get("/report", function(req, res) {
    util.renderLayout(req, res, "report", "Redovisningar");
});


module.exports = router;
