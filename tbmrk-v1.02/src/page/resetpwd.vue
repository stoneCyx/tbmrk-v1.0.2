<template>
    <div>
        <div class="container pad_t150">
            <div class="row">
                <div class="col-md-6 center-block">
                    <div class="panel hover_sh clearfix">
                        <div class="panel_tit"><h4>重置密码</h4></div>
                        <form class="panel_body panel_form center-block" method="post" @submit.prevent="resendpwdEmail">
                            <div class="input-group">
                                <span class="input-group-addon"><i class="iconfont icon-account addon_icon"></i></span>
                                <input type="text" v-model="user.email" class="form-control" placeholder="邮箱账号">
                            </div>
                            <div class="input-group">
                                <span class="input-group-addon"><i class="iconfont icon-lights addon_icon"></i></span>
                                <input type="text"  v-model="user.captcha"  class="form-control half_inp" placeholder="验证码">
                                <span  v-html="getCaptcha" class="half_inp"  @click="loadCaptcha"></span>
                            </div>
                            <div class="panel_form_btn">
                                <button type="submit" class="btn btn-success">提 交</button>
                            </div>
                        </form>
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
                user: {
                    captcha:'',
                    email: '',
                }
            }
        },
        computed: {
            ...mapGetters({
                getCaptcha:'getCaptcha',
                getResendEmail:'getResendEmail',
            }),
            ...mapActions({
                resendEmail: 'resendEmail',
                 captcha:'captcha'
            })
        },
         mounted(){
             this.loadCaptcha();
        },
        methods:{
            loadCaptcha(){
                this.$store.dispatch('captcha');
            },
            resendpwdEmail(){
                    var email = this.user.email
                    this.$store.dispatch('resendEmail',this.user);
            }
        },
        watch:{
            getResendEmail(val){
                if(val){
                    this.$router.push({path:'/resend'});
                }
            }
        }
    }
</script>
