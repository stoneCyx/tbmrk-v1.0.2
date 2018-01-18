const jwt = require('jsonwebtoken') //用来生成token，返回给前端，前端拿到token写入header里面
const tokenConfig = require('../config/tokenConfig')
const passport = require('../config/passportConfig')
const User = require('../models/User')
const _ = require('lodash')
const utils = require('../utils')
const sendEmail = require('../utils/sendEmail').sendEmail
const salt = require('../config/tokenConfig').salt;
const bcrypt = require('bcrypt-nodejs');
const signToken = require('../utils/signToken.js');
const qiniu = require('../utils/qiniu');
const moment = require('moment');
const Article = require('../models/Article');
const Album = require('../models/Album');
const mysql = require('../dal/aliRds.js');
const getEmailLoginUrl = require('../utils/getEmailLoginUrl').getEmailLoginUrl;

module.exports = {
	//用户注册接口
	async register(ctx,next){
		//获取数据
		let regData = _.pick(ctx.request.fields,['nickname','email','password','passwordRepeat','sex','captcha']);
		console.log(ctx.session.captcha,regData.captcha)
		if(regData.captcha.toLowerCase()  != ctx.session.captcha.toLowerCase() ){
			  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"验证码错误！"};
		}
		if(_.values(regData).length != _.compact(_.values(regData)).length || regData.password !=regData.passwordRepeat){
			   ctx.response.status = 500;
  			   return ctx.response.body = {errorMsg:"参数错误"};
		}
		//验证数据
		 let errorMsg  = utils.check({
		 		nickname: regData.nickname,
                email: regData.email,
                password: regData.password
          });
		//若有错误，返回错误信息
		 if(errorMsg){
		 	  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"密码或账号或昵称格式不正确"};
		 }
		//判断是否可注册
		let reNickname = await User.findOne({nickname:regData.nickname},"_id");
		let reEmail = await User.findOne({email:regData.email},"_id");
		if(reNickname){
			  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"此昵称已被使用！"};
		} 
		if(reEmail){
			  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"此邮箱已注册！"};
		}
		//请求发送邮件，待激活
		let result = await sendEmail(regData.email,regData.nickname);
		if(result){
			return ctx.body = result;
		}
		//返回注册的结果
		let user = await User.addUser(regData);
		return ctx.body = {
			token:user.token
		};
	},
	async authInfo(ctx,next){

		let _id = await utils.getIdByToken(ctx);
		let user = await User.findById(_id);
		if(!user) return ctx.throw(501);
		let articleCount = await Article.count({authId:user._id});
		let photoCount = await Album.count({userId: user._id});
		let authInfo = user.toObject();
		authInfo.articleCount = articleCount;
		authInfo.collectCount = user.collectList.length;
		authInfo.photoCount = photoCount;
		authInfo.id = user._id;
		authInfo.uid = user._id;
		if(authInfo.status == 0) authInfo.loginUrl = getEmailLoginUrl(authInfo.email);

		
		//再次签发token
		let token = signToken(user._id);
		return ctx.body = {
			token : token,
			authInfo : authInfo
		}
	},
	async login(ctx,next){
		let loginData = _.pick(ctx.request.fields,['email','password','captcha']);
		if(loginData.captcha.toLowerCase()  != ctx.session.captcha.toLowerCase() ){
			  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"验证码错误！"};
		}
		//验证数据
		let errorMsg  = utils.check({
                email: loginData.email,
                password: loginData.password
          });
		//若有错误，返回错误信息
		 if(errorMsg){
		 	  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"参数错误！"};
		 }
		let user = await User.findOne({email:loginData.email});
		if(!user){
			  ctx.response.status = 500;
  			  return ctx.response.body = {errorMsg:"用户不存在！"};
		}

		let OYX = await bcrypt.compareSync(loginData.password,user.password);		
		if(!OYX){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:"密码错误！"};
		}
/*		if(user.status === 0){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:"用户未验证,请登陆邮箱验证。"};
         }*/
		let token = signToken(user._id);
		return ctx.body = {
			success:true,
			token:token,
			_id:user._id		
		}
	},
	async userInfo(ctx,next){
		let uid = ctx.params.uid;
		let _id;
		if(ctx.header.authorization){
			let token =  ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
			let verify = await jwt.verify(token,salt,"HS256");
			_id = verify.id;
		}
		let own = _id==uid?true:false;
		let user = await User.findById(uid).populate('friend','nickname header');
		let userInfo = user.toObject();
		userInfo.friend = user.friend;
		let articleCount = await Article.count({authId: user._id});
		let photoCount = await Album.count({userId: user._id});
		
		userInfo.articleCount = articleCount;
		userInfo.collectCount = user.collectList.length;
		userInfo.photoCount = photoCount;
		return ctx.body = {
			own:own,
			userInfo:userInfo
		}
	},
	async userSet(ctx,next){
		let token =  ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
		if(!token){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"token已过期!",own:false};
		}
		let verify = await jwt.verify(token,salt,"HS256");
		let user = await User.find({_id:verify.id});
		return ctx.body = {
			own:true,
			userInfo:user&&user[0]
		} 
	},
	async updateUser(ctx,next){
		//获取数据
		let data = _.pick(ctx.request.fields,['nickname','birthdayDay','birthdayMonth','blood','qqnumber','summary','url','header','sex','showEmail']);
		if(_.values(data).length==0){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"没有任何更改数据"};
		}
		//验证数据
		let errorMsg  = data.nickname?utils.check({nickname: data.nickname}):false;
      	if(errorMsg){
      		ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"昵称格式错误"};
      	}
	    if (data.summary && data.summary.length > 50) {
	    	ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"简介在50字以内"};
	    }
	    if (data.url && data.url.length > 200) {
	   		ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"博客地址过长"};	
	    }
	    if (data.qqnumber && data.qqnumber.length > 30) {
	    	ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"qq号过长"};	
	    }
		//获取_id
		let token =  ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
		if(!token){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"token已过期!",own:false};
		}
		let verify = await jwt.verify(token,salt,"HS256");
		let _id = verify.id;
		let user = await User.findById(_id);
		//更新两个json
		_.assign(user,data)
		//let user = await User.findByIdAndUpdate({_id:_id},data);
		if(data.birthdayMonth) user.birthday.month = data.birthdayMonth;
		if(data.birthdayDay) user.birthday.day = data.birthdayDay;		
		user.save();
		return ctx.body = {
			userInfo:user||"用户不存在"
		}
	},
	async updatePassword(ctx,next){
		//验证数据
		let password = ctx.request.fields.password;
		let passwordRepeat = ctx.request.fields.passwordRepeat;
		if(password !== passwordRepeat){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"两次输入密码不一致"};
		}
		let errorMsg  = utils.check({
                password: password
          });
		if(errorMsg){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"密码格式错误"};
		}
		//获取_id
		let token =  ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
		if(!token){
			ctx.response.status = 500;
			return ctx.response.body = {errorMsg:"token已过期!",own:false};
		}
		let verify = await jwt.verify(token,salt,"HS256");
		let _id = verify.id;
		password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
		let user = await User.findByIdAndUpdate({_id:_id},{password:password});
		return ctx.body = user?{success: true}:{errorMsg:"用户不存在"};
	},
	async setHeader(ctx,next){
		//获取_id
		let _id = await utils.getIdByToken(ctx);
		let file = ctx.request.files;
		let img = await qiniu.upload(file);
		let user = await User.findByIdAndUpdate({_id:_id},{header:img.url});
		if(!user) ctx.throw(501);
		return ctx.body = {url:img.url};
	}
}