const jwt = require('jsonwebtoken');
const salt = require('../config/tokenConfig.js').salt;
const signToken = function(id) {
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        id: id ,
        exp:parseInt(expiry.getTime()/1000)
    },salt);
};

module.exports = signToken;