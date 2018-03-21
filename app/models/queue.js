module.exports = function (sequelize, Sequelize) {
  var jobQueue = sequelize.define('jobQueue', {

    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    processing: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  },
  {
    // singular table name
    freezeTableName: true
  })

  return jobQueue
}
