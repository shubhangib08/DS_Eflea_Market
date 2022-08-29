const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.url = "mongodb://"+process.env.DB_NAME+dbConfig.url;
db.user = require("./register.model.js")(mongoose);
module.exports = db;