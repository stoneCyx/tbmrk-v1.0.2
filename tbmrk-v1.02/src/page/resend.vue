<template>
    <div>
        <div class="container pad_t150">
            <div class="row">
                <div class="col-md-6 center-block">
                    <div class="panel hover_sh clearfix">
                        <div class="panel_tit"><h4>通知</h4></div>
                        <div class="panel_body panel_form center-block">
                             <div class="input-group">
                               邮件已发送，请登录邮箱完成重置密码操作，如没收到邮件，15分钟后再尝试。
                            </div>
                             <div class="panel_form_btn">
                                  <button  class="btn btn-info" @click="goto" >返回首页</button> 
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
           
            }
        },
        methods:{
            goto(){
                 this.$router.push({path:'/'});
            },
        },

    }
</script>
