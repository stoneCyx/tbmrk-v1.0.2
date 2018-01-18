/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_user', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    articleCount: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    birthdayDay: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true
    },
    birthdayMonth: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    blood: {
      type: DataTypes.CHAR(50),
      allowNull: true
    },
    collectCount: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    created: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    passwordRepeat: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fid: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    friend: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    header: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nickname: {
      type: DataTypes.CHAR(30),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    photoCount: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    qqnumber: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    sex: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
    showEmail: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '1'
    },
    summary: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 't_user',
    timestamps: false
  });
};
