module.exports = {
    getEmailLoginUrl(email){
        
        let url = 'http://www.tbmrk.com/login';
        if(/@qq.com$/.test(email)){
            url = 'https://mail.qq.com/'
        }
        if(/@163.com$/.test(email)){
            url = 'http://mail.163.com/'
        }
        if(/@126.com$/.test(email)){
            url = 'http://mail.126.com/'
        }
        if(/@yahoo.com$/.test(email)){
            url = 'https://login.yahoo.com/'
        }
        if(/@aliyun.com$/.test(email)){
            url = 'https://mail.aliyun.com/'
        }
        return url;
    }
}