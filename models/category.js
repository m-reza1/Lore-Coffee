'use strict';
const {
  Model,
  Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A Category has many Items
      Category.hasMany(models.Item, {
        foreignKey: 'categoryId'
      });
    }

    //STATIC METHOD
    static filterByCategory(categoryName) {
      let option = {
        order: [['categoryName', 'ASC']],
        include: [{ model: sequelize.models.Item }],
      };

      if (categoryName) {
        option.where = { categoryName };
      }

      return this.findAll(option);
    }

  }
  Category.init({
    categoryName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};