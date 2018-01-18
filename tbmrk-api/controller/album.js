const Album = require('../models/Album');
const User = require('../models/User')
const utils = require('../utils');
const qiniu = require('../utils/qiniu');
const moment = require('moment');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const salt = require('../config/tokenConfig').salt;
module.exports = {
	async addPhoto(ctx, next) {
		let _id = await utils.getIdByToken(ctx);
		let user = await User.findById(_id);
		if(parseInt(user.status) ==0 ){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:"请登陆邮箱激活账号"};
		}
		let file = ctx.request.files;
		if (!file) return ctx.throw(501);
		let name = file.name;
		let img = await qiniu.upload(file);
		if (!img) {
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "上传失败"
			};
		}
		let photo = await Album.create({
			photo: img.url,
			userId: _id,
			name: name,
			thumbnail:img.thumbnail
		});
		return ctx.body = {
			photo: photo
		}
	},
	async photoUser(ctx, next) {

		let _id;
		if(ctx.header.authorization){
			let token = ctx.header.authorization.replace("Bearer ","");
			let verify = await jwt.verify(token,salt,"HS256");
			_id = verify.id;
		}

		let id = ctx.params.id;
		let time = parseInt(ctx.params.timeStamp);
		let date = new Date(time)
		let own = _id == id ? true : false;

		let condition = {
			userId: {$eq: id},
			created: {$lt: date }
		};
		let photoUserList = function (photo) {
			let photosList = [];
			for(let i=0;i<photo.length;i++) {
				let date = moment(photo[i].created).format('YYYY年MM月DD日');
				let index = _.findIndex(photosList, {'date': date});
				if (index !== -1) {
					photosList[index].list.push(photo[i])
				} else {
					photosList[photosList.length] = {
						date: date,
						list: [photo[i]]
					}
				}
			}
			return photosList;
		};
		let photos = await Album.find(condition,'photo thumbnail created likeCount',{
			sort:{created:-1},
			limit:10
		});
		if(!photos) return ctx.throw(501);
		photosList = photoUserList(photos)
		return ctx.body = {
			own: own,
			photo: photosList
		}
	},
	async photoList(ctx,next){
		let time = parseInt(ctx.params.timeStamp);
		let date = new Date(time);
		let condition = {
			status: {$gt: 0},
			created: {$lt: date }
		};
		let photo = await Album.find(condition,'userId photo thumbnail created likeCount',{sort: {created: -1},limit: 20}).populate('userId','nickname');
		if(!photo) return ctx.throw("501");
		return ctx.body = {
			photo:photo
		}
	},
	async photoLike(ctx,next){
		const id = ctx.params.id;
		const ip = ctx.request.ip;
		if(!id || !ip) return ctx.throw(501);
		let photo = await Album.findById(id);
		if(!photo) return ctx.throw(501);
		let isLiked = _.findIndex(photo.likeToday,{userIp:ip});
		let isToday = function (value) {
			let date = new Date(value);
			let dateToday = new Date();
			return date.getFullYear() === dateToday.getFullYear() && date.getMonth() === dateToday.getMonth() && date.getDate() === dateToday.getDate();
		};
		if(isLiked !== -1 && isToday(photo.likeToday[isLiked].date)){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "今天已经点过赞啦!"
			};
		}else if(isLiked !== -1){
			photo.likeCount += 1;
			photo.likeToday[isLiked].date = new Date();
		}else{
			photo.likeCount += 1;
			photo.likeToday.push({
				userIp: ip,
				date: new Date()
			})
		}
		let newPhoto = await photo.save();		
		if(!newPhoto) return ctx.throw(501);
		ctx.body = {
			pid:newPhoto._id,
			likeCount: newPhoto.likeCount
		}
	},
	async deletePhoto(ctx,next){
		const _id = await utils.getIdByToken(ctx);
		const id = ctx.params.id;
		let photo = await Album.findById(id);
		if(!photo) return ctx.throw(501);
		if (photo.userId != _id){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "token已过期,请重新登录"
			};
		}

		let delPhoto = await Album.findByIdAndRemove(id)
		qiniu.delete(delPhoto.photo);
		ctx.body = {
			photo: delPhoto
		}
	}
}