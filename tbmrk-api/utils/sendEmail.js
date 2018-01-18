'use strict';
const urllib = require('urllib');
const _ = require('lodash');
const mysql = require('../dal/aliRds.js');
const User = require('../models/User');
const moment = require('moment');
const utils = require('../utils');
const emailConfig = require('../config/emailConfig');

module.exports = {
    async sendEmail(email,nickname,captcha){         

            let tempUser = await mysql.get('temp_user', {email:email});
            console.log(`收件人邮箱：${email},收件人昵称：${nickname}`)
            let user = await User.findOne({email:email});
            let newUser,resetPwdCode,resetpwd_email_at;
            //重置密码-----发送邮件请求
            if(captcha){
                    //重置密码，记录重置密码时间
                    resetPwdCode = utils.randomString(6)
                    resetpwd_email_at = moment().format("YYYY-MM-DD HH:mm:ss");
                    let diff = moment(resetpwd_email_at).diff(moment(tempUser.resetpwd_email_at), 'minutes');
                    if(diff<15){
                        return {errorMsg:`邮件已发送，如未收到，请您${15-diff}分钟后再试！`};
                    }
                    //重置密码时间不得小于15min
                    let result = await mysql.update('temp_user',{reset_pwd_code:resetPwdCode,resetpwd_email_at:resetpwd_email_at},{
                      where:{email:email}
                    });
                    if(!result){
                        return {errorMsg:'邮件发送失败'}
                    }
            } 
            let row = {
                    nickname:nickname,
                    email: email,
                    code:moment().format('X')+utils.randomString(32)
                }
            console.log(`发起邮件发送请求前------->  mysql用户信息：{tempUser},mongo用户信息：${user}`)
            //mongo有记录，mysql有记录则为重新发送邮件
             if(tempUser&&user){
                try{
                    let result = await mysql.update('temp_user', row,{where: { email: email },columns: [ 'code' ]});  
                    newUser = await mysql.get('temp_user', {email:email});
                }catch(err){
                    console.log(`更新临时表出错，错误信息：${err}`); 
                    return {errorMsg:'更新临时表出错'};
                }
            //mongo有记录，mysql没记录,则为第一次请求邮箱验证
             }else{ 
                try{
                    let result = await mysql.insert('temp_user', row);  
                    newUser = await mysql.get('temp_user', {id:result.insertId});
                }catch(err){
                    console.log(`写入临时表出错，错误信息：${err}`); 
                    return {errorMsg:'写入临时表出错'};
                }
            }
            //请求发送邮件
          urllib.request(emailConfig.emailServerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                    data: {
                        nickname:newUser.nickname,
                        code:newUser.code,
                        email:newUser.email,
                        resetPwdCode:resetPwdCode||null
                    }
                 }, function(err, data, res) {
                    if (err) {
                          console.log(`发起发送邮件请求出错，错误信息：${err}`);
                          return {errorMsg:'发起发送邮件请求出错'};
                    }
                    console.log(`==========发起发送邮件请求=============`);
                    return null;
        });
            
    }
}

