'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A User has one Profile
      User.hasOne(models.Profile, { 
        foreignKey: 'UserId' 
      });

      // A User has many Items
      User.hasMany(models.Item, { 
        foreignKey: 'UserId' 
      });

      // A User has many Invoices
      User.hasMany(models.Invoice, { 
        foreignKey: 'UserId' 
      });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};