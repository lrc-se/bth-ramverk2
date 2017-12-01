/**
 * Ship routes.
 */

"use strict";

const express = require("express");
const shipController = require("../controllers/ship");


var router = express.Router();


/**
 * Ship list.
 */
router.get("/", shipController.index);


/**
 * Create ship.
 */
router.all("/create", shipController.create);


/**
 * Edit ship.
 */
router.all("/edit/:id", shipController.edit);


/**
 * Delete ship.
 */
router.all("/delete/:id", shipController.remove);


/**
 * Reset ship database.
 */
router.all("/reset", shipController.reset);


module.exports = router;
