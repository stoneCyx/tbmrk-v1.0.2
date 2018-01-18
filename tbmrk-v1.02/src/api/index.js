import axios from 'axios'
const qs = require('querystring');

const ROOT = (process.env.NODE_ENV === 'production')
    ? 'http://api.tbmrk.com/v1'
    :'http://localhost:3000/v1';

function config() {
    const base = {
        baseURL: ROOT,
        withCredentials :true,
        'Access-Control-Allow-Origin':(process.env.NODE_ENV === 'production')?'http://api.tbmrk.com/v1':'http://localhost:3000/v1',
        'Access-Control-Allow-Credentials':true
    };
    if(localStorage.getItem('user') && !base.headers) {
        base.headers = {Authorization: 'Bearer ' + localStorage.getItem('user').replace(/(^\")|(\"$)/g, '')};
    }
    return base
}

export default {
    localLogin: function (data) {
        return axios.post('/auth/local', data , config())
    },
    localReg: function (data) {
        return axios.post('/user/addUser', data , config())
    },
    authInfo: function () {
        return axios.get('/user/authInfo', config())
    },
    userInfo: function (data) {
        return axios.get('/user/' + data + '/userInfo', config())
    },
    userSet: function () {
        return axios.get('/user/set', config())
    },
    updateUser:function (data) {
        return axios.put('/user/updateUser', data , config())
    },
    updatePassword:function (data) {
        return axios.put('/user/updatePassword', data , config())
    },
    tags:function (data) {
        return axios.get('/article/tags' , config())
    },
    articlePage:function (data) {
        return axios.get('/article/' + data + '/articlePage', config())
    },
    articleCollect:function (data) {
        return axios.put('/article/' + data + '/articleCollect' , {} , config())
    },
    addArticle:function (data) {
        return axios.post('/article/addArticle', data , config())
    },
    articleList:function (data) {
        return axios.get('/article/articleList/' + data , config())
    },
    articleUser:function (data) {
        return axios.get('/article/' + data , config())
    },
    articleUserCollect:function (data) {
        return axios.get('/article/' + data +'/collect', config())
    },
    articleTogether:function (data) {
        return axios.get('/article/' + data + '/articleTogether', config())
    },
    commentList:function (data) {
        return axios.get('/comment/' + data + '/commentList' , config())
    },
    commentListAll:function (data) {
        return axios.get('/comment/' + data + '/commentListAll' , config())
    },
    addComment:function (data) {
        return axios.post('/comment/addComment', data , config())
    },
    delComment:function (data) {
        return axios.delete('/comment/'+ data , config())
    },
    editArticle:function (data) {
        return axios.put('/article/' + data.aid + '/editArticle', data , config())
    },
    delArticle:function (data) {
        return axios.delete('/article/'+ data , config())
    },
    articleStatus:function (data) {
        return axios.put('/article/' + data + '/articleStatus' ,{}, config())
    },
    addPhoto:function (data) {
        return axios.post('/album/addPhoto' ,data , config())
    },
    photoList:function (data) {
        return axios.get('/album/photoList/'+ data , config())
    },
    photoUser:function (data) {
        return axios.get('/album/' + data + '/photoUser', config())
    },
    delPhoto:function (data) {
        return axios.delete('/album/' + data , config())
    },
    photoLike:function (data) {
        return axios.put('/album/' + data + '/photoLike', {}, config())
    }, 
    captcha:function () {
        return axios.get('/captcha',config())
    },
    resendEmail:function (data) {
        return axios.post('/resend/email',data,config())
    },
    resetpwdByEmail:function(data){
        return axios.post('/reset/pwd',data,config())
    }
    
}
