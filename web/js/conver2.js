/**
 * Created by weilishan on 2019/8/1.
 */
(function(){

    var map, converLayer,jsonData,layer;
    var jsonAreaCode = {
        target:'map',
        center:[113.335367,23.13559],
        zoom:11,
        bgGround:{
            fillColor:"#080107",
            strokeColor:'#080107'//#BDBDBD
        },
        level:'street',//国：country,省：province市city，区district，街道street
        // upAreaCode:'440000',
        // areaCode:'440100',

        //到街道数据必须以code+'-1'方式命名
        upAreaCode:'440100-1',
        areaCode:'440106-1'

    }

    function addTextStyle(cfg){
        var text = new ol.style.Text({
            //对齐方式
            textAlign: cfg.textAlign||'center',
            //文本基线
            textBaseline: cfg.textBaseline||'middle',
            //字体样式
            font: cfg.font||'normal 14px 微软雅黑',
            //文本内容
            text: cfg.name||'',
            //填充样式
            fill: new ol.style.Fill({
                color: cfg.fillColor||'#aa3300'
            }),
            //笔触
            stroke: new ol.style.Stroke({
                color: cfg.strokeColor||'#ffcc33',
                width: cfg.strokeWidth||2
            })
        });
        return text;
    }
    function fillBgColor(color){
        var fill = new ol.style.Fill({
            color: color||'#011659'
            // color:"rgba(72,61,139, 0.4)"
        });
        return fill;
    }
    function initMap() {
        layer = new ol.layer.Vector({
            title: 'add Layer',
            source: new ol.source.Vector({
                projection: 'EPSG:4326',
                url: "data/"+jsonAreaCode.areaCode+'.json', //GeoJSON的文件路径，用户可以根据需求而改变
                format: new ol.format.GeoJSON()
            }),
            //FIXME
            style:function (feature, resolution) {
                var areaCfg = feature.values_;
                var color;
                if(areaCfg.name=='天河区' || areaCfg.name=='增城区'){
                    color = '#3FC012';
                }
                return new ol.style.Style({
                    fill:fillBgColor(color),
                    text:addTextStyle(areaCfg)
                });

            }

            // style: new ol.style.Style({
            //     fill: new ol.style.Fill({
            //         color: '#011659'
            //         // color:"rgba(72,61,139, 0.4)"
            //     }),
            // })
        });
        //加载高德地图
        var layers = [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url:configpre.api_rootPath+'static/imgXYZ/amap/{z}-{x}-{y}.jpg'
                    // url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
                })
            }),
            layer
        ];


        map = new ol.Map({
            target: jsonAreaCode.target,
            layers: layers,
            view: new ol.View({
                projection: 'EPSG:4326',
                center: jsonAreaCode.center,//113.415546,23.108909  113.272723,23.117751 天河区113.335367,23.13559 广州市113.569354,23.23516
                zoom: jsonAreaCode.zoom
            })
        });

        var mystyle = new ol.style.Style({
            fill: new ol.style.Fill({
                // color:"rgba(72,61,139, 0.4)"
                color:jsonAreaCode.bgGround.fillColor,
            }),
            stroke: new ol.style.Stroke({
                color:jsonAreaCode.bgGround.strokeColor,
                width:2
            })
        });

        converLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: mystyle
        });
        map.addLayer(converLayer);
        map.on('singleclick', function (evt) {
            var pixel = map.getEventPixel(evt.originalEvent);
            var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                debugger;
                return feature;
            });
        });


        var highlightStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#f00',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0.3)'
            }),
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 3
                })
            })
        });
        var featureOverlay = new ol.layer.Vector({
            source: new ol.source.Vector(),
            map: map,
            style: highlightStyle
        });

        //设置鼠标滑过区域，高亮显示
        var highlight;
        var displayFeatureInfo =function(pixel){
            var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });
            //非GeoJSON区域不需要高亮显示
            if(converLayer.getSource().hasFeature(feature)){
                if(highlight){
                    featureOverlay.getSource().removeFeature(highlight);
                    highlight=undefined;
                }
                return;
            }
            //在图层外面的时候，feature和highlight都是null，不执行
            //如果有feature没有hightlight，就添加feature到图层，并且给highlight赋值。
            //如果feature发生改变，就移除highlight并添加新的feature到图层，然后给highlight改变值。
            if (feature !== highlight) {
                if (highlight) {
                    featureOverlay.getSource().removeFeature(highlight);
                }
                if (feature) {
                    featureOverlay.getSource().addFeature(feature);
                }
                highlight = feature;
            }
            return feature;
        }
        map.on('pointermove', function (evt) {
            var pixel = map.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel);
        });
    }

    //todo
    //添加遮罩
    function addconver(url) {
        if(!jsonData){
            $.getJSON(url, function(data) {
                jsonData = data;
                var fts = new ol.format.GeoJSON().readFeatures(jsonData);
                var index = getAreaGeoJSON(jsonData);
                var ft = fts[index];
                var converGeom = erase(ft.getGeometry());
                var convertFt = new ol.Feature({
                    geometry: converGeom
                });
                converLayer.getSource().addFeature(convertFt);
            });
        }
    }
    //获取当前行政区域序号
    function getAreaGeoJSON(data){
        debugger;
        var length,geoData;
        if(data.length){
            geoData = data;
            length = data.length;
        }else{
            geoData = data.features;
            length = data.features.length;
        }
        var index=0;
        var adcode = jsonAreaCode.areaCode;
        if(jsonAreaCode.level=='street'){
            adcode = jsonAreaCode.areaCode.substring(0,jsonAreaCode.areaCode.length-2);
        }
        for(var i=0;i<length;i++){
            if(geoData[i].properties.adcode == adcode){
                index = i;
                break;
            }
        }
        return index;
    }
    // 擦除操作,生产遮罩范围
    function erase(geom) {
        var extent = [-180,-90,180,90];
        var polygonRing = ol.geom.Polygon.fromExtent(extent);
        var coords = geom.getCoordinates();
        coords.forEach(coord =>{
            var linearRing = new ol.geom.LinearRing(coord[0]);
            polygonRing.appendLinearRing(linearRing);
        })
        return polygonRing;
    }

    function selectByAttribute(){
        var features = converLayer.getSource().getFeatures();
        //console.log(features);
        var value = '天河区';
        var property = 'name';
        var selectedByAttriFeature;//实际应用中设置成全局变量
        for (var i = 0, ii = features.length; i < ii; i++) {
            if (features[i].get(property) === value) {
                selectedByAttriFeature = features[i];
                break;
            }
        }
        debugger;
        // selectedByAttriFeature.setStyle(featureSelectStyle);//高亮查询到的feature
        //
        // var my_view = new ol.View({
        //     center: getCenterOfExtent(selectedByAttriFeature.getGeometry().getExtent()),
        //     zoom: 14
        // });
        // map.setView(my_view);
    }
    $("#btn1").click(function () {
        //selectByAttribute();
        addMarks('organ','机构',{lng:'113.569354',lat:'23.23516'});
    });
    $("#btn2").click(function () {
        addMarks('doctor','医生',{lng:'113.544635',lat:'23.220647'});
    });
    $("#btn3").click(function () {
        addMarks('disease','流感',{lng:'113.564204',lat:'23.200611'});
    });
    $("#btn4").click(function () {
        cleanMarks();
    });
    $("#btn5").click(function () {
        var cfgs = [
            {lableName:'天河区',lng:'113.3612',lat:'23.12468'},
            {lableName:'荔湾区',lng:'113.244261',lat:'23.125981'},
            {lableName:'越秀区',lng:'113.266841',lat:'23.128524'},
            {lableName:'海珠区',lng:'113.317388',lat:'23.083801'},
            {lableName:'白云区',lng:'113.273289',lat:'23.15729'},
            {lableName:'黄埔区',lng:'113.459749',lat:'23.106402'},
            {lableName:'番禺区',lng:'113.384129',lat:'22.937244'},
            {lableName:'花都区',lng:'113.220218',lat:'23.404165'},
            {lableName:'南沙区',lng:'113.525165',lat:'22.801624'},
            {lableName:'从化区',lng:'113.586605',lat:'23.548852'},
            {lableName:'增城区',lng:'113.81086',lat:'23.261141'}];
        cfgs.forEach(item=>{
            addText(item);
        });
    });

    $("#btn6").click(function () {
        addHotMap();
    });
    $("#btn7").click(function () {
        removeHotMap();
    });
    var intervalFun;
    $("#btn8").click(function () {
        intervalFun = setInterval(function(){loopShowHotMap()},2000);
    });
    $("#btn9").click(function () {
        if(intervalFun){
            clearInterval(intervalFun);
            intervalFun=undefined;
        }
    });
    function addMarks(imgName,lableName,coord){
        // 创建一个Feature，并设置好在地图上的位置
        var anchor = new ol.Feature({
            geometry: new ol.geom.Point([coord.lng,coord.lat])
        });
        // 设置样式，在样式中就可以设置图标
        anchor.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                opacity: 0.7,
                src: 'resources/img/'+imgName+'.jpg'
            }),
            text: new ol.style.Text({
                //对齐方式
                textAlign: 'center',
                //文本基线
                textBaseline: 'middle',
                //字体样式
                font: 'normal 14px 微软雅黑',
                //文本内容
                //text: feature.get('name'),
//                text: "医生",
                text: lableName,
                //填充样式
                fill: new ol.style.Fill({
                    color: '#aa3300'
                }),
                //笔触
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                })
            })
        }));
        // 添加到之前的创建的layer中去
        layer.getSource().addFeature(anchor);
    }
    function addText(param){
        var anchor = new ol.Feature({
            geometry: new ol.geom.Point([param.lng,param.lat])
        });
        anchor.setStyle(new ol.style.Style({
            text: new ol.style.Text({
                //对齐方式
                textAlign: 'center',
                //文本基线
                textBaseline: 'middle',
                //字体样式
                font: 'normal 6px 微软雅黑',
                text: param.lableName,
                //填充样式
                fill: new ol.style.Fill({
                    color: '#aa3300'
                }),
                //笔触
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                })
            })
        }));
        layer.getSource().addFeature(anchor);
    }

    function cleanMarks(){
        layer.getSource().clear();
    }
    var hotVector;
    function addHotMap(){
        var heatData = [
            {type: "FeatureCollection",
                features:  [
                    {type: "Point","coordinates": [113.38817998766899, 23.228823244571686], count: 10},
                    {type: "Point","coordinates": [113.3846393879503, 23.178168972954154], count: 1},
                    {type: "Point","coordinates": [113.37045326828957, 23.17977737635374], count: 1},
                    {type: "Point","coordinates": [113.37186109274626, 23.180253468453884], count: 1},
                    {type: "Point","coordinates": [113.36917284876108, 23.17991215735674], count: 1},
                    {type: "Point","coordinates": [113.36940318346024, 23.181409500539303], count: 1},
                    {type: "Point","coordinates": [113.3704049885273, 23.17987024784088], count: 1},
                    {type: "Point","coordinates": [113.37753765285015, 23.16808059811592], count: 1},
                    {type: "Point","coordinates": [113.34545910358429, 23.17575842142105], count: 1},
                    {type: "Point","coordinates": [113.37470322847366, 23.187069967389107], count: 1},
                    {type: "Point","coordinates": [113.39552574100004,23.117307946999979], count: 1},
                    {type: "Point","coordinates": [113.39597693700001,23.115412739000011], count: 1},
                    {type: "Point","coordinates": [113.39604102299997,23.114307607], count: 1},
                    {type: "Point","coordinates": [113.39599813300006,23.11260939499999], count: 1},
                    {type: "Point","coordinates": [113.39413281800002,23.11325236499999], count: 1},
                    {type: "Point","coordinates": [113.39376675600001,23.11337836], count: 1},
                    {type: "Point","coordinates": [113.39361577499997,23.11278627699999], count: 1},
                    {type: "Point","coordinates": [113.39307986100007,23.110417953000013], count: 1},
                    {type: "Point","coordinates": [113.39245790400004,23.108463675999982], count: 1},
                    {type: "Point","coordinates": [113.39209690500005,23.10770456099999], count: 1},
                    {type: "Point","coordinates": [113.39137878600003,23.107906544], count: 1},
                    {type: "Point","coordinates": [113.38968451100006,23.108328497], count: 1},
                    {type: "Point","coordinates": [113.38809525500007,23.108694449999966], count: 1}
                ]}];
        //矢量图层 获取geojson数据
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(heatData[0],{
                dataProjection : 'EPSG:4326',
                featureProjection : 'EPSG:4326'
            })
        });
        // Heatmap热力图
        hotVector = new ol.layer.Heatmap({
            source: vectorSource,
            opacity: [0, 0.8],//透明度
            blur: 15,//模糊大小（以像素为单位）,默认15
            radius: 12,//半径大小（以像素为单位,默认8
            shadow: 250,//阴影像素大小，默认250
            gradient:['black','blue','yellow','red'],//设置颜色
            //矢量图层的渲染模式：
            //'image'：矢量图层呈现为图像。性能出色，但点符号和文本始终随视图一起旋转，像素在缩放动画期间缩放。
            //'vector'：矢量图层呈现为矢量。即使在动画期间也能获得最准确的渲染，但性能会降低。
            renderMode: 'hotVector'
        });
        map.addLayer(hotVector);
    }

    function  removeHotMap() {
        if(hotVector){
            map.removeLayer(hotVector);
            hotVector=undefined;
        }
    }
    var heatDatas1 = [{
        type: "FeatureCollection",
        date:'2016年',
        text:'流感',
        features:  [
            {type: "Point","coordinates": [113.38817998766899, 23.228823244571686], count: 10},
            {type: "Point","coordinates": [113.3846393879503, 23.178168972954154], count: 1},
            {type: "Point","coordinates": [113.37045326828957, 23.17977737635374], count: 1},
            {type: "Point","coordinates": [113.37186109274626, 23.180253468453884], count: 1},
            {type: "Point","coordinates": [113.36917284876108, 23.17991215735674], count: 1},
            {type: "Point","coordinates": [113.36940318346024, 23.181409500539303], count: 1},
            {type: "Point","coordinates": [113.3704049885273, 23.17987024784088], count: 1},
            {type: "Point","coordinates": [113.37753765285015, 23.16808059811592], count: 1},
            {type: "Point","coordinates": [113.34545910358429, 23.17575842142105], count: 1},
            {type: "Point","coordinates": [113.37470322847366, 23.187069967389107], count: 1},
            {type: "Point","coordinates": [113.39552574100004,23.117307946999979], count: 1},
            {type: "Point","coordinates": [113.39597693700001,23.115412739000011], count: 1},
            {type: "Point","coordinates": [113.39604102299997,23.114307607], count: 1},
            {type: "Point","coordinates": [113.39599813300006,23.11260939499999], count: 1},
            {type: "Point","coordinates": [113.39413281800002,23.11325236499999], count: 1},
            {type: "Point","coordinates": [113.39376675600001,23.11337836], count: 1},
            {type: "Point","coordinates": [113.39361577499997,23.11278627699999], count: 1},
            {type: "Point","coordinates": [113.39307986100007,23.110417953000013], count: 1},
            {type: "Point","coordinates": [113.39245790400004,23.108463675999982], count: 1},
            {type: "Point","coordinates": [113.39209690500005,23.10770456099999], count: 1},
            {type: "Point","coordinates": [113.39137878600003,23.107906544], count: 1},
            {type: "Point","coordinates": [113.38968451100006,23.108328497], count: 1},
            {type: "Point","coordinates": [113.38809525500007,23.108694449999966], count: 1}
        ]
    },{
        type: "FeatureCollection",
        date:'2017年',
        text:'流感',
        features:  [
            {type: "Point","coordinates": [113.40006351470947, 23.193875402212143], count: 10},
            {type: "Point","coordinates": [113.40668454766273, 23.18638265132904], count: 10},
            {type: "Point","coordinates": [113.41117456555367, 23.1967855989933], count: 10},
            {type: "Point","coordinates": [113.39844614267349, 23.193812370300293], count: 10},
        ]
    },{
        type: "FeatureCollection",
        date:'2018年',
        text:'流感',
        features:  [
            {type: "Point","coordinates": [113.3544471859932, 23.203421384096146], count: 10},
            {type: "Point","coordinates": [113.35447132587433, 23.22862207889557], count: 10},
            {type: "Point","coordinates": [113.35406497120857, 23.190349638462067], count: 10},
            {type: "Point","coordinates": [113.37615698575974, 23.19352000951767], count: 10},
        ]
    },{
        type: "FeatureCollection",
        date:'2018年',
        text:'流感',
        features:  [
            {type: "Point","coordinates": [113.34618732333183, 23.161409944295883], count: 10},
            {type: "Point","coordinates": [113.36334809660912, 23.162637054920197], count: 10}
        ]
    }];

    var loopHotVector;
    function showHotMap(heatDatas1){
        if(loopHotVector){
            map.removeLayer(loopHotVector);
        }
        //矢量图层 获取geojson数据
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(heatDatas1,{
                dataProjection : 'EPSG:4326',
                featureProjection : 'EPSG:4326'
            })
        });
        // Heatmap热力图
        loopHotVector = new ol.layer.Heatmap({
            source: vectorSource,
            opacity: [0, 0.8],//透明度
            blur: 15,//模糊大小（以像素为单位）,默认15
            radius: 12,//半径大小（以像素为单位,默认8
            shadow: 250,//阴影像素大小，默认250
            gradient:['black','blue','yellow','red'],//设置颜色
            //矢量图层的渲染模式：
            //'image'：矢量图层呈现为图像。性能出色，但点符号和文本始终随视图一起旋转，像素在缩放动画期间缩放。
            //'vector'：矢量图层呈现为矢量。即使在动画期间也能获得最准确的渲染，但性能会降低。
            renderMode: 'hotVector'
        });
        map.addLayer(loopHotVector);
    }
    var dataIndex = 0;
    // setTimeout(function (){
    //     setInterval(function(){loopShowHotMap()},2000);
    // }, 3000);

    function loopShowHotMap(){
        document.getElementById("year").innerHTML=heatDatas1[dataIndex].date+heatDatas1[dataIndex].text+'分布情况';
        // document.getElementById("year").innerHTML=heatDatas[dataIndex].date+heatDatas[dataIndex].text+'分布情况';
        // showHotMap(heatDatas[dataIndex].heatData);
        showHotMap(heatDatas1[dataIndex]);
        dataIndex++;
        if(dataIndex==heatDatas1.length){
            dataIndex=0;
        }
    }
    initMap();
    var dataURL = './data/'+jsonAreaCode.upAreaCode+'.json'
    addconver(dataURL);
})();
