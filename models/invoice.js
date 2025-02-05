'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // An Invoice belongs to a User
      Invoice.belongsTo(models.User, {
        foreignKey: 'UserId'
      });

      // An Invoice belongs to an Item
      Invoice.belongsTo(models.Item, {
        foreignKey: 'ItemId'
      });
    }
  }
  Invoice.init({
    code: DataTypes.STRING,
    ItemId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Invoice',
  });
  return Invoice;
};