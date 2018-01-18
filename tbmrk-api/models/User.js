const mongoose = require('../dal/mongoose');
const signToken = require('../utils/signToken.js');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

var userSchema = new Schema({
    nickname:String,
    email: { type : String, lowercase: true },
    provider: { type : String, default : 'local'},
    github:{
        id: String,
        token: String,
        email: String,
        name: String
    },
    weibo:{
        id: String,
        token: String,
        email: String,
        name: String
    },
    password: String,
    salt: String,
    role: { type: String , default : 'user' },
    status: { type:Number, default: 0 },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    header: { type: String , default: '/static/img/header.jpg' },
    sex: { type: Number, default: 1 , min: 1 , max: 2},
    showEmail: { type: Number, default: 1 },
    birthday: {
        month: { type: Number, default: 0 , min: 0 , max: 12 },
        day: { type: Number, default: 0 ,min: 0 , max: 31 }
    },
    blood: { type: Number, default: 0 },
    summary: String,
    url: String,
    qqnumber: String,
    collectList:[{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }],
    friend:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
},{collection:'User'});

var User = mongoose.model('User', userSchema);

User.addUser = async function(regData){
    regData.password = bcrypt.hashSync(regData.password, bcrypt.genSaltSync(10));
    let user = await User.create(regData);
    if(!user) return null;
    let token = signToken(user._id)
    return {user:user,token:token};
}

module.exports = User;
