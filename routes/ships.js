/**
 * Default routes.
 */

"use strict";

const express = require("express");
const util = require("../app/util");
const repository = require("../services/db-repository");


var router = express.Router();


/**
 * Populates ship object from form submission.
 *
 * @param   {object}    obj     Parsed form post fields.
 *
 * @returns {object}            Populated ship object.
 */
function populateShip(obj) {
    return {
        _id: obj._id,
        registry: (obj.registry ? obj.registry.trim() : null),
        name: (obj.name ? obj.name.trim() : null),
        "class": (obj["class"] ? obj["class"].trim() : null),
        commissioned: (obj.commissioned ? +obj.commissioned : null),
        decommissioned: (obj.decommissioned ? +obj.decommissioned : null),
        destroyed: !!obj.destroyed
    };
}


/**
 * Gets validation errors for a ship object.
 *
 * @param   {object}    ship    Ship object.
 *
 * @returns {Array}             Array of errors.
 */
function getValidationErrors(ship) {
    let errors = [];
    if (!ship.registry) {
        errors.push("Registreringsnummer måste anges.");
    }
    if (!ship.name) {
        errors.push("Namn måste anges.");
    }
    if (!ship["class"]) {
        errors.push("Klass måste anges.");
    }
    if (ship.commissioned === null) {
        errors.push("Första tjänsteår måste anges.");
    } else if (isNaN(ship.commissioned)) {
        errors.push("Första tjänsteår måste vara numeriskt.");
    }
    if (ship.decommissioned !== null) {
        if (isNaN(ship.decommissioned)) {
            errors.push("Sista tjänsteår måste vara numeriskt.");
        } else if (ship.decommissioned < ship.commissioned) {
            errors.push("Sista tjänsteår kan inte vara tidigare än första tjänsteår.");
        }
    }
    
    return errors;
}


/**
 * Ship list.
 */
router.get("/", function(req, res, next) {
    repository("ships").then(function(shipRepo) {
        shipRepo.retrieve({}, true).then(function(ships) {
            util.renderLayout(req, res, "ships/index", "Stjärnkryssare", { ships });
            shipRepo.connection.close();
        });
    }).catch(next);
});


/**
 * Create ship.
 */
router.all("/create", function(req, res, next) {
    let errors = [];
    let ship = {};
    if (req.method == "POST") {
        ship = populateShip(req.body);
        errors = getValidationErrors(ship);
        if (!errors.length) {
            repository("ships").then(function(shipRepo) {
                shipRepo.save(ship).then(function() {
                    res.redirect("/ships");
                    shipRepo.connection.close();
                });
            }).catch(next);
            return;
        }
    }
    
    util.renderLayout(req, res, "ships/create", "Skapa stjärnkryssare", { errors, ship });
});


/**
 * Edit ship.
 */
router.all("/edit/:id", function(req, res, next) {
    let errors = [];
    let ship = {};
    repository("ships").then(function(shipRepo) {
        shipRepo.find(null, req.params.id).then(function(oldShip) {
            if (oldShip) {
                if (req.method == "POST") {
                    ship = populateShip(req.body);
                    errors = getValidationErrors(ship);
                    if (!errors.length) {
                        shipRepo.save(ship).then(function() {
                            res.redirect("/ships");
                            shipRepo.connection.close();
                        });
                        return;
                    }
                } else {
                    ship = oldShip;
                }
                
                util.renderLayout(req, res, "ships/edit", "Redigera stjärnkryssare", {
                    errors,
                    ship
                });
            } else {
                util.renderLayout(req, res, "ships/404", "Kunde inte hitta stjärnkryssaren", { 
                    id: req.params.id
                });
            }
            
            shipRepo.connection.close();
        });
    }).catch(next);
});


/**
 * Delete ship.
 */
router.all("/delete/:id", function(req, res, next) {
    repository("ships").then(function(shipRepo) {
        shipRepo.find(null, req.params.id).then(function(ship) {
            if (ship) {
                if (req.method == "POST" && req.body.action == "delete") {
                    shipRepo.remove(ship).then(function() {
                        shipRepo.connection.close();
                        res.redirect("/ships");
                    });
                    return;
                }
                
                util.renderLayout(req, res, "ships/delete", "Ta bort stjärnkryssare", { ship });
            } else {
                util.renderLayout(req, res, "ships/404", "Kunde inte hitta stjärnkryssaren", { 
                    id: req.params.id
                });
            }
            
            shipRepo.connection.close();
        });
    }).catch(next);
});


/**
 * Reset ship database.
 */
router.all("/reset", function(req, res, next) {
    if (req.method == "POST" && req.body.action == "reset") {
        require("fs").readFile(
            require("path").resolve(__dirname, "ships.json"),
            "utf8",
            function(err, data) {
                if (err) {
                    next(err);
                    return;
                }
                
                let ships = JSON.parse(data);
                repository("ships").then(function(shipRepo) {
                    shipRepo.collection.deleteMany().then(function() {
                        return shipRepo.collection.insertMany(ships);
                    }).then(function() {
                        res.redirect("/ships");
                        shipRepo.connection.close();
                    });
                }).catch(next);
            }
        );
        return;
    }
    
    util.renderLayout(req, res, "ships/reset", "Återställ databas");
});


module.exports = router;
