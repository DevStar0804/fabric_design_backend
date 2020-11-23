module.exports = app => {
  const checks = require("../controllers/check.controller.js");

  var router = require("express").Router();

  // Create a new Order
  router.post("/", checks.check);

  app.use('/api/checks', router);
};
