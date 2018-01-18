const User = require('../models/User')
const Comment = require('../models/Comment');
const _ = require('lodash')
const utils = require('../utils')
const salt = require('../config/tokenConfig').salt;
const Article = require('../models/Article');

module.exports = {
	async commentList (ctx,next){
		let aid = ctx.params.id;
		let comments = await Comment.find({aid:aid,status:{$eq: 1}}).sort('created').limit(10).populate('userId', 'nickname header')
		if(!comments) return ctx.throw(501);

		function arrayToTree(data, id, pid){      //将ID、ParentID这种数据格式转换为树格式
     	
            var childrenName = "children"; 
            if (!data || !data.length) return [];
            var targetData = [];                    //存储数据的容器(返回) 
            var records = {};
            var itemLength = data.length;           //数据集合的个数
            for (var i = 0; i < itemLength; i++)
            {
                var o = data[i];
                var key = getKey(o[id]);
                records[key] = o;
               
            } 
            console.log(records);//一共多少条数据，并用id将其对应
            for (var i = 0; i < itemLength; i++)
            {
                var currentData = data[i];
                var key = getKey(currentData[pid]);
                var parentData = records[key];   
                if (!parentData)
                {
                    targetData.push(currentData);
                    continue;//结束本次循环，直接跳下一步，break则为跳出所有循环
                }
                parentData[childrenName] = parentData[childrenName] || [];
                parentData[childrenName].push(currentData);
            }
            console.log(`最终结果为：${JSON.stringify(targetData)}`)
            return targetData;
            function getKey(key)
            {
                if (typeof (key) == "string") key = key.replace(/[.]/g, '').toLowerCase();
                return key;
            }
        }

        let data = [];
		_.forEach(comments,(item,k)=>{
			data.push(item.toObject());
		});
		
        let newComments = arrayToTree(data,'_id','pid');

		return ctx.body = {
			comment: newComments
		}
	},
	async addComment (ctx,next){
		let userId = await utils.getIdByToken(ctx);
		let user = await User.findById(userId);
		if(parseInt(user.status) == 0 ){
			 ctx.response.status = 500;
  			 return ctx.response.body = {errorMsg:"请登陆邮箱激活账号"};
		}
		let data = _.pick(ctx.request.fields,['aid','content'])
		let errorMsg;
		if(!data.aid){
			errorMsg = '缺少必须参数';
		}else if(!data.content || data.content == ''){
			errorMsg = "留言内容不能为空";
		}else if(data.content.length > 500){
			errorMsg = "留言内容过长";
		}
		if(errorMsg){
			ctx.response.status = 500;
			return ctx.response.body = {
				errorMsg: errorMsg
			};
		}
		data.userId = userId;
		let comment = await Comment.create(data);
		let article = await Article.findByIdAndUpdate(data.aid,{ $inc:{commentCount:1}},{new:true});
		if(!comment || !article) return ctx.throw(501);
		return ctx.body = {
			comment: comment,
			commentCount: article.commentCount
		};
	},
	async delComment(ctx,next){
		let cid = ctx.params.id;
		let delComment = await Comment.findByIdAndRemove(cid);
		let article = await Article.findByIdAndUpdate(delComment.aid, {$inc: {commentCount: -1}},{new:true});
		if(!article) return ctx.throw(501);
		return ctx.body = {
			aid:article._id,
			commentCount:article.commentCount
		}
	},
	async commentAll(ctx,next){
		let aid = ctx.params.id;
		let comments = Comment.find({aid:aid,status:{$eq:1}}).sort('created').populate('userId', 'nickname header');
		if(!comments) return ctx.throw(501);
		return ctx.body = {
			comment:comments
		}
	}
}