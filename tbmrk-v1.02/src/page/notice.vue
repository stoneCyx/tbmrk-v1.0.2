<template>
    <div>
        <div class="container pad_t150">
            <div class="row">
                <div class="col-md-6 center-block">
                    <div class="panel hover_sh clearfix">
                        <div class="panel_tit"><h4>通知</h4></div>
                        <div v-if="getAuth&&getAuth.status == 0" class="panel_body panel_form center-block">
                            <div class="input-group">
                              您已注册成功，请登陆邮箱激活。
                            </div>
                            <div class="input-group">
                              没收到邮件？请查看垃圾箱，如果没有，<a  class="_hand" @click=" sendMsgDisabled && resend()" href="javascript:void(0)">点击重新发送。</a>
                              <span v-if="!sendMsgDisabled">{{'('+time+'秒后可重新发送)'}}</span>
                            </div>
                                
                            <div class="panel_form_btn">
                                  <button  class="btn btn-info" @click="gotoLogin" >前往激活</button> 
                            </div>
                        </div>
                        <div v-else class="panel_body panel_form center-block">
                             <div class="input-group">
                               您已通过邮箱验证，在这里您可以畅所欲言。
                            </div>
                             <div class="panel_form_btn">
                                  <button  class="btn btn-info" @click="gotoIndex" >返回个人首页</button> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters ,mapActions } from 'vuex'

    export default {
        data (){
            return {
                time: window.sessionStorage.getItem('oldTime')||60,
                sendMsgDisabled:false
            }
        },
        computed: {
            ...mapGetters({
                getAuth:'getAuth'
            }),
            ...mapActions({
                resendEmail: 'resendEmail'
            })
        },
        mounted(){
            this.time = window.sessionStorage.getItem('oldTime'); 
            if(this.time != 1){
                this.setTime()
            }else{
                this.sendMsgDisabled = true;
            }
        },
        methods:{
            gotoLogin(){
                window.open(this.getAuth.loginUrl);
            },
            gotoIndex(){
                this.$router.push({ name: 'userIndex', params: { uid: this.getAuth.id }})
            },
            resend(){
                var email = this.getAuth.email
                if(this.sendMsgDisabled){
                    this.time = 60;
                    this.sendMsgDisabled = false;
                    this.$store.dispatch('resendEmail',{email:email});
                }  
                this.setTime();
            },
            setTime(){
                clearInterval(interval);
                let interval = window.setInterval(()=>{
                  if ((this.time--) <= 1) {
                    this.time = 1;
                    this.sendMsgDisabled = true;
                    clearInterval(interval);
                  }
                }, 1000);
            },
        },
        watch:{
            time(time){
            window.sessionStorage.setItem('oldTime',time);  // 赋值  
            }　　　　　　
         }
    }
</script>
