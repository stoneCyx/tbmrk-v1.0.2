const svgCaptcha = require('svg-captcha');
const nodemailer = require('nodemailer'); //nodemailer@0.7 版本
const utils = require('../utils')
const _ = require('lodash');
const mysql = require('../dal/aliRds.js');
const User = require('../models/User')
const getEmailLoginUrl = require('../utils/getEmailLoginUrl').getEmailLoginUrl;
const sendEmail = require('../utils/sendEmail').sendEmail;
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const emailConfig = require('../config/emailConfig');
module.exports = {
	async config(ctx, next) {
		console.log('=========================================   this is route confing  ==============================================');
		await next();
	},
    async captcha(ctx,next){
        let captcha = svgCaptcha.create({
            height:30,
            width:140,
            fontSize:40,
            color: true,
            noise: 1
        });
        ctx.session.captcha = captcha.text;
        ctx.type = 'svg';
        return ctx.body = captcha.data;
    },
    emailServer(ctx,next){
        let data = _.pick(ctx.request.fields,["nickname","code","email","resetPwdCode"]);
        let nickname = data.nickname;
        let code = data.code;
        let email = data.email;
        let resetPwdCode = data.resetPwdCode;
        console.log(`================发送邮件接口================`)
        //配置邮件
        let transporter = nodemailer.createTransport('SMTP',{
            host: "smtp.163.com",
            secureConnection: true,
            port:465,
            auth: {
                user: 'weiwf1990@163.com',
                pass: 'a395891612',
            }
        });
        //发送邮件
        let sendmail = function(html){
            let option = {
                from:"weiwf1990@163.com",
                to:email
            }
            option.subject = resetPwdCode?'重置密码':'欢迎注册眼镜日记';
            option.html= html;
            transporter.sendMail(option, function(error, response){
                if(error){
                    console.log(`邮件发送失败，message:${error}`);  
                    ctx.response.status = 500;
                    return ctx.response.body = {
                        errorMsg: "邮件发送失败"
                    };
                }else{
                    console.log(`邮件成功发送到${email},message:  + ${response.message}`);
                    return ctx.body = {
                        success:true
                    }
                }
            });
        }
        //邮件内容
        let html = `<div style="margin: 80px auto 0; width: 580px; background: #FFF; box-shadow: 0 0 10px #333; text-align:left;">
        <div style="margin: 0 40px; color: #999; border-bottom: 1px dotted #DDD; padding: 40px 0 30px; font-size: 13px; text-align: center;"><a href="${emailConfig.webUrl}" target="_blank"><img src="http://www.tbmrk.com/static/img/logo.png"></a><br></div>
        <div style="padding: 30px 40px 40px;"> ${nickname} 您好，感谢您注册 眼镜日记 闲聊社区<br><br>请在 24 小时内点击此链接以完成注册
        <a style="color: #009A61; text-decoration: none;" href="${emailConfig.serverUrl}/v1/active/server?code=${code}" target="_blank">${emailConfig.webUrl}/user/confirm?type=register&amp;code=1c47c08cae07b2a9c7b55faa18a511a5</a><br>
        完成激活后，如需设置密码<a href="http://www.tbmrk.com/track/click/resetpwd/${code}.html" target="_blank">请点击</a><br>激活遇到问题？请联系我们 weiwf1990@163.com</div>
        <div style="text-align: center;"><a href="http://api.tbmrk.com/v1/active/server?code=${code}" style="display: block;height: 160px;" target="_blank"><img src="javascript:;" style="width: 520px;"></a></div>
        <div style="background: #EEE; border-top: 1px solid #DDD; text-align: center; height: 90px; line-height: 90px;"><a href="${emailConfig.serverUrl}/v1/active/server?code=${code}".html" style="padding: 8px 18px; background: #009A61; color: #FFF; text-decoration: none; border-radius: 3px;" target="_blank">完成注册 ➔</a></div></div>`
        //调用发送邮件
        if(resetPwdCode){
            html = `<div style="margin: 80px auto 0; width: 580px; background: #FFF; box-shadow: 0 0 10px #333; text-align:left;">
            <div style="margin: 0 40px; color: #999; border-bottom: 1px dotted #DDD; padding: 40px 0 30px; font-size: 13px; text-align: center;"><a href="${emailConfig.webUrl}" target="_blank"><img src="http://www.tbmrk.com/static/img/logo.png"></a><br></div>
            <div style="padding: 30px 40px 40px;">${nickname} 您好，您申请了重置登录密码<br><br>请在 1 小时内点击此链接以完成重置</div>
            <div style="background: #EEE; border-top: 1px solid #DDD; text-align: center; height: 90px; line-height: 90px;"><a href="${emailConfig.webUrl}/user/${code}/resetpwd" style="padding: 8px 18px; background: #009A61; color: #FFF; text-decoration: none; border-radius: 3px;" target="_blank">完成重置 ➔</a></div></div>`
        }
        sendmail(html);
    },
    async active(ctx,next){

        let code = ctx.request.query.code;
        let tempUser = await mysql.get('temp_user',{code:code});
        if(!tempUser || tempUser.islive==1){
            ctx.response.status = 500;
            return ctx.response.body = {
                errorMsg: "连接失效!!!"
            };
        }

        let mongoUser = await User.update({email:tempUser.email},{status:1});
        let mysqlUser = await mysql.update('temp_user',{code:moment().format('X')+utils.randomString(32),islive:1,live_at:moment().format("YYYY-MM-DD HH:mm:ss")},{
              where:{id:tempUser.id}
            });
        if(!mongoUser||!mysqlUser){
            ctx.response.status = 500;
            return ctx.response.body = {
                errorMsg: "激活失败!!!"
            };
        }

       return await ctx.render("success");
    },
    async resendEmail(ctx,next){
        let email = ctx.request.fields.email;
        let captcha = ctx.request.fields.captcha;  
        if(typeof captcha != 'undefined' &&(captcha.toLowerCase()  != ctx.session.captcha.toLowerCase())){
              ctx.response.status = 500;
              return ctx.response.body = {errorMsg:"验证码错误！"};
        } 
        let tempUser = await mysql.get('temp_user', {email:email});
        if(!tempUser){
            ctx.response.status = 500;
            return ctx.response.body = {errorMsg:"发送邮件失败！"};
        }
        //请求发送邮件
        let result = await sendEmail(tempUser.email,tempUser.nickname,captcha);
        if(result){
            ctx.response.status = 500;
            return ctx.response.body = result
        }
        return ctx.body = {
            success:true
        }
    },
    async emailInfo(ctx,next){
        let email = ctx.request.query.email;
        console.log(email);
        let Emailurl = getEmailLoginUrl(email);
        ctx.body = {
            url:Emailurl
        }
    },
    async resetpwd(ctx,next){
        let password = ctx.request.fields.password;
        let code = ctx.request.fields.code;
            //验证数据
        let errorMsg  = utils.check({
                password: password
        });
        //若有错误，返回错误信息
         if(errorMsg){
              ctx.response.status = 500;
              return ctx.response.body = {errorMsg:"密码格式不正确"};
         }
        let tempUser = await mysql.get('temp_user', {code:code});
        if(!tempUser){
            ctx.response.status = 500;
            return ctx.response.body = {errorMsg:"连接失效！！请重新申请重置密码！"};
        }
        let resetpwd_at = moment().format("YYYY-MM-DD HH:mm:ss");

        let result = await mysql.update('temp_user',{code:moment().format('X')+utils.randomString(32),resetpwd_at:resetpwd_at},{
              where:{id:tempUser.id}
            });
        console.log(`更新后code为：${result.code}。`)
        password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        let user = await User.update({email:tempUser.email},{password:password});
        return ctx.body = {
            success:true
        }
    },
    async index(ctx,next){
       await ctx.render('index');
    },
	async error(ctx, next) {
		return ctx.body = '404';
	},
}