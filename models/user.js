'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs')
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
        foreignKey: 'userId' 
      });

      // A User has many Items
      User.hasMany(models.Item, { 
        foreignKey: 'userId' 
      });

      // A User has many Invoices
      User.hasMany(models.Invoice, { 
        foreignKey: 'userId' 
      });
    }
  }
  User.init({
    userName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate(instance, options) {
        var salt = bcrypt.genSaltSync(8);
        var hash = bcrypt.hashSync(instance.password, salt);

        instance.password = hash
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};