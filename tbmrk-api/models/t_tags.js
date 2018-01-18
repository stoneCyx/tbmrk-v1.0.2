/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_tags', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.CHAR(50),
      allowNull: true
    }
  }, {
    tableName: 't_tags',
    timestamps: false
  });
};
