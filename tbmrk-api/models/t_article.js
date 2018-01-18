/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_article', {
    _id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tag: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    author: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    created: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'static/img/logo.jpg'
    },
    weather: {
      type: DataTypes.CHAR(10),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(10),
      allowNull: true,
      defaultValue: '1'
    },
    _v: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    pv: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    collect_conunt: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    comment_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    tableName: 't_article',
    timestamps: false
  });
};
