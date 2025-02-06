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
        foreignKey: 'categoryId'
      });

      // An Item belongs to a User
      Item.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      // An Item has many Invoices
      Item.hasMany(models.Invoice, {
        foreignKey: 'itemId'
      });
    }
  }
  Item.init({
    itemName: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    imageURL: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};