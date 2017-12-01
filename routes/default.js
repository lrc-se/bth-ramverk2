/**
 * Default routes.
 */

"use strict";

const express = require("express");
const defaultController = require("../controllers/default");


var router = express.Router();


/**
 * Index page.
 */
router.get("/", defaultController.index);


/**
 * About page.
 */
router.get("/about", defaultController.about);


/**
 * Report page.
 */
router.get("/report", defaultController.report);


/**
 * Application page.
 */
router.get("/app", defaultController.app);


/**
 * Chat page.
 */
router.get("/chat", defaultController.chat);


module.exports = router;
