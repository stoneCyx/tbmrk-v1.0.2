/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_collect', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    uid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    aid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 't_collect',
    timestamps: false
  });
};
