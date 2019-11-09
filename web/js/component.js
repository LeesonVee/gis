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
Vue.component('filter-component',{
    data(){
        return {
            pkey:'',
            name:'',
            rename:'',
            type:'',
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
                listItemText: '无',
                installContentText:'无',
                termsText: '无',
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
            },
            topOptions: [{key: '1', text: '包含以下所有条件'}, {key: '2', text: '包含以下任意条件'}],
            bodyOptions: [
                {key: '1', text: '包含'},
                {key: '2', text: '开头是'},
                {key: '3', text: '结尾是'},
                {key: '4', text: '不包含'},
                {key: '5', text: '等于'}
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
                {key: '1', text: '大于等于'},
                {key: '2', text: '大于'},
                {key: '3', text: '等于'},
                {key: '4', text: '小于等于'},
                {key: '5', text: '小于'},
                {key: '6', text: '不等于'}
            ],
            columnData: [{VAL: '江西'}, {VAL: '上海'}, {VAL: '北京'}, {VAL: '黑龙江'}, {VAL: '新疆'}, {VAL: '湖南'}, {VAL: '湖北'}, {VAL: '四川'}, {VAL: '东北'}, {VAL: '山东'}],
            conditionObjs:[],
            conditions:[]
        }
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
                                                        <el-select v-model="filterParams.countMethodKey" size="mini" @change="conditionFilterChange">
                                                            <el-option v-for="item in countMethodList" :key="item.key" :label="item.text" :value="item.key" ></el-option>
                                                        </el-select>
                                                    </el-col>
                                                </el-row>
                                            </el-tab-pane>
                                            <el-tab-pane label="高级筛选" name="fourth">
                                                
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
                                                    <el-col :span="14"></el-col>
                                                </el-row>
                                                <el-row :class="['dim-row-padding',filterParams.activeName=='fourth'?'dim-row-active':'']">
                                                    <el-col :span="1">&nbsp;</el-col>
                                                    <el-col :span="8">高级筛选:</el-col>
                                                    <el-col :span="14">无</el-col>
                                                </el-row>
                                                <el-row>&nbsp;</el-row>
                                            </el-col>
                                            <el-col :span="2">&nbsp;</el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="2">&nbsp;</el-col>
                                            <el-col :span="22"><el-button type="success">保存设置</el-button></el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>
                            </template>
                            <template v-else-if="type=='2' || type=='3'">
                                <el-row class="el-filter-row">
                                    <el-col :span="24">
                                        <el-radio-group v-model="filterParams.radioRange">
                                            <el-radio :label="1">范围</el-radio>
                                            <el-radio :label="2">最少</el-radio>
                                            <el-radio :label="3">最多</el-radio>
                                        </el-radio-group>
                                    </el-col>
                                </el-row>
                                <el-row class="el-filter-row">
                                    <el-col :span="3">&nbsp;</el-col>
                                    <el-col :span="8">
                                        <el-input v-model="filterParams.leftNum"></el-input>
                                    </el-col>
                                    <el-col :span="2"><span style="height: 40px;line-height: 40px;padding:0 20px;"> - </span></el-col>
                                    <el-col :span="8">
                                        <el-input v-model="filterParams.rightNum"></el-input>
                                    </el-col>
                                    <el-col :span="3">&nbsp;</el-col>
                                </el-row>
                                <el-row class="el-filter-row">
                                    <el-col :span="24"><el-button type="primary">加载范围</el-button></el-col>
                                </el-row>
                                <el-row class="el-filter-row">
                                    <el-col :span="24">
                                        <span style="margin-right:20px;"><el-button type="success">保存</el-button></span>
                                        <span><el-button type="danger">重置</el-button></span>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-main>
                      </el-container>
                    </el-container>
                </template>
              </div>`,
    methods: {
        getCurrentRow:function (e) {
            debugger;
            let init = true;
            let row = e.row;
            this.pkey = row.ID;
            this.name = row.COLUMN_NAME;
            this.rename = row.COLUMN_RENAME;
            this.type = row.COLUMN_TYPE;
            //维度：1（时间：3）,度量：2
            if(row.COLUMN_TYPE=="1"){
                this.type = this.colDataTypeToFilterType(row.COLUMN_DATA_TYPE)
            }else{

            }
            this.initParams(init);
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
        initParams:function(init){
            if(init){
                this.filterParams.activeName='first';
                this.filterParams.radioRange=1;
                this.filterParams.leftNum='';
                this.filterParams.rightNum='';
            }
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
        changeListRadio:function(){
            if(this.filterParams.listRadio=='1'){

            }

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
                    value: this.filterParams.checkList
                }];
                this.installCondition('1', params);
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
                    value: this.filterParams.checkList
                }];
                this.installCondition('1', params);
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
                    value: this.filterParams.checkList
                }];
                this.installCondition('1', params);
            } else {
                this.removeCondition('1');
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
                this.removeCondition('1');
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
                value: vals
            }];
            this.installCondition('1', params);
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
         *@param tabType 1：列表查询2：文本帅选3：条件筛选4：高级筛选 5：度量范围6：时间
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
                            name: this.columnNameFilter,
                            operator: operateCfg.key,
                            type: 's',
                            value: contentText.text,
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
                    this.installCondition('2', params);
                } else {
                    this.filterParams.installContentText = '无';
                }
            } else {
                this.removeCondition('2');
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
            // this.conditionFilterChange();
        },
        conditionFilterChange : function () {
            var vals = [];
            var operate = '';
            var operateText = '';
            var operateSymbol = '';
            var expressConditionFilter = "";
            var expressConditionFilterText = "";
            if(this.filterParams.operateVal == 0 ||this.filterParams.operateVal == ""){
                this.removeCondition('3');
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
                    type: 'd',
                    value: vals
                }];
                this.filterParams.termsText = expressConditionFilterText+'('+this.filterParams.measureColumnRName+')'+operateSymbol+this.filterParams.operateVal;
                this.installCondition('3', params);
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
    }
});
