'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // An Item belongs to a Category
      Item.belongsTo(models.Category, {
        foreignKey: 'CategoryId'
      });

      // An Item belongs to a User
      Item.belongsTo(models.User, {
        foreignKey: 'UserId'
      });

      // An Item has many Invoices
      Item.hasMany(models.Invoice, {
        foreignKey: 'ItemId'
      });
    }
  }
  Item.init({
    itemName: DataTypes.STRING,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    description: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    imageURL: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};