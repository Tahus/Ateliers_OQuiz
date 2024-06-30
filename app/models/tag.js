const Sequelize = require('sequelize');
const sequelize = require('../database');

class Tag extends Sequelize.Model {};

Tag.init({
  name: Sequelize.STRING,
  color: Sequelize.STRING
},{
  sequelize,
  tableName: "tag"
});

// on exporte la class directement !
module.exports = Tag;