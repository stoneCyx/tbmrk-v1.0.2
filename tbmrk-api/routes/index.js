//router配置
const router = require('koa-router')();

//controller配置
const path = require('path');
const controllerPath = path.join(process.cwd(),'/controller')
const C = require('../config/controllerConfig')(controllerPath);

//token设置
const jwtKoa = require('koa-jwt')
const salt = require('../config/tokenConfig').salt;

//版本号
const version = 'v1'

//base,the router config
router.all('*',C.base.config)


//router list
router.get('/',C.base.config);
router.get(`/${version}/article/:uid/:timeStamp/collect`,C.article.userCollect);
router.get(`/${version}/article/articleList/:date`,C.article.getArticleList);
router.get(`/${version}/article/tags`,C.article.getTags);
router.post(`/${version}/user/addUser`,C.user.register);
router.get(`/${version}/user/authInfo`,jwtKoa({secret:salt,passthrough: true}),C.user.authInfo);
router.post(`/${version}/auth/local`,C.user.login);
router.get(`/${version}/user/:uid/userInfo`,C.user.userInfo);
router.get(`/${version}/user/set`,jwtKoa({secret:salt}),C.user.userSet);
router.put(`/${version}/user/updateUser`,jwtKoa({secret:salt}),C.user.updateUser);
router.put(`/${version}/user/updatePassword`,jwtKoa({secret:salt}),C.user.updatePassword);
router.post(`/${version}/user/header`,jwtKoa({secret:salt}),C.user.setHeader);
router.get(`/${version}/album/:id/:timeStamp/photoUser`,jwtKoa({secret:salt,passthrough: true}),C.album.photoUser);
router.post(`/${version}/album/addPhoto`,jwtKoa({secret:salt}),C.album.addPhoto);
router.get(`/${version}/album/photoList/:timeStamp`,C.album.photoList);
router.put(`/${version}/album/:id/photoLike`,C.album.photoLike);
router.delete(`/${version}/album/:id`,jwtKoa({secret:salt}),C.album.deletePhoto);
router.post(`/${version}/article/addArticle`,jwtKoa({secret:salt}),C.article.addArticle);
router.get(`/${version}/article/:id/articlePage`,jwtKoa({secret: salt,passthrough: true}),C.article.articlePage);
router.get(`/${version}/article/:uid/:timeStamp`,jwtKoa({secret: salt,passthrough: true}),C.article.userArticleList);
router.delete(`/${version}/article/:id`,jwtKoa({secret:salt}),C.article.deleteArticle);
router.put(`/${version}/article/:id/editArticle`,jwtKoa({secret:salt}),C.article.editArticle);
router.put(`/${version}/article/:id/articleStatus`,jwtKoa({secret:salt}),C.article.articleStatus);
router.put(`/${version}/article/:id/articleCollect`,jwtKoa({secret: salt}),C.article.articleCollect);
router.get(`/${version}/comment/:id/commentList`,C.comment.commentList);
router.post(`/${version}/comment/addComment`,jwtKoa({secret: salt}),C.comment.addComment);
router.delete(`/${version}/comment/:id`,jwtKoa({secret: salt}),C.comment.delComment);
router.get(`/${version}/comment/:id/commentListAll`,C.comment.commentAll);
router.get(`/${version}/article/:id/:date/articleTogether`,jwtKoa({secret: salt,passthrough: true}),C.article.articleTogether);
router.post(`/${version}/article/upload`,jwtKoa({secret: salt}),C.article.upload);
//base
router.get(`/${version}/captcha`,C.base.captcha);//验证码
router.post(`/${version}/email/server`,C.base.emailServer);//发送邮件
router.get(`/${version}/active/server`,C.base.active);//激活账号
router.get(`/${version}/active/emailInfo`,C.base.emailInfo);//获取邮件信息
router.post(`/${version}/resend/email`,C.base.resendEmail);//没收到邮件，再次发生邮件
router.post(`/${version}/reset/pwd`,C.base.resetpwd);//重置密码接口


//404
router.all('*',C.base.error)




module.exports = router
