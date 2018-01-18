'use strict';
const config = require('../config/mysqlConfig');
const rds = require('ali-rds');
const mysql = rds({
	host: config.tbmrk.HOST,
	user: config.tbmrk.USERNAME,
	password: config.tbmrk.PASSWORD,
	database: config.tbmrk.DB,
	port: config.tbmrk.PORT,
	maximum: 30
});


module.exports = mysql;