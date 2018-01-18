/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_album', {
    _id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    photo: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    thumbnail: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    likeCount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    desc: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    userid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 't_album',
    timestamps: false
  });
};
