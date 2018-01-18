const mongoose = require('mongoose');
const mongodbConfig = require('../config/mongodbConfig')
mongoose.Promise = global.Promise;
const DB_URL = mongodbConfig.tbmrk;

//mongoose.Promise = global.Promise;  
/**
 * 连接
 */
mongoose.connect(DB_URL,{useMongoClient:true});
/**
  * 连接成功
  */
mongoose.connection.on('connected', function () {    
    console.log('(mongodb连接成功)Mongoose connection open to ' + DB_URL);  
});

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {    
    console.log('(mongodb连接异常)Mongoose connection error: ' + err);  
});    
 
/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {    
    console.log('(mongodb连接断开)Mongoose connection disconnected');  
}); 

module.exports = mongoose;