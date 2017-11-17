/**
 * Example test.
 */

"use strict";

const tap = require("tap");
const util = require("../app/util");


tap.test("Test age calculator", function(t) {
    t.plan(2);
    
    let year = new Date().getFullYear();
    t.equal(util.getAge(year - 47), 47);
    t.equal(util.getAge(), year - 1983);
});
