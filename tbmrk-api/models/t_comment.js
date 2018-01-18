/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_comment', {
    _id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    aid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    userid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '1'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 't_comment',
    timestamps: false
  });
};
