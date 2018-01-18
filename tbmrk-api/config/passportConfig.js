const passport = require('koa-passport')
const LocalStrategy = require('passport-local').Strategy

exports.setup = function(User) {
	// 提交数据(策略)
	passport.use(new LocalStrategy({   
			usernameField: 'email',
            passwordField: 'password'
        },(email,password,done)=>{
        	   User.findOne({
                email: email.toLowerCase()
            }, function(err, user) {
                if (err) return done(err);
                if (!user) {
                    return done(null, false, { errorMsg: '用户名或密码错误' });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, { errorMsg: '用户名或密码错误' });
                }
                if(user.status === 2){
                    return done(null, false, { errorMsg: '用户被阻止登录' });
                }
                return done(null, user);
            });
	}));
}