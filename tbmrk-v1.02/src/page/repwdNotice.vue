<template>
    <div>
        <div class="container pad_t150">
            <div class="row">
                <div class="col-md-6 center-block">
                    <div class="panel hover_sh clearfix">
                        <div class="panel_tit"><h4>重置密码</h4></div>
                         <form  method="post" @submit.prevent="resetpwd">
                            <div class="panel_body panel_form center-block">
                                    <div class="input-group">
                                    <span class="input-group-addon"><i class="iconfont icon-lock addon_icon"></i></span>
                                    <input type="password"
                                           v-model="user.password"
                                           class="form-control"
                                           placeholder="新密码">
                                </div>
                                <div class="panel_form_btn">
                                      <button  class="btn btn-info">确 定</button> 
                                </div>
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
                user:{
                   password:'',
                   code:this.$route.params.code
                },
                
            }
        },
        computed: {
            ...mapGetters({
                getResetpwdByEmail:'getResetpwdByEmail'
            }),
            ...mapActions({
                resetpwdByEmail: 'resetpwdByEmail'
            })
        },
        mounted(){
       
        },
        methods:{
            resetpwd(){
                 this.$store.dispatch('resetpwdByEmail', this.user);
            },
        },
        watch:{
            getResetpwdByEmail(val){
                if(val){
                     this.$router.push({path:'/login'});
                }
            }　　　　　　
        }
    }
</script>
