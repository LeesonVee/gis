/**
 * Created by Administrator on 2019/10/9.
 */
Vue.component('nomal-float',{
    props:['data','suffix'],
    template:`<div class="el_float_dialog"">
                <template v-for="item in data">
                    <el-row>
                        <el-col :span="8"><div class="el-float_dialog-item__label">{{item.lable+(suffix?":":"")}}</div></el-col>
                        <el-col :span="16"><div class="el-float_dialog-item__content">{{item.value}}</div></el-col>
                    </el-row>
                </template>
              </div>`
});
Vue.component('table-float',{
    props:['data'],
    template:`<div class="table-responsive" style="height:200px;overflow-y:scroll;">
                <template>
                    <table class="table" >
                      <!--<thead><tr><th>名称</th><th>内容</th></tr></thead>-->
                      <tbody>
                        <tr v-for="item in data"><td>{{item.lable}}</td><td>{{item.value}}</td></tr>
                      </tbody>
                    </table>
                </template>
              </div>`
});
Vue.component('float-comp',{
    props:['data','suffix'],
    template:`<div>
                <template v-if="data.type=='1'"><nomal-float :data="data.items.form" :suffix="suffix"></nomal-float></template>
                <template v-else-if="data.type=='2'"><table-float :data="data.items.table"></table-float></template>
                <template v-else-if="data.type=='3'">
                    <nomal-float :data="data.items.form" :suffix="suffix"></nomal-float>
                    <el-collapse v-model="data.activeNames">
                      <el-collapse-item :title="data.title" name="1">
                        <table-float :data="data.items.table"></table-float></template>
                      </el-collapse-item>
                    </el-collapse>
                </template>
              </div>`
});
Vue.component('float-component',{
    props:['data','suffix'],
    template:`<div>
                <table border="0" class="el-float-table">
                    <tbody>
                        <tr v-for="item in data"><td class="el-float-td" >{{item.name+(suffix?"：":"")}}</td><td>{{item.val}}</td></tr>
                    </tbody>
                </table>
            </div>`
});
