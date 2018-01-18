const config = require('../config/mysqlConfig');

const t_album = require('../models/t_album');
const t_article = require('../models/t_article');
const t_collect = require('../models/t_collect');
const t_comment = require('../models/t_comment');
const t_tags = require('../models/t_tags');
const t_user = require('../models/t_user');

const Sequelize = require('sequelize');
//建立连接
const sequelize = new Sequelize('tbmrk',config.tbmrk.USERNAME, config.tbmrk.PASSWORD, {
	host: config.tbmrk.HOST,
	dialect: 'mysql',
	pool: {
		max: 30,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	freezeTableName: true
});
//测试连接
sequelize
	.authenticate()
	.then(() => {
		console.log('(mysql连接成功)Connection has been established successfully.');
	})
	.catch(err => {
		console.error('(mysql连接失败)Unable to connect to the database:', err);
	});
//modules list
const Album = t_album(sequelize,Sequelize);
const Article = t_article(sequelize,Sequelize);
const Collect = t_collect(sequelize,Sequelize);
const Comment = t_comment(sequelize,Sequelize);
const Tags = t_tags(sequelize,Sequelize);
const User = t_user(sequelize,Sequelize);


module.exports =  sequelize.models;
	
