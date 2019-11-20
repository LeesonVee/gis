/**
 * Created by Vee on 2019/10/9.
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
Vue.component('filter-component',{
    data(){
        return {
            pkey:'',
            name:'',
            rename:'',
            type:'',
            measures:[],
            dimensions:[],
            filterParams:{
                activeName:'first',
                listRadio:1,
                listRadioOrderAsc:true,
                searchColumnData:'',
                hoverIndex: -1,
                checkList:[],
                definedData: [],
                operateRadio:'in',
                radioRange:1,
                leftNum:'',
                rightNum:'',
                beginTime:'',
                endTime:'',
                leftNumDisabled:false,
                rightNumDisabled:false,
                beginTimeDisabled:false,
                endTimeDisabled:false,
                listItemText: '无',
                installContentText:'无',
                termsText: '无',
                highConditionFilterText:'无',
                addVal:'',
                operateChecked:false,
                topSelectVal: '1',
                contentTexts: [],
                measureColumnName:'',
                measureColumnRName: '',
                rangeShowFlag:true,
                countMethodKey: '1',
                operateVal: '',
                operateKey: '1',
                conditionFilter:{
                    MAX:0,
                    MIN:0,
                },
                conditionStatus:true,
                measureColumnNameHigh:'',
                countMethodKeyHigh:'1',
                operateHighKey:'1',
                operateHighVal:'',
                measureColumnRNameHigh : '',
                highConditionStatus:true,
                focusColumn:''
            },

            topOptions: [{key: '1', text: '包含以下所有条件'}, {key: '2', text: '包含以下任意条件'}],
            bodyOptions: [
                {key: '1', text: '包含',code:'like'},
                {key: '2', text: '开头是',code:'likeL'},
                {key: '3', text: '结尾是',code:'likeR'},
                {key: '4', text: '不包含',code:'likeN'},
                {key: '5', text: '等于',code:'eq'}
            ],
            countMethodNames: [
                {key: '1', text: '求和'},
                {key: '2', text: '平均值'},
                {key: '3', text: '计数'},
                {key: '4', text: '去重计数'},
                {key: '5', text: '最大值'},
                {key: '6', text: '最小值'},
                {key: '7', text: '属性'}
            ],
            countMethodList:[
                {key: '1', text: '求和'},
                {key: '2', text: '求平均'},
                {key: '3', text: '求最大'},
                {key: '4', text: '求最小'}
            ],
            operates: [
                {key: '1', text: '大于等于',code:'ge'},
                {key: '2', text: '大于',code:'gt'},
                {key: '3', text: '等于',code:'eq'},
                {key: '4', text: '小于等于',code:'le'},
                {key: '5', text: '小于',code:'lt'},
                {key: '6', text: '不等于',code:'ne'}
            ],
            operateMaxAndMin: [
                {key: '1', text: '最大',code:'le'},
                {key: '2', text: '最小',code:'ge'}
            ],
            labelPosition: 'right',
            columnData: [],
            conditionObjs:[],
            conditions:[],
            filters:[],
            groupBy:[],
            pickerOptions: {
                shortcuts: [{
                    text: '今天',
                    onClick(picker) {
                        picker.$emit('pick', new Date());
                    }
                }, {
                    text: '昨天',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周前',
                    onClick(picker) {
                        const date = new Date();
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            }
        }
    },
    mounted(){
        this.initParams();
    },
    props:['data'],
    template:`<div>
                <template>
                    <el-container>
                      <el-aside width="300px">
                        <el-row><el-col :span="24"><div class="el-filter-title">维度</div></el-col></el-row>
                        <el-row>
                            <el-col :span="24">
                                <div class="el-filter-table">
                                    <el-table  size='medium' :data="data.dimensionColList" border style="width:100%;margin-bottom:20px;" max-height="220">
                                        <el-table-column label="选择" width="50">
                                            <template slot-scope="scope">
                                                <el-radio :label="scope.row.ID" v-model="data.dataRadio" @change.native="getCurrentRow(scope)">&nbsp;</el-radio>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="COLUMN_RENAME" label="名称"></el-table-column>
                                    </el-table>
                                </div>
                            </el-col>
                        </el-row>
                        <el-row><el-col :span="24"><div class="el-filter-title">度量</div></el-col></el-row>
                        <el-row>
                            <el-col :span="24">
                                <div class="el-filter-table">
                                    <el-table  size='medium' :data="data.metricColList" border style="width:100%;margin-bottom:20px;" max-height="90px">
                                        <el-table-column label="选择" width="50">
                                            <template slot-scope="scope">
                                                <el-radio :label="scope.row.ID" v-model="data.dataRadio" @change.native="getCurrentRow(scope)">&nbsp;</el-radio>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="COLUMN_RENAME" label="名称"></el-table-column>
                                    </el-table>
                                </div>
                            </el-col>
                        </el-row>
                      </el-aside>
                      <el-container>
                        <el-header>设置</el-header>
                        <el-main>
                            <template v-if="type=='1'">
                                <el-row>
                                    <el-col :span="13">
                                        <el-tabs v-model="filterParams.activeName" class="modal-lists">
                                            <el-tab-pane label="列表筛选" name="first">
                                                <el-row>
                                                    <el-col :span="2">&nbsp</el-col>
                                                    <el-col :span="20">
                                                        <el-radio-group v-model="filterParams.listRadio" @change="changeListRadio">
                                                            <el-radio :label="1">列表</el-radio>
                                                            <el-radio :label="2">手动</el-radio>
                                                        </el-radio-group>
                                                    </el-col>
                                                    <el-col :span="2" v-if="filterParams.listRadio=='1'">
                                                        <i class="fa fa-fw el-filter-cursor" aria-hidden="true" :title="filterParams.listRadioOrderAsc?'升序':'降序'" @click="orderClick"><span v-if="filterParams.listRadioOrderAsc">&#xf160;</span><span v-else>&#xf161;</span></i>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="filterParams.listRadio=='1'">
                                                    <el-col :span="24">
                                                        <el-input type="text" placeholder="请输入内容" prefix-icon="el-icon-search" v-model="filterParams.searchColumnData" size="mini"></el-input>
                                                    </el-col>
                                                    <el-col :span="24">&nbsp;</el-col>
                                                    <el-col :span="24" class="el-filter-list-max-height">
                                                        <div v-for="(item,index) in columnData.filter(data => !filterParams.searchColumnData || data.VAL.toLowerCase().includes(filterParams.searchColumnData.toLowerCase()))">
                                                            <el-row>
                                                                <el-col :span="1">&nbsp;</el-col>
                                                                <el-col :span="22">
                                                                    <el-checkbox-group v-model="filterParams.checkList" @change="checkVal(index)">
                                                                        <div :class="['el-filter-list-col-item',index==filterParams.hoverIndex?'el-filter-hoverBg':'']"
                                                                             @mouseover="filterParams.hoverIndex = index"
                                                                             @mouseout="filterParams.hoverIndex = -1">
                                                                            <el-checkbox :label="item.VAL" ></el-checkbox>
                                                                        </div>
                                                                    </el-checkbox-group>
                                                                </el-col>
                                                                <el-col :span="1">&nbsp;</el-col>
                                                            </el-row>
                                                        </div>
                                                    </el-col>
                                                    <el-col :span="24" style="text-align:left;margin-top:10px;">
                                                        <el-radio-group v-model="filterParams.operateRadio" @change="operateRadioChange">
                                                            <el-radio label="in">包含</el-radio>
                                                            <el-radio label="notin">排除</el-radio>
                                                            <el-radio label="all">全部</el-radio>
                                                        </el-radio-group>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-else>
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="22">
                                                        <el-input placeholder="输入您要添加的项" v-model="filterParams.addVal" size="mini">
                                                            <i slot="suffix" class="el-input__icon el-icon-plus" @click="addInputVal"></i>
                                                        </el-input>
                                                    </el-col>
                                                    <el-col :span="24" class="el-filter-list-max-height el-filter-list-defiend">
                                                        <div v-for="(item,index) in filterParams.definedData">
                                                            <el-row>
                                                                <el-col :span="1">&nbsp;</el-col>
                                                                <el-col :span="22">
                                                                    <div :class="['el-filter-list-col-item2',index==filterParams.hoverIndex?'el-filter-hoverBg':'']"
                                                                         @mouseover="filterParams.hoverIndex = index"
                                                                         @mouseout="filterParams.hoverIndex = -1">
                                                                        <el-row>
                                                                            <el-col :span="12">{{item.VAL}}</el-col>
                                                                            <el-col :span="12" style="text-align:right;"><i
                                                                                    class="el-icon-close" title="删除"
                                                                                    style="cursor: pointer;"
                                                                                    @click="delInputVal(index)"></i></el-col>
                                                                        </el-row>
                                                                    </div>
                                                                </el-col>
                                                                <el-col :span="1">&nbsp;</el-col>
                                                            </el-row>
                                                        </div>
                                                    </el-col>
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="12" style="text-align:left;margin-top:10px;">
                                                        <el-checkbox v-model="filterParams.operateChecked" @change="operateCheckedChange">排除
                                                        </el-checkbox>
                                                    </el-col>
                                                </el-row>
                                            </el-tab-pane>
                                            <el-tab-pane label="文本筛选" name="second">
                                                <el-row style="padding:5px 8px;">
                                                    <el-col :span="12">
                                                        <el-select v-model="filterParams.topSelectVal" placeholder="请选择" size="small" @change="andOrChange">
                                                            <el-option v-for="item in topOptions" :key="item.key" :label="item.text" :value="item.key"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                </el-row>
                                                <el-row style="padding:5px 8px;" v-for="(item,index) in filterParams.contentTexts">
                                                    <el-col :span="8">
                                                        <el-select v-model="item.key" placeholder="请选择" size="mini" @change="andOrChange">
                                                            <el-option v-for="opt in bodyOptions" :key="opt.key" :label="opt.text" :value="opt.key"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="12">
                                                        <el-input v-model="item.text" size="mini" @change="andOrChange"></el-input>
                                                    </el-col>
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="2"><i class="el-icon-delete" title="删除" style="font-size:16px;padding-top:6px;cursor: pointer;" @click="delSelectInput(index)"></i></el-col>
                                                </el-row>
                                                <el-row>
                                                    <el-col :span="12">
                                                        <div style="text-align:left;padding:5px 8px;" v-if="filterParams.contentTexts.length<7">
                                                            <el-button type="primary" plain size="small" @click="addSelectInput">添加</el-button>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                            </el-tab-pane>
                                            <el-tab-pane label="条件筛选" name="third">
                                                <el-row>
                                                    <el-col :span="2">按照</el-col>
                                                    <el-col :span="12">
                                                        <el-select v-model="filterParams.measureColumnName" placeholder="请选择" size="mini" @change="measureColumnChange(data.metricColList)">
                                                            <el-option v-for="item in data.metricColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="2">&nbsp;&nbsp;的</el-col>
                                                    <el-col :span="8">
                                                        <el-select v-model="filterParams.countMethodKey" :disabled="filterParams.conditionStatus" size="mini" @change="conditionFilterChange">
                                                            <el-option v-for="item in countMethodList" :key="item.key" :label="item.text" :value="item.key" ></el-option>
                                                        </el-select>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="filterParams.rangeShowFlag" style="text-align:center;">
                                                    <el-col :span="24">
                                                        <div style="margin:10px 0;height:50px;line-height: 50px;background-color: #fafafa;border: 1px solid #efefef;">
                                                            <el-button type="primary" size="mini" :disabled="filterParams.conditionStatus" @click="showRange(false)">加载范围</el-button>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                                <el-row v-if="!filterParams.rangeShowFlag">
                                                    <el-col :span="24">
                                                        <div style="margin-top:10px;border: 1px solid #efefef;padding:20px 20px 0px 20px;">
                                                            <el-form :label-position="labelPosition" label-width="60px" disabled="true" :model="filterParams.conditionFilter" size="small">
                                                                <el-form-item label="最大值:"><el-input v-model="filterParams.conditionFilter.MAX"></el-input></el-form-item>
                                                                <el-form-item label="最小值:"><el-input v-model="filterParams.conditionFilter.MIN"></el-input></el-form-item>
                                                            </el-form>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                                <el-row>&nbsp;</el-row>
                                                <el-row>
                                                    <el-col :span="11">
                                                        <el-select v-model="filterParams.operateKey" placeholder="请选择":disabled="filterParams.conditionStatus"  size="mini" @change="conditionFilterChange">
                                                            <el-option v-for="opt in operates" :key="opt.key" :label="opt.text" :value="opt.key"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="11"><el-input v-model="filterParams.operateVal" size="mini" :disabled="filterParams.conditionStatus" @change="conditionFilterChange" placeholder="请输入数字"></el-input></el-col>
                                                </el-row>
                                            </el-tab-pane>
                                            <el-tab-pane label="高级筛选" name="fourth">
                                                <el-row>
                                                    <el-col :span="2">按照</el-col>
                                                    <el-col :span="12">
                                                        <el-select v-model="filterParams.measureColumnNameHigh" placeholder="请选择" size="mini" @change="measureColumnHighChange(data.metricColList)">
                                                            <el-option v-for="item in data.metricColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME">
                                                            </el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="2">&nbsp;&nbsp;的</el-col>
                                                    <el-col :span="8">
                                                        <el-select v-model="filterParams.countMethodKeyHigh" :disabled="filterParams.highConditionStatus" size="mini" @change="measureColumnHighConditionChange">
                                                            <el-option v-for="item in countMethodList" :key="item.key" :label="item.text" :value="item.key"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                </el-row>
                                                <el-row>&nbsp;</el-row>
                                                <el-row>
                                                    <el-col :span="2">&nbsp;</el-col>
                                                    <el-col :span="12">
                                                        <el-select v-model="filterParams.operateHighKey" :disabled="filterParams.highConditionStatus" placeholder="请选择" size="mini" @change="measureColumnHighConditionChange">
                                                            <el-option v-for="opt in operateMaxAndMin" :key="opt.key" :label="opt.text" :value="opt.key"></el-option>
                                                        </el-select>
                                                    </el-col>
                                                    <el-col :span="2">&nbsp;&nbsp;的</el-col>
                                                    <el-col :span="6">
                                                        <el-input v-model="filterParams.operateHighVal" :disabled="filterParams.highConditionStatus" size="mini" @change="measureColumnHighConditionChange"></el-input>
                                                    </el-col>
                                                    <el-col :span="2">&nbsp;个</el-col>
                                                </el-row>
                                            </el-tab-pane>
                                        </el-tabs>
                                    </el-col>
                                    <el-col :span="1">&nbsp;</el-col>
                                    <el-col :span="10">
                                        <el-row style="text-align:center;height:40px;line-height: 40px;"><el-col :span="24">筛选汇总</el-col></el-row>
                                        <el-row style="background:#f5f5f5;text-align:left;margin-bottom:20px;">
                                            <el-col :span="2">&nbsp;</el-col>
                                            <el-col :span="20">
                                                <el-row>&nbsp;</el-row>
                                                <el-row class="dim-row-padding">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">所选字段:</el-col>
                                                    <el-col :span="14">{{rename}}</el-col>
                                                </el-row>
                                                <el-row :class="['dim-row-padding',filterParams.activeName=='first'?'dim-row-active':'']">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">列表筛选:</el-col>
                                                    <el-col :span="14">{{filterParams.listItemText}}</el-col>
                                                </el-row>
                                                <el-row :class="['dim-row-padding',filterParams.activeName=='second'?'dim-row-active':'']">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">文本筛选:</el-col>
                                                    <el-col :span="14">{{filterParams.installContentText}}</el-col>
                                                </el-row>
                                                <el-row :class="['dim-row-padding',filterParams.activeName=='third'?'dim-row-active':'']">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">条件筛选:</el-col>
                                                    <el-col :span="14">{{filterParams.termsText}}</el-col>
                                                </el-row>
                                                <el-row :class="['dim-row-padding',filterParams.activeName=='fourth'?'dim-row-active':'']">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">高级筛选:</el-col>
                                                    <el-col :span="14">{{filterParams.highConditionFilterText}}</el-col>
                                                </el-row>
                                                <el-row>&nbsp;</el-row>
                                            </el-col>
                                            <el-col :span="2">&nbsp;</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="2">&nbsp;</el-col>
                                            <el-col :span="22"><el-button type="success" @click="doSaveFilter">保存设置</el-button></el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>
                            </template>
                            <template v-else-if="type=='2' || type=='3'">
                                <el-row class="el-filter-row">
                                    <el-col :span="24">
                                        <el-radio-group v-model="filterParams.radioRange" @change="rangeTypeChange">
                                            <el-radio :label="1">范围</el-radio>
                                            <el-radio :label="2">最少</el-radio>
                                            <el-radio :label="3">最多</el-radio>
                                        </el-radio-group>
                                    </el-col>
                                </el-row>
                                <el-row class="el-filter-row">
                                    <el-col :span="3">&nbsp;</el-col>
                                    <el-col :span="8">
                                        <div v-if="type=='2'"><el-input v-model="filterParams.leftNum" :disabled="filterParams.leftNumDisabled"></el-input></div>
                                        <div v-else>
                                            <el-date-picker v-model="filterParams.beginTime" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions" :disabled="filterParams.beginTimeDisabled"></el-date-picker>
                                        </div>
                                    </el-col>
                                    <el-col :span="2"><span style="height: 40px;line-height: 40px;padding:0 20px;"> - </span></el-col>
                                    <el-col :span="8">
                                        <div v-if="type=='2'"><el-input v-model="filterParams.rightNum" :disabled="filterParams.rightNumDisabled"></el-input></div>
                                        <div v-else><el-date-picker v-model="filterParams.endTime" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions" :disabled="filterParams.endTimeDisabled"></el-date-picker></div>
                                    </el-col>
                                    <el-col :span="3">&nbsp;</el-col>
                                </el-row>
                                <el-row class="el-filter-row" v-if="type=='2' && filterParams.rangeShowFlag">
                                    <el-col :span="24"><el-button type="primary" @click="showRange(true)">加载范围</el-button></el-col>
                                </el-row>
                                <el-row class="el-filter-row">
                                    <el-col :span="24">
                                        <span style="margin-right:20px;"><el-button type="success" @click="saveRange">保存</el-button></span>
                                        <span><el-button type="danger" @click="setRange">重置</el-button></span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-main>
                      </el-container>
                    </el-container>
                </template>
              </div>`,
    methods: {
        /**
         * 获取表字段数据
         * @param method :POST/GET
         * @param api :请求api接口
         * @param data ：请求数据和解析返回数据参数
         */
        loadTableColData:function(method,api,data){
            let config = {};
            if(data.params){
                config['params'] = data.params;
                delete data.params;
            }
            if(data.msgCfg){
                config['msgCfg'] = data.msgCfg;
                delete data.msgCfg;
            }
            let jsonDataList={
                httpMethod:method,
                url:api,
                data:data?JSON.stringify(data):''
            };
            this.requestAsyncApi(jsonDataList,config);
        },
        /**
         * 请求接口方法，附带解析返回参数
         * @param jsonDataList 请求配置参数
         * @param config ：{//返回解析参数
         *      params{ //接收参数                                必填
         *          T:{//泛型，指具体接收数据变量名                  必填
         *              type:字段类型(array/string/object等)      必填
         *              receive：接收解析数据变量名                 非必填
         *          }
         *      }
         *      msgCfg{//自定义是否提示信息                        非必填
         *          show:是否显示                                非必填
         *          msg:具体的提示信息                            非必填
         *      }
         * }
         */
        requestAsyncApi:function(jsonDataList,config){
            let me = this;
            let params = config.params;
            let msgCfg = config.msgCfg;
            ajaxrequestasync(jsonDataList,function(code,msg,json){
                if(code=='200'){
                    let body = json.body || json;
                    if(body){
                        for(let p in params){
                            let resultParams = params[p];
                            let defaultData = me.dataTyeByStr(resultParams.type);
                            if(resultParams.receive && resultParams.receive!=''){
                                me[p] = body[resultParams.receive] || defaultData;
                            }else{
                                me[p] = body || defaultData;
                            }
                        }
                    }
                    if(msgCfg && msgCfg.show){
                        me.myMessage(msgCfg.msg||msg,'success');
                    }
                }else{
                    msg = msgCfg?(msgCfg.msg||msg):msg;
                    me.myMessage(msg,'error');
                }
            });
        },
        requestSyncApi:function(method,api,data){
            let jsonDataList={
                httpMethod:method,
                url:api,
                data:data?JSON.stringify(data):''
            };
            return ajaxrequestsync(jsonDataList);
        },
        dataTyeByStr:function(s){
            let dataType;
            switch (s){
                case 'string':dataType='';break;
                case 'object':dataType={};break;
                case 'array':dataType=[];break;
                default:dataType='';break;
            }
            return dataType;
        },
        /**
         * msg：提示信息
         * type：消息类型：success：成功；error：错误；warning：警告；
         * */
        myMessage:function(msg,type) {
            this.$message({
                message: msg,
                type: type
            });
        },
        getCurrentRow:function (e) {
            // this.initParams();
            this.measures=this.data.metricColList;
            this.dimensions=this.data.dimensionColList;
            let row = e.row;
            this.name = row.COLUMN_NAME;
            this.rename = row.COLUMN_RENAME;
            this.type = row.COLUMN_TYPE;
            this.filterParams.focusColumn = row.COLUMN_NAME;
            //维度：1（时间：3）,度量：2
            if(row.COLUMN_TYPE=="1"){
                this.type = this.colDataTypeToFilterType(row.COLUMN_DATA_TYPE);
                let result = this.requestSyncApi('POST',configpre.api_getColnameData,{
                    colName:row.COLUMN_NAME,
                    modelId:row.MODEL_ID
                });
                if(result && result.code==200){
                    this.columnData = result.json.body;
                }
            }
            this.setColFilterParams(row);
        },
        setColFilterParams:function(row){
            let me = this;
            let result = this.requestSyncApi('POST',configpre.map_loadGisRelationConditionsByColNameAndRelationId,{
                modelRelationId:row.MODEL_ID,
                colName:row.COLUMN_NAME,
            });
            if(result && result.code==200){
                let body = result.json.body;
                if(body){
                    this.pkey = body.pkey;
                    let conditionsObj = eval(body.conditionsObj) ||[];
                    if(me.type=="1"){
                        this.initFirstActive(conditionsObj[0]);
                        this.initSecondActive(conditionsObj[1]);
                        this.initThirdActive(conditionsObj[2]);
                        this.initFourthActive(conditionsObj[3]);
                    }else{
                        this.initFiveActive(conditionsObj[4]);
                    }
                }
            }
        },
        initFirstActive:function(firstActive){
            if(firstActive && firstActive.length>0){
                this.filterParams.listRadio = parseInt(firstActive[0].listRadio);
                if(this.filterParams.listRadio==1){
                    this.filterParams.operateRadio = firstActive[0].operator;
                    this.filterParams.checkList = firstActive[0].value;
                    this.checkVal();
                }else{
                    if(firstActive[0].operator=='notin'){
                        this.filterParams.operateChecked = true;
                    }
                    firstActive[0].value.forEach(item=>{
                        this.filterParams.definedData.push({VAL: item});
                    });
                    this.inOrOutInputVal();
                }
            }
        },
        initSecondActive:function(secondActive){
            if(secondActive && secondActive.length>0){
                let len = this.bodyOptions.length;
                let topSelectVal = secondActive[0].topSelectVal;
                secondActive.forEach(item=>{
                    for(let i=0;i<len;i++){
                        if(item.operator==this.bodyOptions[i].code){
                            this.filterParams.contentTexts.push({key: this.bodyOptions[i].key, text: item.value[0]});
                        }
                    }
                });
                this.filterParams.topSelectVal = topSelectVal;
                this.andOrChange();
            }
        },
        initThirdActive:function(thirdActive){
            if(thirdActive && thirdActive.length>0){
                this.filterParams.measureColumnName=thirdActive[0].originColumnName;
                if(thirdActive[0].name.match('SUM')){
                    this.filterParams.countMethodKey='1';
                }else if(thirdActive[0].name.match('AVG')){
                    this.filterParams.countMethodKey='2';
                }else if(thirdActive[0].name.match('MAX')){
                    this.filterParams.countMethodKey='3';
                }else if(thirdActive[0].name.match('MIN')){
                    this.filterParams.countMethodKey='4';
                }
                this.operates.forEach(item=>{
                    if(item.code==thirdActive[0].operator){
                        this.filterParams.operateKey = item.key;
                    }
                });
                this.filterParams.operateVal = thirdActive[0].value[0];
                this.filterParams.conditionStatus = false;
                this.filterParams.highConditionStatus=false;
                this.filterParams.measureColumnRName = thirdActive[0].measureColumnRName;
                this.conditionFilterChange();
            }
        },
        initFourthActive:function(fourthActive){
            if(fourthActive && fourthActive.length>0){
                this.filterParams.measureColumnNameHigh = fourthActive[0].originColumnName;
                if(fourthActive[0].name.match('SUM')){
                    this.filterParams.countMethodKeyHigh='1';
                }else if(fourthActive[0].name.match('AVG')){
                    this.filterParams.countMethodKeyHigh='2';
                }else if(fourthActive[0].name.match('MAX')){
                    this.filterParams.countMethodKeyHigh='3';
                }else if(fourthActive[0].name.match('MIN')){
                    this.filterParams.countMethodKeyHigh='4';
                }
                this.filterParams.highConditionStatus=false;
                this.operateMaxAndMin.forEach(item=>{
                    if(item.code==fourthActive[0].operator){
                        this.filterParams.operateHighKey = item.key;
                    }
                });
                this.filterParams.operateHighVal=fourthActive[0].value;
                this.filterParams.measureColumnName = fourthActive[0].originColumnName;
                this.filterParams.conditionStatus = false;
                this.filterParams.measureColumnRNameHigh = fourthActive[0].measureColumnRNameHigh;
                this.measureColumnHighConditionChange();
            }
        },
        initFiveActive:function(fiveActive){
            if(fiveActive && fiveActive.length>0){
                this.filterParams.radioRange = parseInt(fiveActive[0].radioRange);
                let colType = fiveActive[0].colType;
                if(colType=='2'){
                    this.filterParams.leftNum=fiveActive[0].value[0];
                    this.filterParams.rightNum=fiveActive[0].value[1];
                }else{
                    this.filterParams.beginTime=fiveActive[0].value[0];
                    this.filterParams.endTime=fiveActive[0].value[1];
                }
                if(fiveActive[0].value[0] || fiveActive[0].value[1]){
                    this.installRange();
                }
            }
        },
        /**
         * 字段类型转
         * @param columnDataType
         * @returns {string}
         */
        colDataTypeToFilterType:function(columnDataType){
            let filterType = '1';
            switch (columnDataType.toUpperCase()){
                case 'YEAR':filterType='3';break;
                case 'DATE':filterType='3';break;
                case 'TIME':filterType='3';break;
                case 'DATETIME':filterType='3';break;
                case 'TIMESTAMP':filterType='3';break;
                default:break;
            }
            return filterType;
        },
        initParams:function(){
            this.filterParams.activeName='first';
            this.filterParams.listRadio=1;
            this.filterParams.listRadioOrderAsc=true;
            this.filterParams.searchColumnData='';
            this.filterParams.hoverIndex= -1;
            this.filterParams.checkList=[];
            this.filterParams.definedData= [];
            this.filterParams.operateRadio='in';
            this.filterParams.radioRange=1;
            this.filterParams.leftNum='';
            this.filterParams.rightNum='';
            this.filterParams.beginTime='';
            this.filterParams.endTime='';
            this.filterParams.leftNumDisabled=false;
            this.filterParams.rightNumDisabled=false;
            this.filterParams.beginTimeDisabled=false;
            this.filterParams.endTimeDisabled=false;
            this.filterParams.listItemText= '无';
            this.filterParams.installContentText='无';
            this.filterParams.termsText= '无';
            this.filterParams.highConditionFilterText='无';
            this.filterParams.addVal='';
            this.filterParams.operateChecked=false;
            this.filterParams.topSelectVal= '1';
            this.filterParams.contentTexts= [];
            this.filterParams.measureColumnName='';
            this.filterParams.measureColumnRName= '';
            this.filterParams.rangeShowFlag=true;
            this.filterParams.countMethodKey= '1';
            this.filterParams.operateVal= '';
            this.filterParams.operateKey= '1';
            this.filterParams.conditionFilter={MAX:0,MIN:0};
            this.filterParams.conditionStatus=true;
            this.filterParams.measureColumnNameHigh='';
            this.filterParams.countMethodKeyHigh='1';
            this.filterParams.operateHighKey='1';
            this.filterParams.operateHighVal='';
            this.filterParams.measureColumnRNameHigh = '';
            this.filterParams.highConditionStatus=true;
            this.filterParams.focusColumn = '';
            this.conditionObjs=[];
            this.conditions=[];
            this.pkey = '';

        },
        orderClick:function(){
            let me = this;
            this.filterParams.listRadioOrderAsc = !this.filterParams.listRadioOrderAsc;
            this.columnData.sort(function (item1, item2) {
                let VAL1 = item1.VAL;
                let VAL2 = item2.VAL;
                if (me.filterParams.listRadioOrderAsc) {
                    return VAL1.localeCompare(VAL2, 'zh');
                } else {
                    return VAL2.localeCompare(VAL1, 'zh');
                }
            });
        },
        checkVal: function (index) {
            var operateRadio = '';
            if (this.filterParams.operateRadio == 'in') {
                operateRadio = '包含';
            } else if (this.filterParams.operateRadio == 'notin') {
                operateRadio = '排除';
            } else {
                operateRadio = '使用全部';
                this.filterParams.checkList=[];
                for (var j = 0; j < this.columnData.length; j++) {
                    this.filterParams.checkList.push(this.columnData[j].VAL);
                }
                var params = [{
                    name: this.name,
                    operator: 'in',
                    type: 's',
                    conditionType:1,
                    listRadio:1,
                    value: this.filterParams.checkList
                }];
                this.installCondition('0', params);
                this.filterParams.listItemText = operateRadio;
                return;
            }
            if (this.filterParams.checkList.length > 0) {
                for (var i = 0; i < this.filterParams.checkList.length; i++) {
                    if (i > 2) {
                        operateRadio += this.filterParams.checkList[i];
                        operateRadio += '等' + this.filterParams.checkList.length + '项、';
                        break;
                    }
                    operateRadio += this.filterParams.checkList[i] + '、';
                }
                this.filterParams.listItemText = operateRadio.substring(0, operateRadio.length - 1);
                var params = [{
                    name: this.name,
                    operator: this.filterParams.operateRadio,
                    type: 's',
                    conditionType:1,
                    listRadio:1,
                    value: this.filterParams.checkList
                }];
                this.installCondition('0', params);
            } else {
                this.filterParams.listItemText = '无';
            }
        },
        operateRadioChange:function(){
            var operateRadio = '';
            if (this.filterParams.operateRadio == 'all') {
                this.filterParams.checkList =[];
                for (var j = 0; j < this.columnData.length; j++) {
                    this.filterParams.checkList.push(this.columnData[j].VAL);
                }
                this.filterParams.listItemText = '使用全部';
            } else {
                if (this.filterParams.checkList.length > 0) {
                    var content = this.filterParams.listItemText;
                    if (this.filterParams.operateRadio == 'in') {
                        operateRadio = '包含';
                    } else if (this.filterParams.operateRadio == 'notin') {
                        operateRadio = '排除';
                    }
                    this.filterParams.listItemText = content.replace(content.substring(0, 2), operateRadio);
                } else {
                    this.filterParams.listItemText = '无';
                }
            }
            if (this.filterParams.checkList.length > 0) {
                var params = [{
                    name: this.name,
                    operator: this.filterParams.operateRadio == 'all' ? 'in' : this.filterParams.operateRadio,
                    type: 's',
                    conditionType:1,
                    value: this.filterParams.checkList
                }];
                this.installCondition('0', params);
            } else {
                this.removeCondition('0');
            }
        },
        //列表筛选：手动radio，输入值内容添加至数据集合中
        addInputVal: function () {
            if (this.filterParams.addVal == '') {
                return;
            }
            //判断数组中是否包含当前输入字符串，如果包含，再循环判断是否相等。规避每次都循环查找，提高效率
            if (JSON.stringify(this.filterParams.definedData).indexOf(this.filterParams.addVal) > 0) {
                for (var i = 0; i < this.filterParams.definedData.length; i++) {
                    if (this.filterParams.definedData[i].VAL == this.filterParams.addVal) {
                        this.$message.error('已经存在【' + this.filterParams.addVal + '】');
                        this.filterParams.addVal = '';
                        return;
                    }
                }
            }
            this.filterParams.definedData.push({VAL: this.filterParams.addVal});
            this.filterParams.addVal = '';
            this.inOrOutInputVal();
        },
        //删除集合内数据
        delInputVal: function (index) {
            this.filterParams.definedData.splice(index, 1);
            if (this.filterParams.definedData.length > 0) {
                this.inOrOutInputVal();
            } else {
                this.filterParams.listItemText = '无';
                this.removeCondition('0');
            }
        },
        operateCheckedChange:function(){
            if (this.filterParams.definedData.length > 0) {
                this.inOrOutInputVal();
            }
        },
        inOrOutInputVal: function () {
            var operate = '';
            var operateText = '';
            if (this.filterParams.operateChecked) {
                operate = 'notin';
                operateText = '排除';
            } else {
                operate = 'in';
                operateText = '包含';
            }
            var content = '';
            var vals = [];
            for (var i = 0; i < this.filterParams.definedData.length; i++) {
                if (i < 6) {
                    content += this.filterParams.definedData[i].VAL + '、';
                }
                vals.push(this.filterParams.definedData[i].VAL);
            }
            content = content.substring(0, content.length - 1)
            if (this.filterParams.definedData.length >= 6) {
                content += '等' + this.filterParams.definedData.length + '项';
            }
            this.filterParams.listItemText = operateText + content;
            var params = [{
                name: this.name,
                operator: operate,
                type: 's',
                listRadio:'2',
                conditionType:1,
                value: vals
            }];
            this.installCondition('0', params);
        },
        changeListRadio:function(){
            if(this.filterParams.listRadio == '1') {
                this.checkVal();
            }else{
                if(this.filterParams.definedData && this.filterParams.definedData.length>0){
                    this.inOrOutInputVal();
                }else{
                    this.filterParams.listItemText='无';
                }

            }
        },
        /**
         *组装查询条件
         *@param tabType 0：列表查询，1：文本帅选，2：条件筛选，3：高级筛选，4：度量范围，5：时间
         *@param column:字段名
         *@param operator：in，like，eq，ne等
         *@param type:字段类型 s 字符串, i 整形, l 长整型 ,d 浮点型 保留4位小数, t 时间类型
         *@param val:值
         */
        installCondition: function (tabType, cfgs) {
            this.conditionObjs[tabType] = cfgs;
            var condtions = [];
            for (var tabIndex in this.conditionObjs) {
                for (var i = 0; i < this.conditionObjs[tabIndex].length; i++) {
                    condtions.push(this.conditionObjs[tabIndex][i]);
                }
            }
            this.conditions = condtions;
            console.info(JSON.stringify(this.conditions));
            console.info(JSON.stringify(this.conditionObjs));
        },
        removeCondition: function (tabType) {
            delete this.conditionObjs[tabType];
            var condtions = [];
            for (var tabIndex in this.conditionObjs) {
                for (var i = 0; i < this.conditionObjs[tabIndex].length; i++) {
                    condtions.push(this.conditionObjs[tabIndex][i]);
                }
            }
            this.conditions = condtions;

            console.info(JSON.stringify(this.conditions));
        },
        andOrChange:function(){
            if (this.filterParams.contentTexts.length > 0) {
                var existText = false;
                var isAndOrKey = this.filterParams.topSelectVal == '1' ? 'and' : 'or';
                var isAndOrText = this.filterParams.topSelectVal == '1' ? '并且' : '或者';
                var params = [];
                this.filterParams.installContentText = '';
                for (var i = 0; i < this.filterParams.contentTexts.length; i++) {
                    var contentText = this.filterParams.contentTexts[i];
                    var operateCfg = this.operateSymbol(contentText.key);
                    if (contentText.text != '') {
                        existText = true;
                        var cfgs = {
                            name: this.name,
                            operator: operateCfg.key,
                            topSelectVal:this.filterParams.topSelectVal,
                            type: 's',
                            conditionType:1,
                            value: [contentText.text],
                            both: isAndOrKey
                        }
                        //判断当前元素的下一元素的值是否为空，为空删除both属性，反之不删除
                        if (i == this.filterParams.contentTexts.length - 1 || (i < this.filterParams.contentTexts.length - 1 && this.filterParams.contentTexts[i + 1].text == '')) {
                            delete cfgs.both;
                        }
                        params.push(cfgs);
                        this.filterParams.installContentText += operateCfg.text + contentText.text + ' ' + isAndOrText;
                    }
                }
                if (existText) {
                    this.filterParams.installContentText = this.filterParams.installContentText.substring(0, this.filterParams.installContentText.length - 2);
                    this.installCondition('1', params);
                } else {
                    this.filterParams.installContentText = '无';
                }
            } else {
                this.removeCondition('1');
            }
        },
        addSelectInput: function () {
            this.filterParams.contentTexts.push({key: '1', text: ''});
        },
        delSelectInput: function (index) {
            this.filterParams.contentTexts.splice(index, 1);
            this.andOrChange();
        },
        /**
         *根据key值，转换成包含接口定义的key值和显示中文名称的text
         *@param key 入参
         */
        operateSymbol: function (key) {
            var cfgs = {
                key: '',
                text: ''
            };
            switch (key) {
                case '1':
                    cfgs.key = 'like';
                    cfgs.text = '包含';
                    break;
                case '2':
                    cfgs.key = 'likeL';
                    cfgs.text = '开头是';
                    break;
                case '3':
                    cfgs.key = 'likeR';
                    cfgs.text = '结尾是';
                    break;
                case '4':
                    cfgs.key = 'likeN';
                    cfgs.text = '不包含';
                    break;
                case '5':
                    cfgs.key = 'eq';
                    cfgs.text = '等于';
                    break;
            }
            return cfgs;
        },
        measureColumnChange :function (measures) {
            this.filterParams.rangeShowFlag = true;
            if(measures && measures.length>0){
                for(let sindex=0,len=measures.length;sindex<len;sindex++){
                    if(measures[sindex].COLUMN_NAME == this.filterParams.measureColumnName){
                        this.filterParams.measureColumnRName = measures[sindex].COLUMN_RENAME;
                    }
                }
            }
            if(this.filterParams.measureColumnRName!=''){
                this.filterParams.conditionStatus = false;
                this.filterParams.highConditionStatus=false;
            }
            this.conditionFilterChange();
        },
        conditionFilterChange : function () {
            var vals = [];
            var operate = '';
            var operateText = '';
            var operateSymbol = '';
            var expressConditionFilter = "";
            var expressConditionFilterText = "";
            if(this.filterParams.operateVal == 0 ||this.filterParams.operateVal == ""){
                this.removeCondition('2');
                this.filterParams.termsText = '无';
            }
            if(this.filterParams.operateKey && this.filterParams.operateVal){
                var rangResult = this.transformCountMethodExpress(this.filterParams.countMethodKey);
                if(rangResult && rangResult.express && rangResult.expressText){
                    expressConditionFilter = rangResult.express;
                    expressConditionFilterText = rangResult.expressText;
                }
                vals = [this.filterParams.operateVal];

                switch (this.filterParams.operateKey) {
                    case "1":
                        operate = 'ge';
                        operateText = '大于等于';
                        operateSymbol = '>=';
                        break;
                    case "2":
                        operate = 'gt';
                        operateText = '大于';
                        operateSymbol = '>';
                        break;
                    case "3":
                        operate = 'eq';
                        operateText = '等于';
                        operateSymbol = '=';
                        break;
                    case "4":
                        operate = 'le';
                        operateText = '小于等于';
                        operateSymbol = '<=';
                        break;
                    case "5":
                        operate = 'lt';
                        operateText = '小于';
                        operateSymbol = '<';
                        break;
                    case "6":
                        operate = 'ne';
                        operateText = '不等于';
                        operateSymbol = '!=';
                        break;
                    default:
                        operate = 'ge';
                        operateText = '大于等于';
                        operateSymbol = '>=';
                }
                var params = [{
                    name: expressConditionFilter+'(' + this.filterParams.measureColumnName+')',
                    operator: operate,
                    measureColumnRName:this.filterParams.measureColumnRName,
                    originColumnName:this.filterParams.measureColumnName,
                    type: 'd',
                    conditionType:2,
                    value: vals
                }];
                this.filterParams.termsText = expressConditionFilterText+'('+this.filterParams.measureColumnRName+')'+operateSymbol+this.filterParams.operateVal;
                this.installCondition('2', params);
            }

        },
        transformCountMethodExpress : function (countMethodNum) {
            var resultTemp = {};
            var express = "";
            var expressText = "";
            var countMethodIndex = "";
            if (countMethodNum) {
                switch (countMethodNum) {
                    case "1":
                        express = "SUM";
                        expressText = '求和';
                        countMethodIndex = "1";
                        break;
                    case "2":
                        express = "AVG";
                        expressText = '求平均';
                        countMethodIndex = "2";
                        break;
                    case "3":
                        express = "MAX";
                        expressText = '求最大';
                        countMethodIndex = "3";
                        break;
                    case "4":
                        express = "MIN";
                        expressText = '求最小';
                        countMethodIndex = "4";
                        break;
                    default:
                        express = "SUM";
                        expressText = '求和';
                        countMethodIndex = "1";
                }
                resultTemp.express = express;
                resultTemp.countMethodIndex = countMethodIndex;
                resultTemp.expressText = expressText;
            }
            return resultTemp;
        },
        showRange: function (defaultType) {
            if(defaultType){
                this.requestMeasureParams();
            }else {
                this.filterParams.rangeShowFlag = false;
                this.requestMeasureParams(this.transformCountMethodExpress(this.filterParams.countMethodKey));
            }
        },
        requestMeasureParams:function(rangResult){
            let focusColumn = this.filterParams.focusColumn;
            let col,id,columnName;
            if(rangResult && rangResult.express){
                focusColumn = this.filterParams.measureColumnName;
                columnName = rangResult.express+"_"+focusColumn;
            }
            for(let i=0,len=this.measures.length;i<len;i++){
                if(this.measures[i].COLUMN_NAME==focusColumn){
                    columnName = columnName || focusColumn;
                    id = this.measures[i].MODEL_ID;
                    col ={
                        COLUMN_DATA_TYPE:this.measures[i].COLUMN_DATA_TYPE,
                        COLUMN_NAME:columnName,
                        COLUMN_ORIGINAL_NAME:this.measures[i].COLUMN_NAME,
                        COLUMN_RNAME:this.measures[i].COLUMN_RNAME,
                        ORIGINAL_NAME:this.measures[i].COLUMN_NAME,
                    };
                    break;
                }
            }
            if(!col){
                this.myMessage('获取范围异常，请联系管理员','warning');
                return;
            }
            let requestParams = {
                ID:id,
                cols:[col],
                filters:columnName,
                conditions:[],
                groupBy:[]
            }
            this.loadMeasureRange(requestParams);
        },
        //获取度量范围
        loadMeasureRange: function (requestParams) {
            let me = this;
            if (requestParams !== '') {
                let jsonDataList = {
                    httpMethod: 'POST',
                    url: configpre.api_getTableDataMixInfo,
                    data: JSON.stringify(requestParams),
                };
                ajaxrequestasync(jsonDataList, function (code, msg, json) {
                    if (code == '200') {
                        me.filterParams.conditionFilter.MAX = json.maxVal;
                        me.filterParams.conditionFilter.MIN = json.minVal;
                        me.filterParams.leftNum=json.minVal;
                        me.filterParams.rightNum=json.maxVal;
                    }
                });
            }
        },
        measureColumnHighChange:function(measures){
            if(measures && measures.length>0){
                for(var sindex=0,len=measures.length;sindex<len;sindex++){
                    if(measures[sindex].COLUMN_NAME == this.filterParams.measureColumnNameHigh){
                        this.filterParams.measureColumnName = measures[sindex].COLUMN_NAME;
                        this.filterParams.measureColumnRNameHigh = measures[sindex].COLUMN_RENAME;
                        break;
                    }
                }
                if(this.filterParams.measureColumnRNameHigh!=''){
                    this.filterParams.conditionStatus = false;
                    this.filterParams.highConditionStatus=false;
                }
                this.measureColumnHighConditionChange();
            }
        },
        measureColumnHighConditionChange:function(){
            var vals = '';
            var operateHigh = '';
            var operateHighText = '';
            var operateHighSymbol = '';

            var expressHighConditionFilter = "";
            var expressHighConditionFilterText = "";
            if(this.filterParams.operateHighKey && this.filterParams.operateHighVal){
                var rangHighResult = this.transformCountMethodExpress(this.filterParams.countMethodKeyHigh);
                if(rangHighResult && rangHighResult.express && rangHighResult.expressText){
                    expressHighConditionFilter = rangHighResult.express;
                    expressHighConditionFilterText = rangHighResult.expressText;
                }
                vals = this.filterParams.operateHighVal;

                switch (this.filterParams.operateHighKey) {
                    case "1":
                        operateHigh = 'le';
                        operateHighText = '最大';
                        operateHighSymbol = '<=';
                        break;
                    case "2":
                        operateHigh = 'ge';
                        operateHighText = '最小';
                        operateHighSymbol = '>=';
                        break;
                    default:
                        operateHigh = 'le';
                        operateHighText = '最大';
                        operateHighSymbol = '<=';
                }
                var params = [{
                    name: expressHighConditionFilter+'(' + this.filterParams.measureColumnName+')',
                    rename: expressHighConditionFilter+'_' + this.filterParams.measureColumnNameHigh,
                    operator: operateHigh,
                    measureColumnRNameHigh:this.filterParams.measureColumnRNameHigh,
                    originColumnName:this.filterParams.measureColumnName,
                    highFilter:true,
                    type: 'd',
                    conditionType:3,
                    value: vals
                }];
                this.filterParams.highConditionFilterText = '按照'+expressHighConditionFilterText+'('+this.filterParams.measureColumnRNameHigh+')'+'方式取'+operateHighText+this.filterParams.operateHighVal+'项';
                this.installCondition('3', params);
            }
        },
        rangeTypeChange:function(){
            if(this.filterParams.radioRange=='1'){
                this.setDisableStatus(false,false);
            }else if(this.filterParams.radioRange=='2'){
                this.setDisableStatus(false,true);
            }else if(this.filterParams.radioRange=='3'){
                this.setDisableStatus(true,false);
            }
        },
        setDisableStatus:function(status1,status2){
            if(this.type=='2'){
                this.filterParams.leftNumDisabled = status1;
                this.filterParams.rightNumDisabled = status2;
            }else if(this.type=='3'){
                this.filterParams.beginTimeDisabled = status1;
                this.filterParams.endTimeDisabled = status2;
            }
        },
        setRange:function(){
            this.filterParams.rangeShowFlag = true;
            if(this.type=='2'){
                this.filterParams.leftNum = '';
                this.filterParams.rightNum = '';
            }else if(this.type=='3'){
                this.filterParams.beginTime = '';
                this.filterParams.endTime = '';
            }
        },
        installRange:function(){
            let operate,vals,rangeValL,rangeValR,tableIndex;
            if(this.type=='2'){
                rangeValL= this.filterParams.leftNum;
                rangeValR = this.filterParams.rightNum;
                tableIndex = '4';
            }else if(this.type=='3'){
                rangeValL = this.filterParams.beginTime;
                rangeValR = this.filterParams.endTime;
                tableIndex = '5';
            }
            if (this.filterParams.radioRange == '1') {
                if(rangeValL=='' || rangeValR==''){
                    this.myMessage('请设置数据','warning');
                    return;
                }
                operate = 'between';
                vals = [rangeValL, rangeValR];
            } else if (this.filterParams.radioRange == '2') {
                if(rangeValL==''){
                    this.myMessage('请设置数据','warning');
                    return;
                }
                operate = 'ge';
                vals = [rangeValL];
            } else {
                if(rangeValR==''){
                    this.myMessage('请设置数据','warning');
                    return;
                }
                operate = 'le';
                vals = [rangeValR];
            }
            var objItem = [{
                name: this.filterParams.focusColumn,
                operator: operate,
                type: 'd',
                radioRange:this.filterParams.radioRange,
                colType:this.type,
                value: vals
            }];
            this.installCondition(tableIndex, objItem);
        },
        saveRange:function(){
            this.installRange();
            this.doSaveFilter();
        },
        doSaveFilter:function(){
            if(this.conditions && this.conditions.length>0){
                let cfgs = {
                    pkey:this.pkey,
                    colName:this.filterParams.focusColumn,
                    conditionObjs:this.conditionObjs,
                    conditions:this.conditions,
                    modelRelationId:this.data.modelRelationId
                }
                let config = {
                    params:{pkey:{type:''}},
                    msgCfg:{show:true}
                };
                let jsonDataList={
                    httpMethod:'POST',
                    url:configpre.map_saveGisRelationConditions,
                    data:JSON.stringify(cfgs)
                };
                this.requestAsyncApi(jsonDataList,config);
            }else{
                this.myMessage('请设置过滤条件','warning');
            }

        }
    }
});
