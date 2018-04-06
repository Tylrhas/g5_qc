module.exports = function (sequelize, Sequelize) {
  var User = sequelize.define('user', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    token: {
      type: Sequelize.STRING
      // notEmpty: true
    },

    name: {
      type: Sequelize.STRING
      // notEmpty: true
    },

    email: {
      type: Sequelize.STRING
      // notEmpty: true
    }

  })

  return User
}
