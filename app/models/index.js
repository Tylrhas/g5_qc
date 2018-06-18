"use strict";
var fs = require("fs");
var path = require("path");
const Sequelize = require("sequelize");
require('dotenv').config()
if (process.env.ENVIRONMENT === 'dev') {
  var sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    operatorsAliases: false,
  
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  
  });
} else {
  var sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    },
    operatorsAliases: false,
  
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  
  });
}

var db = {};

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function (file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;