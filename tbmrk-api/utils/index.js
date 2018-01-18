const _ = require('lodash');
const jwt = require('jsonwebtoken') //用来生成token，返回给前端，前端拿到token写入header里面
const salt = require('../config/tokenConfig').salt;
const regexs ={
		nickname:/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5]{1,8}$/,
		uid: /^\d+$/,
		account: /^1\d{10}$/,
		password: /^.{6,32}$/,
		jy_password: /^.{5,16}$/,
		smscode: /^\d{4}$/,
		vcode: /^[a-z0-9A-Z]{4}$/,
		email: /^[0-9a-zA-Z-_\.]+@[0-9a-zA-Z-_\.]+\.[0-9a-zA-Z-_\.]+$/,
		idnum: /^[a-z0-9A-Z]{15,18}$/,
	}
module.exports = {
		// 校验输入对象内所有数据是否符合既定规范
		// cols: { account: xxxx, password: xxx, .... }
		check (cols){
			
			if (!_.isPlainObject(cols)) return null;
			for (let k in cols) {
				if (regexs[k] && !regexs[k].test(cols[k])) {
					return `ERR_FORMAT_ERROR:${k}`;
				}
				if (k == 'idnum' && cols[k]) {
					return 'ERR_AGE_ERROR';
				}
				if (cols[k].toLowerCase && cols[k].toLowerCase() == 'null') cols[k] = null;
			}
			return null;
		},
		async getIdByToken(ctx){
			//解析token
			let token = ctx.header.authorization.replace("Bearer ","");
			let verify = await jwt.verify(token,salt,"HS256");
			//得到用户id
			let _id = verify.id;
			if(!_id){
				ctx.response.status = 500;
				return ctx.response.body = {errorMsg:"token已过期,请重新登陆！"}
			}
			return _id;
		},
		//生成随机字符串
	   randomString(len) {
		　　len = len || 32;
		　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
		　　var maxPos = $chars.length;
		　　var pwd = '';
		　　for (i = 0; i < len; i++) {
		　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
		　　}
		　　return pwd;
		}
}