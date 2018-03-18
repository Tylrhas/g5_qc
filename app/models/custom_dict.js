module.exports = function (sequelize, Sequelize) {
    
    var custom_dict = sequelize.define('custom_dict', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        word: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    },
    {
    //singular table name
    freezeTableName: true,
    });

    return custom_dict;

}