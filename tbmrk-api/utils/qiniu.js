
const qiniu = require('qiniu');
const moment = require('moment');
const _ = require('lodash');

module.exports = {
   upload (localFile){
    /*七牛云设置start*/
    let bucket = 'tbmrk';
    let accessKey = '你的七牛云配置';
    let secretKey = '你的七牛云配置';
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    let options = {
        scope: bucket,
    };
    let putPolicy = new qiniu.rs.PutPolicy(options);
    let uploadToken = putPolicy.uploadToken(mac);
    let config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2;

    let formUploader = new qiniu.form_up.FormUploader(config);
    let putExtra = new qiniu.form_up.PutExtra();
    //七牛云图片样式
    let tbm = 'imageView2/1/w/266/h/200/q/100|imageslim';
    /*七牛云设置end*/

    const suffixArr = ['png', 'jpg', 'gif','jpeg'];//限制格式

    let type = localFile[0].type;  
    type = type.replace(/^image\//,'');
    let key = moment().format('x') + '.'+ type;
    let path = localFile[0].path;

      return new Promise((resolve,reject)=>{

                if(!/^image\//.test(type) && !_.includes(suffixArr,type)){
                      console.log(`文件上传失败，错误信息：格式错误！`)
                      return resolve({errorMsg:'图片上传文件格式错误'});
                }

              formUploader.putFile(uploadToken, key, path, putExtra, function(respErr,respBody, respInfo) {
                if (respErr) {
                    console.log(`文件上传失败，错误信息：${respErr}`)
                    return resolve({errorMsg:'文件上传失败'});
                }
                if (respInfo.statusCode == 200) {
                    console.log(`文件上传成功,${respBody.key}`);
                    let url = `http://ownr1jt7x.bkt.clouddn.com/${respBody.key}`;
                    let thumbnail = `http://ownr1jt7x.bkt.clouddn.com/${respBody.key}?imageView2/1/w/380/h/260/q/100%7Cimageslim`
                    return resolve({url:url,thumbnail:thumbnail});   
                }
            });
        }); 
    },
    delete(url){
        let bucket = 'tbmrk';
        let accessKey = '你的七牛云配置';
        let secretKey = '你的七牛云配置';
        let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        let config = new qiniu.conf.Config();
        config.zone = qiniu.zone.Zone_z2;
        let bucketManager = new qiniu.rs.BucketManager(mac, config);
        let key = url.replace('http://ownr1jt7x.bkt.clouddn.com/','');
        console.log(key);
        bucketManager.delete(bucket, key, function(err, respBody, respInfo) {
          if (err) {
            console.log(`删除失败`);
            console.log(err);
            return {errorMsg:"删除失败"}
          } else {
            console.log(`删除成功`);
            console.log(respInfo.statusCode);
            console.log(respBody);
            return null;
          }
        });
    }
}

