module.exports = app => {
  const newUser = require("../controllers/register.controller.js");
  var router = require("express").Router();
  router.post("/addUser", newUser.register);
  router.get("/getUser", newUser.findUser);
  app.use('/register', router);
};