const Article = require('../models/Article');
//const mysql = require('../dal/sequelize');
const utils = require('../utils');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const salt = require('../config/tokenConfig').salt;
const User = require('../models/User');
const Comment = require('../models/Comment');
const qiniu = require('../utils/qiniu');

module.exports = {
	async getArticleList(ctx, next) {
		let time = parseInt(ctx.params.date);
	    let tag = ctx.request.query.tag;
	    let search = ctx.request.query.search;
	    search = new RegExp(search,"i");
	    let date = new Date(time);
	    let condition = {
	        status: {$gt: 0},
	        created: {$lt: date }
	    };
	    if(tag) condition.tag = {$eq: tag};
	    if(search) condition.title = search;
	    console.log(condition)
		let articles = await Article.find(condition,'authId title content image tag created commentCount pv',{sort: {created: -1},limit: 10}).populate('authId','nickname header');
		if(!articles) return ctx.throw(501);
		ctx.body = {
			article: articles
		};
	},
	async getTags(ctx, next) {
		let tags = await Article.distinct('tag');
		ctx.body = {
			tags: tags
		};
	},
	async upload(ctx,next){
		let file = ctx.request.files;
		let result = await qiniu.upload(file);
		if(result.errorMsg){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:result.errorMsg};
		}
		ctx.body = result.url;
	},
	async addArticle(ctx,next){
		let uid = await utils.getIdByToken(ctx);
		let user = await User.findById(uid);
		if(parseInt(user.status) ==0 ){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:"请登陆邮箱激活账号"};
		}
		let data = _.pick(ctx.request.fields,["content","status","tag","title","weather"]);

		if(!(data.content.replace(/<[^>]+>/g,'')).replace(/[&nbsp;]/g,'')){
   				ctx.response.status = 500;
  			   return ctx.response.body = {errorMsg:"您还没写日志内容！"};
		}
		if(_.values(data).length != _.compact(_.values(data)).length){
			   ctx.response.status = 500;
  			   return ctx.response.body = {errorMsg:"所有参数都是必填项"};
		}
		data.authId = uid;
		data.image = ctx.request.fields.image;
		let article = await Article.create(data);
		if(!article) return ctx.throw(501);
		return ctx.body = article;
	},
	async articlePage(ctx,next){
			let own = false;
			let collected = false;
			let articleId = ctx.params.id;
			let ip = ctx.request.ip;
			let uid;
		
			if(ctx.header.authorization){
				//解析token
				let token = ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
				let verify = await jwt.verify(token,salt,"HS256");
				//得到用户id
			    uid = verify.id;
			}
			
			if(!ctx.session.ip){
				ctx.session.ip = [];
			}
			if(!_.includes(ctx.session.ip,ip)){
				ctx.session.ip.push(ip);
				await Article.findByIdAndUpdate(articleId, {$inc: {pv: 1}});
			}
			//浏览数end
			let article = await Article.findById(articleId).populate('authId','nickname header summary');
			//未登录用户
			if(!uid){
				return ctx.body = {
					own:false,
					collected:false,
					article:article
				}
			}
			let user = await User.findById(uid);
			if(!user) return ctx.throw(501);
			_.forEach(user.collectList,(item,index)=>{
				if(item == articleId){
					collected = true;
				}
			});
			if(article.authId._id == uid){
				own = true;
			}
			return ctx.body = {
				article: article,
	            collected: collected,
	            own: own
			}
	},
	async userArticleList(ctx,next){
		let uid = ctx.params.uid;
		let _id;
		if(ctx.header.authorization){
			let token = ctx.header.authorization&&ctx.header.authorization.replace("Bearer ","");
			let verify = await jwt.verify(token,salt,"HS256");
			_id = verify.id;	
		} 
		let time = parseInt(ctx.params.timeStamp);
		let date = new Date(time);
		let condition = {
			authId:{$eq:uid},
			created:{$lt:date}
		}
		if(uid !== _id) condition.status = {$gt:0};
		let articles = await Article.find(condition,'authId title content image tag created commentCount pv',{sort:{create:-1},limit:10}).populate('authId','nickname header');
		if(!articles) return ctx.throw(501);
		let strLen = 200;
		_.forEach(articles,(article,index)=>{
			article.content = article.content.replace(/<\/?[^>]*>/g,'');
			if(article.content.length>strLen){
				article.content = article.content.substring(0,strLen)+"  ..."
			}
		})

		ctx.body = {
			article:articles
		};

	},
	async deleteArticle(ctx,next){
		let articleId = ctx.params.id;
		let _id = await utils.getIdByToken(ctx);
		let article = await Article.findById(articleId);
		if(_id != article.authId){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "token过期，请重新登录！"
			};
		}
		let delArticle = await Article.findByIdAndRemove(articleId)
		await Comment.remove({aid: articleId});

		let success = delArticle?true:false;
		return ctx.body = {
			success:success
		}
	},
	async editArticle(ctx,next){
		let articleId = ctx.params.id;
		let _id = await utils.getIdByToken(ctx);
		let article = await Article.findById(articleId);
		if(_id != article.authId){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "token过期，请重新登录！"
			};
		}
		let data = _.pick(ctx.request.fields,['content','title','weather','tag','status']);
		let newArticle = await Article.findByIdAndUpdate(articleId,data);
		return ctx.body = {
			data:newArticle
		}
	},
	async articleStatus(ctx,next){
		let articleId = ctx.params.id;
		let _id = await utils.getIdByToken(ctx);
		let article = await Article.findById(articleId);
		if(_id != article.authId || article._id != articleId){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "token过期，请重新登录！"
			};
		}
		let status = article.status?0:1;
		let newArticle = await Article.findByIdAndUpdate(articleId,{status:status});
		if(!newArticle) return ctx.throw(501);

		return ctx.body =  newArticle.status
	},
	async articleCollect(ctx,next){
		let uid = await utils.getIdByToken(ctx);
		let aid = ctx.params.id;
		let conditionUser,conditionArticle,collected;
		let user = await User.findById(uid);
		let isCollect = _.findIndex(user.collectList, function(item) {
            return item.toString() == aid;
        });
        if(isCollect !== -1) {
            conditionUser = {'$pull':{'collectList':aid}};
            conditionArticle = {'$inc':{'collectCount':-1}};
            collected = false;
        }else{
            conditionUser = {'$addToSet':{'collectList':aid}};
            conditionArticle = {'$inc':{'collectCount':1}};
            collected = true;
        }
        let newUser =  await User.findByIdAndUpdate(uid,conditionUser);
		let article = await Article.findByIdAndUpdate(aid,conditionArticle,{new:true});
		if(!article){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: "收藏失败！"
			};
		}
		return ctx.body = {
			collectCount: article.collectCount,
            collected: collected
		}
	},
	async articleTogether(ctx,next){
		let uid = ctx.params.id;
		let id;
		
		if(ctx.header.authorization){
			//解析token
			let token = ctx.header.authorization.replace("Bearer ","");
			let verify = await jwt.verify(token,salt,"HS256");
			//得到用户id
		     id = verify.id;
		}
		let time = parseInt(ctx.params.date);
		let date = new Date(time);
		let user = await User.findById(uid);
		let fid = user.friend;
		if(!fid) return ctx.throw(501);
		let condition = {
			authId: {$in: [uid,fid]},
            created: {$lt: date }
		}
		 if(uid != id || uid != fid) condition.status = {$gt: 0};
        let article =  Article.find(condition,'authId title content image tag created commentCount pv', {
            sort: {created: -1},
            limit: 10
        }).populate('authId','nickname sex');
        if(!article) return ctx.throw(501);
        let strLen = 200;
        for(let i=0;i<article.length;i++) {
            article[i].content = article[i].content.replace(/<\/?[^>]*>/g,'');
            if(article[i].content.length>strLen) {
                article[i].content = article[i].content.substring(0, strLen) + "  ...";
            }
        }
        return ctx.body={
        	article:article
        }
	},
	async userCollect(ctx,next){
		let time = parseInt(ctx.params.timeStamp);
	    let date = new Date(time);
		
		let uid = ctx.params.uid;
		if(!uid) return ctx.throw(501);
		let user = await User.findById(uid);
		let collectList = user.collectList;
		let condition = {
	        status: {$gt: 0},
	        created: {$lt: date},
	        _id:{$in:collectList}
	    };
	    
		let articles = await Article.find(condition,'',{ sort: {created: -1},
            limit: 10}).populate('authId','nickname header');;
		let collectArticlesList = [];
		_.forEach(articles,(item,index)=>{
			collectArticlesList.push(item._id)
		});
		if(collectArticlesList.length != collectList.length){
			await User.findByIdAndUpdate(uid,{collectCount:collectArticlesList.length,collectList:collectArticlesList});
		}
		return ctx.body = {
			article:articles
		};
	}
}