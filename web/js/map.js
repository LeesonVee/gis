/**
 * Created by weilishan on 2019/8/6.
 */
function setRootParam(cfgs){
    var jsonAreaCode = {
        target:cfgs.target||'map',
        center:cfgs.center,//[113.335367,23.13559],
        zoom:cfgs.zoom,//11
        projection:cfgs.projection||'EPSG:4326',
        bgGround:{
            fillColor:cfgs.fillColor||"#080107",
            strokeColor:cfgs.strokeColor||'#080107'//#BDBDBD
        },
        areaColor:cfgs.areaColor,
        areaStrokeColor: cfgs.areaStrokeColor||'#4392ff',
        areaStrokeWidth: cfgs.areaStrokeWidth||2,
        events: cfgs.events||[],
        levels:cfgs.levels||'street',//国：country,省：province市city，区district，街道street
        // upAreaCode:'440000',
        // areaCode:'440100',
        //到街道数据必须以code+'-1'方式命名
        upAreaCode:cfgs.upAreaCode,//'440100-1'
        areaCode:cfgs.areaCode,//'440106-1',
        otherMap:cfgs.otherMap||'0',
        mapType:cfgs.mapType

    }
    fixRootParam(jsonAreaCode,cfgs);
    return jsonAreaCode;
}
//钩子函数
function fixRootParam(jsonAreaCode,cfgs){

}
function setStroke(cfg){
    var stroke =  new ol.style.Stroke({
        color: cfg.areaStrokeColor,
        width: cfg.areaStrokeWidth
    });
    return stroke;
}
//label设置样式
function addTextStyle(cfg){
    var text = new ol.style.Text({
        //对齐方式
        textAlign: cfg.textAlign||'center',//center
        //文本基线
        textBaseline: cfg.textBaseline||'middle',//bottom middle
        //字体样式
        font: cfg.font||'normal 14px 微软雅黑',
        //文本内容
        text: cfg.name||'',
        // text:'test',
        // rotateWithView:true,
        // rotation:1,
        //填充样式
        fill: new ol.style.Fill({
            color: cfg.fillColor||'#409EFF'
        }),
        //笔触
        // stroke: new ol.style.Stroke({
        //     color: cfg.strokeColor||'#FFFFFF',
        //     width: cfg.strokeWidth||2
        // })
    });
    return text;
}
//设置显示区域背景填充色
function fillBgColor(color){
    var fill = new ol.style.Fill({
        color: color||'rgba(17, 30, 88, 0)'
        // color: color||'#C88D0B01'
    });
    return fill;
}
//加载高德地图,默认加载高德地图在线地图
function gaodeLayers(url){
    var amapLayer =  new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: url||'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
    });
    this.amapLayer = amapLayer;
    return this.amapLayer;
}
function addMapArea(jsonAreaCode){
    var layer = new ol.layer.Vector({
        title: 'add Layer',
        source: new ol.source.Vector({
            projection: 'EPSG:4326',
            url: configpre.webGisPath+"static/data/"+jsonAreaCode.areaCode+'.json', //GeoJSON的文件路径，用户可以根据需求而改变
            format: new ol.format.GeoJSON()
        }),
        style:function (feature, resolution) {
            var areaCfg = feature.values_;
            var color = jsonAreaCode.areaColor;
            return new ol.style.Style({
                fill:this.fillBgColor(color),
                text:this.addTextStyle(areaCfg),
                stroke:this.setStroke(jsonAreaCode)
            });

        }
    });
    this.layer = layer;
    return layer;
}
function addMarksLayer(jsonAreaCode){
    var marksLayer = new ol.layer.Vector({
        title: 'add Layer1',
        source: new ol.source.Vector({
            projection: 'EPSG:4326'
        })
    });
    this.marksLayer = marksLayer;
}
//初始化地图
function initMap(cfgs){
    var layers = [];
    this.jsonData,this.dataIndex;
    var jsonAreaCode = this.setRootParam(cfgs);
    this.addMapArea(jsonAreaCode);

    if(cfgs.otherMap=='1'){
        if(cfgs.mapType=='amap'){
            this.gaodeLayers(configpre.api_rootPath+'static/imgXYZ/'+cfgs.mapType+'/{z}-{x}-{y}.jpg');
            layers.push(this.amapLayer);
        }else if(cfgs.mapType=='bmap'){
            //FIXME
        }
    }else{
        if(this.gdLayer){
            this.gdLayer = null;
        }
    }
    layers.push(this.layer);
    this.addMarksLayer();
    layers.push(this.marksLayer);
    var center = [parseFloat(jsonAreaCode.center[0]),parseFloat(jsonAreaCode.center[1])];
    var viewCfg = {};
    viewCfg['projection'] = jsonAreaCode.projection;
    viewCfg['center'] = center;
    viewCfg['zoom'] = jsonAreaCode.zoom;
    if(jsonAreaCode.maxZoom){
        viewCfg['maxZoom'] = jsonAreaCode.maxZoom;
    }
    if(jsonAreaCode.minZoom){
        viewCfg['minZoom'] = jsonAreaCode.minZoom;
    }
    var map = new ol.Map({
        target: jsonAreaCode.target,
        layers: layers,
        view: new ol.View(viewCfg)
    });
    this.setMyStyle(map,jsonAreaCode);
    this.addEvent(jsonAreaCode,map);
    var dataURL = configpre.webGisPath+'static/data/'+jsonAreaCode.upAreaCode+'.json'
    this.addconver(dataURL,jsonAreaCode);
    this.map = map;
    return this.map;
}
function addEvent(jsonAreaCode,map){
    if(!jsonAreaCode.events || jsonAreaCode.events.length==0){
        return;
    }
    var me = this;
    jsonAreaCode.events.forEach(element=>{
        if(element=='singleclick'){
            map.on(element, function (evt) {
                //地图绑定单击事件
                me.singleClick(evt);
            });
        }else if(element=='pointermove'){
            // pointermoveMap(element,map);
            pointerMoveSetXY(element,map);
        }else if(element=='moveend'){
            map.on(element, function (evt) {
                mapMoveend(map)
            });
        }else if(element=='movestart'){
            map.on(element, function (evt) {
                if(mapVue.heatmapInstance!=''){
                    var heatmapData = {
                        max: 100,
                        min: 0,
                        data: []
                    };
                    mapVue.setHeatMapData(heatmapData,true);
                }
                if(mapVue.flightInstance!=''){
                    if(mapVue.resizeStatus){
                        mapVue.resizeStatus = false;
                        return;
                    }
                    cleanFlight(mapVue.flightInstance);
                }
            });
        }
    });
}
function pointermoveMap(element,map){
    let me = this;
    var converLayer = this.converLayer;
    var featureOverlay = this.featureOverlay(map);
    //地图绑定鼠标滑过事件
    map.on(element, function (evt) {
        me.highlight = me.pointerMove(evt,converLayer,featureOverlay,me.highlight,map);
    });
}
/**
 * 判断是否在圆形内
 * @param p
 * @param c
 * @param r
 * @return boolean
 */
function distencePC(p,c,r){//判断点与圆心之间的距离和圆半径的关系
    let d2 = Math.hypot((p[0] - c[0]), (p[1] - c[1]));
    if(d2>r/100000000){
        return false;
    }else{
        return true;
    }
}
/**
 * 根据当前地图缩放等级，转换圆的半径大小
 * @param map
 * @returns {*}
 */
function getRadius(map){
    let radius;
    let zoom = map.getView().getZoom();
    switch (parseInt(zoom)){
        case 1:radius=624000000;break;
        case 2:radius=312000000;break;
        case 3:radius=156000000;break;
        case 4:radius=78000000;break;
        case 5:radius=39000000;break;
        case 6:radius=19200000;break;
        case 7:radius=9600000;break;
        case 8:radius=4800000;break;
        case 9:radius=2400000;break;
        case 10:radius=1200000;break;
        case 11:radius=600000;break;
        case 12:radius=303000;break;
        case 13:radius=180000;break;
        case 14:radius=110000;break;
        case 15:radius=50000;break;
        case 16:radius=25000;break;
        case 17:radius=10000;break;
        case 18:radius=6000;break;
        case 19:radius=3000;break;
        case 20:radius=1000;break;
        case 21:radius=500;break;
        case 22:radius=250;break;
        case 23:radius=135;break;
        case 24:radius=70;break;
        case 25:radius=45;break;
        case 26:radius=18;break;
        case 27:radius=9;break;
        case 28:radius=6;break;
        default:radius=1;break;
    }
    return radius;
}
function pointerMoveSetXY(element,map){
    map.on(element, function (evt) {
        let point = evt.pixel;
        let radius = getRadius(map);
        if(typeof(mapVue)!=='undefined'){
            let coordinate;
            let coordinateData = mapVue.allFloatDialogData;
            if(!coordinateData || coordinateData.length==0){
                return;
            }
            for(let p in coordinateData){
                if(distencePC(evt.coordinate,JSON.parse(p),radius)){
                    coordinate=p;
                }
            }
            if(coordinateData && coordinateData!='' && coordinateData[coordinate]){
                mapVue.floatCompData.left=point[0]+5;
                mapVue.floatCompData.top=point[1]+5;
                mapVue.floatCompData.items.table = coordinateData[coordinate];
                mapVue.floatDialog = true;
            }else{
                mapVue.floatDialog = false;
            }
        }
    });
}
//地图缩放or拖动处理逻辑
function mapMoveend(map){
    //窗体变化时，热力图渲染交由窗体变化逻辑处理
    if(mapVue.resizeStatus){
        mapVue.resizeStatus = false;
        return;
    }
    heatMapMoveend(map);
    flightMapMoveend(map);
}
//地图缩放or拖动 热力图处理逻辑
function heatMapMoveend(map){
    if(mapVue.heatmapInstance!=''){
        let heatmapData = {
            max: mapVue.heatmapData.max,
            min: mapVue.heatmapData.min,
            data: mapVue.heatmapPluginsData(mapVue.heatmapData.data)
        };
        mapVue.setHeatMapData(heatmapData);
    }
}
//地图缩放or拖动 分线图处理逻辑
function flightMapMoveend(map){
    //地图缩放or移动时处理逻辑
    if(mapVue.flightInstance!=''){
        mapVue.drawFlight(mapVue.flightPluginsData());
    }
}
function singleClick(evt){
    debugger;
    var coordinate = evt.coordinate;
    if(mapVue && mapVue.formTest){
        addCoordinate4Vue(coordinate);
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return feature;
    });
}
function addCoordinate4Vue(coordinate){
    let coordsVal = coordinate;
    let valContext = '';
    let cfgs = {
        coordsVal:coordinate[0]+','+coordinate[1]
        // valContext:0,
        // carouselVal:''
    }
    mapVue.formTest.colVals.push(cfgs);
}
function pointerMove(evt,converLayer,featureOverlay,highlight,map){
    var pixel = map.getEventPixel(evt.originalEvent);
    return displayFeatureInfo(pixel,converLayer,featureOverlay,highlight,map);
}


function displayFeatureInfo(pixel,converLayer,featureOverlay,highlight,map){
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
        return feature;
    });
    //非GeoJSON区域不需要高亮显示
    if(converLayer.getSource().hasFeature(feature)){
        if(highlight){
            featureOverlay.getSource().removeFeature(highlight);
            highlight=undefined;
        }
        return highlight;
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
function featureOverlay(map){
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
    return featureOverlay;
}
//设置自定义图层
function setMyStyle(map,jsonAreaCode){

    var mystyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color:jsonAreaCode.bgGround.fillColor,
        }),
        stroke: new ol.style.Stroke({
            color:jsonAreaCode.bgGround.strokeColor,
            width:2
        })
    });

    var converLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: jsonAreaCode.otherMap=='0'?mystyle:null
    });
    this.converLayer = converLayer;
    map.addLayer(converLayer);
    return converLayer;
}
//添加遮罩
function addconver(url,jsonAreaCode) {
    var me = this;
    if(!this.jsonData){
        $.getJSON(url, function(data) {
            this.jsonData = data;
            var fts = new ol.format.GeoJSON().readFeatures(data);
            var index = getAreaGeoJSON(data,jsonAreaCode);
            var ft = fts[index];
            var converGeom = erase(ft.getGeometry());
            var convertFt = new ol.Feature({
                geometry: converGeom
            });
            me.converLayer.getSource().addFeature(convertFt);
        });
    }
}
//获取当前行政区域序号
function getAreaGeoJSON(data,jsonAreaCode){
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
    if(jsonAreaCode.levels=='street'){
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
function addPoint(lng,lat,lableName){
    //医院、居委会(green)、病人(red)
    if(!this.layer){
        return;
    }
    var anchor = new ol.Feature({
        geometry: new ol.geom.Point([lng,lat])
    });
    anchor.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            stroke: new ol.style.Stroke({
                color: '#fff'
            }),
            fill: new ol.style.Fill({
                color: '#3399CC'
            })
        }),
        text: new ol.style.Text({
            //对齐方式
            textAlign: 'center',
            //文本基线
            textBaseline: 'middle',
            //字体样式
            font: 'normal 14px 微软雅黑',
            //文本内容
            text: lableName,
            //填充样式
            fill: new ol.style.Fill({
                color: '#aa3300'
            }),
            //笔触
            stroke: new ol.style.Stroke({
                color: '#2dff51',
                width: 2
            })
        })
    }));
    this.layer.getSource().addFeature(anchor);
    return anchor;
}
function initImage(cfgs){
    var image;
    if(cfgs.iconStatus){
        image = new ol.style.Icon({
            opacity: cfgs.opacity||0.7,
            src: configpre.webGisPath+'static/icon/'+cfgs.iconName+'.'+cfgs.iconType||'jpg'
        });
    }else{
        image=new ol.style.Circle({
            radius: cfgs.radius||4,
            fill: new ol.style.Fill({
                color: cfgs.imageColor||'#3392F4'
            })
        });
    }
    return image;
}
function initFill(cfgs){
    return new ol.style.Fill({ color: cfgs.textFillColor||'#FDF9FE'});
}
function initStroke(cfgs){
    return new ol.style.Stroke({
        color: cfgs.textStrokeColor||'#ffcc33',
        width: cfgs.textStrokeWidth||2
    });
}
function initText(cfgs){
    var textStyle = new ol.style.Text({
        //对齐方式
        textAlign: cfgs.textAlign||'center',
        //文本基线
        textBaseline: cfgs.textBaseline||'middle',
        //字体样式
        font: cfgs.font||'normal 14px 微软雅黑',
        //文本内容
        text: (cfgs.displayNameStatus?cfgs.text||'':'')+'',
        //填充样式
        fill: initFill(cfgs),
    });
    if(cfgs.strokeStatus){
        //笔触
        textStyle['stroke'] = initStroke(cfgs);
    }
    return textStyle;
}
function pointStyle(cfgs){
    return new ol.style.Style({
        image:initImage(cfgs),
        text:initText(cfgs)
    });
}
function addMarksV2(cfgs){
    if(!this.layer){
        return;
    }
    // 创建一个Feature，并设置好在地图上的位置
    var anchor = new ol.Feature({
        geometry: new ol.geom.Point([cfgs.lng,cfgs.lat])
    });
    anchor.setStyle(pointStyle(cfgs));
    this.layer.getSource().addFeature(anchor);
}
/**
 * 添加轮播marks
 * */
function addCarouselMarks(cfgs){
    if(!this.marksLayer){
        return;
    }
    // 创建一个Feature，并设置好在地图上的位置
    var anchor = new ol.Feature({
        geometry: new ol.geom.Point([cfgs.lng,cfgs.lat])
    });
    anchor.setStyle(pointStyle(cfgs));
    this.marksLayer.getSource().addFeature(anchor);
}
function addMarks(lableName,coord,iconName){
    if(!this.layer){
        return;
    }
    // 创建一个Feature，并设置好在地图上的位置
    var anchor = new ol.Feature({
        geometry: new ol.geom.Point([coord.lng,coord.lat])
    });

    // 设置样式，在样式中就可以设置图标
    anchor.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            opacity: 0.7,
            src: 'static/icon/'+iconName+'.jpg'
        }),
        text: new ol.style.Text({
            //对齐方式
            textAlign: 'center',
            //文本基线
            textBaseline: 'middle',
            //字体样式
            font: 'normal 14px 微软雅黑',
            //文本内容
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
    // var layers = this.map.getLayers();
    // 添加到之前的创建的layer中去
    // layers.array_[1].getSource().addFeature(anchor);
    this.layer.getSource().addFeature(anchor);
}
function cleanMarks(type){
    if(!type && this.layer){
        this.layer.getSource().clear();
    }
    if(type && this.marksLayer){
        this.marksLayer.getSource().clear();
    }
    // var layers = this.map.getLayers();
    // layers.array_[1].getSource().clear();
}
function addHotMap(features){
    if(this.hotVector){
        return;
    }
    var heatData = [{
        type: "FeatureCollection",
        features:  features
    }];
    //矢量图层 获取geojson数据
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(heatData[0],{
            dataProjection : 'EPSG:4326',
            featureProjection : 'EPSG:4326'
        })
    });
    // Heatmap热力图
    this.hotVector = new ol.layer.Heatmap({
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
    this.map.addLayer(this.hotVector);
}

function removeHotMap() {
    if(this.loopHotVector){
        this.map.removeLayer(this.loopHotVector);
    }
}

function showHotMap(heatData,config){
    removeHotMap();
    //矢量图层 获取geojson数据
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(heatData,{
            dataProjection : 'EPSG:4326',
            featureProjection : 'EPSG:4326'
        })
    });
    config['source'] = vectorSource;
    config['renderMode'] = 'hotVector';
    this.loopHotVector = new ol.layer.Heatmap(config);
    // this.loopHotVector = new ol.layer.Heatmap({
    //     source: vectorSource,
    //     opacity: [0, 0.8],//透明度
    //     blur: 15,//模糊大小（以像素为单位）,默认15
    //     radius: 13,//半径大小（以像素为单位,默认8
    //     shadow: 150,//阴影像素大小，默认250
    //     gradient:['black','blue','yellow','red'],//设置颜色
    //     //矢量图层的渲染模式：
    //     //'image'：矢量图层呈现为图像。性能出色，但点符号和文本始终随视图一起旋转，像素在缩放动画期间缩放。
    //     //'vector'：矢量图层呈现为矢量。即使在动画期间也能获得最准确的渲染，但性能会降低。
    //     renderMode: 'hotVector'
    // });
    this.map.addLayer(this.loopHotVector);

}
var dataIndex=0;
function loopShowHotMap(heatDatas,config){
    // $('#year').html(heatDatas[dataIndex].date+heatDatas[dataIndex].text+'分布情况');
    showHotMap(heatDatas[dataIndex]);
    dataIndex++;
    if(dataIndex==heatDatas.length){
        dataIndex=0;
    }
}
//113.33347692154348, 23.182488628663123
//113.33340694200002, 23.172157103000025
//113.333413233,      23.182466375999972
//113.33345723599999  23.18250838300003
//113.33134008105844, 23.179395999759436
//开启自定义框定范围
function openDraw(cfgs) {
    var layerStyle = cfgs?cfgs.layerStyle:{};
    var drawStyle = cfgs?cfgs.drawStyle:{};
    if(!this.polygonLayer){
        this.polygonLayer=new ol.layer.Vector({
            source:new ol.source.Vector(),
            /*图形绘制好时最终呈现的样式,显示在地图上的最终图形*/
            style: new ol.style.Style({
                //内边框样式
                fill: new ol.style.Fill({
                    color: layerStyle.fillColor||'blue'
                }),
                //外边框样式
                stroke: new ol.style.Stroke({
                    color: layerStyle.strokeColor||'red',
                    width: layerStyle.strokeWidth||2
                }),
                image: new ol.style.Circle({
                    radius: layerStyle.imageRadius||7,
                    fill: new ol.style.Fill({
                        color: layerStyle.imageColor||'red'
                    })
                })
            })
        })
        this.map.addLayer(this.polygonLayer);
    }
    if(!this.interaction){
        this.interaction = new ol.interaction.Draw({
            source: this.polygonLayer.getSource(),
            type: drawStyle.type||'Circle', //Point 点;LineString 线;Polygon 面;Circle 圆;None 空;
            freehand:false,//是否自由绘制意思是鼠标摁下，移动直接绘制
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    // color: '#ff2feb'
                    color:drawStyle.fillColor||"rgba(72,61,139, 0.4)"
                }),
                stroke: new ol.style.Stroke({
                    color: drawStyle.strokeColor||'rgba(0, 0, 0, 0.5)',
                    lineDash: drawStyle.strokeLineDash||[10, 10],
                    width: drawStyle.strokeWidth||2
                }),
                image: new ol.style.Circle({
                    radius: drawStyle.imageRadius||5,
                    stroke: new ol.style.Stroke({
                        color: drawStyle.imageStrokeColor||'rgba(0, 0, 0, 0.7)'
                        // color: 'yellow'
                    }),
                    fill: new ol.style.Fill({
                        color: drawStyle.imageFillColor||'green'
                    })
                }),
                maxPoints: drawStyle.maxPoints||2
            })
        });
        this.map.addInteraction(this.interaction);
    }
}
function closeDraw(){
    if(this.interaction){
        this.map.removeInteraction(this.interaction);
        this.interaction = null;
    }
    if(this.polygonLayer){
        this.map.removeLayer(this.polygonLayer);
        this.polygonLayer = null;
    }
}
function getPolyRange(){
    var polys = [];
    if(this.polygonLayer){
        var features = this.polygonLayer.getSource().getFeatures();
        features.forEach(item=>{
            var coors = item.getGeometry().getCoordinates();
            for(var i=0,length=coors.length;i<length-2;i++){

            }
        });



    }

}
//规划路线
function addSearcheLayer(features,map){
    this.cleanSearchLayer();
    var vectorSource = new ol.source.Vector({
        features: features
    });
    this.searchVector = new ol.layer.Vector({
        title:'add search layer',
        source: vectorSource,
    });
    map.addLayer(searchVector);
}
function cleanSearchLayer(){
    if(this.searchVector){
        this.searchVector.getSource().clear();
        this.searchVector = null;
    }
}
function setPointStyle(feature,style){
    var name = feature.name;
    name = name?name.substring(0,1):"";
    var featureStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: style.imageRadius||15,
            fill: new ol.style.Fill({
                color:style.imageFillColor||'green'
            })
        }),
        stroke: new ol.style.Stroke({
            color: style.strokeColor||'#8f8f8f',
            width: style.strokeWidth||5,
//          lineDash:[10, 8]
        }),
        text: new ol.style.Text({
            text: name,
            font:"normal 14px 微软雅黑",
            fill: new ol.style.Fill({
                color: style.textFillColor||'white'
            }),
            textAlign:style.textAlign||"center",
            textBaseline:style.textBaseline||"middle"
        })
    });
    feature.setStyle(featureStyle);
}
function setPathStyle(feature,style){
    var status = feature.status;
    var _color = "#8f8f8f";
    if(status==="拥堵")_color="#e20000";
    else if(status==="缓行")_color="#ff7324";
    else if(status==="畅通")_color="#00b514";
    var featureStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: _color,
            width: 5,
//          lineDash:[10, 8]
        })
    });
    feature.setStyle(featureStyle);
}
/**
 * 组装html内容
 * @param pkey地图主键
 */
function htmlCode(pkey){
    let html='<!DOCTYPE html>'
        +'<html lang="en">'
        +'<head>'
        +'    <meta charset="UTF-8">'
        +'    <title>GIS地图</title>'
        +'    <link rel="stylesheet" href="../css/ol.css" type="text/css">'
        +'    <link rel="stylesheet" href="../css/bootstrap.css" type="text/css">'
        +'    <link rel="stylesheet" href="../css/component.css" type="text/css">'
        +'    <link rel="stylesheet" href="../font_third/font-ali/iconfont.css">'
        +'    <link rel="stylesheet" href="../font_third/font-awesome/css/site.css">'
        +'    <link rel="stylesheet" href="../font_third/font-awesome/font-awesome/css/font-awesome.css">'
        +'    <script type="text/javascript" src="../js/ajaxrequestasync.js"></s'+ 'cript>'
        +'    <script type="text/javascript" src="../js/ajaxrequestsync.js"></s'+ 'cript>'
        +'    <script type="text/javascript" src="../js/config.js"></s'+ 'cript>'
        +'    <script src="../js/jquery-2.2.3.min.js"></s'+ 'cript>'
        +'    <script src="../js/bootstrap.js"></s'+ 'cript>'
        +'    <script src="../js/ol.js"></s'+ 'cript>'
        +'    <script src="../js/map.js"></s'+ 'cript>'
        +'    <link rel="stylesheet" href="../css/element.css">'
        +'    <script type="text/javascript" src="../js/vue.min.js"></s'+ 'cript>'
        +'    <script src="../js/element.js"></s'+ 'cript>'
        +'    <script src="../js/component.js"></s'+ 'cript>'
        +'    <script src="../js/heatmap.js"></s'+ 'cript>'
        +'    <script src="../js/flight.js"></s'+ 'cript>'
        +'    <link rel="stylesheet" href="../css/showMap.css">'
        +'</head>'
        +'<body>'
        +'  <div id="app" class="fullScreen" ref="clientScreen">'
        +'      <float-component v-if="floatDialog" :data="floatCompData.items.table" :suffix="floatCompData.suffix" id="floatDialog" class="float_dialog" :style="{top:floatCompData.top+\'px\',left:floatCompData.left+\'px\'}"></float-component>'
        +'      <div id="title" class="title_center">{{mapTitle}}</div>'
        +'      <div id="map" class="fullScreen" ref="mymap"></div>'
        +'      <div class="show_right" title="显示设置" @click="drawer = true"><i class="el-icon-info"></i></div>'
        +'      <el-drawer title="显示设置明细" :visible.sync="drawer" :before-close="handleClose" :size="size">'
        +'          <template><el-tabs v-model="showDataActiveName">'
        +'              <el-tab-pane label="数据绑定" name="model">'
        +'                  <el-row style="text-align: left;font-weight: bold;font-size: 18px;cursor: pointer;"><el-col :span="24"><div @click="choiceModelClick(true)"><icon class="el-icon-connection" style="color: rgb(51, 122, 183);"></icon>&nbsp;&nbsp;{{model.choiceModelName}}</div></el-col></el-row>'
        +'                  <div v-show="!model.modelDataChoice">'
        +'                      <el-row><div @click="choiceModelClick(true)"><el-col :span="24"></el-col><table class="table table-bordered" id="datamodeltable"  style="table-layout: fixed;word-break: break-all;text-align: center"><thead><tr><td width="15%">序号</td><td style="display: none">ID</td><td>名称</td></tr></thead><tbody><tr v-for="(item, index) in model.models" v-cloak  @click="dealModelData(item,$event,true)" style="cursor: pointer"><td>{{index+1}}</td><td style="display: none">{{item.ID}}</td><td>{{item.CN_NAME}}</td></tr></tbody></table></el-col></div></el-row>'
        +'                      <el-row><el-col :span="24"><el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="pageSize" :prev-text="prevText" :next-text="nextText" layout="prev,next,jumper" :total="model.totalCount"></el-pagination></el-col></el-row>'
        +'                  </div>'
        +'                  <div v-show="model.modelDataChoice">'
        +'                      <el-collapse v-model="model.activeDatas">'
        +'                          <el-collapse-item title="散点图" name="1">'
        +'                              <el-row><el-col :span="24"><div style="margin: 5px;text-align: left;font-size: 30px;color: #3a8ee6;"><i title="添加" class="el-icon-circle-plus" @click="openWin(\'1\',\'add\')"></i></div></el-col></el-row>'
        +'                              <el-row><el-table :data="marksHeadData" border style="width: 100%" size="mini" max-height="350"><el-table-column prop="MODEL_RELATION_NAME" label="名称" width="220"></el-table-column><el-table-column label="样式设置"><template slot-scope="scope"><el-button @click="modifyClick(scope.$index,scope.row,\'1\')" type="text" size="small">修改</el-button><el-button @click="delModelRelation(scope.$index,scope.row,\'1\')" type="text" size="small">删除</el-button></template></el-table-column></el-table></el-row>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item title="热力图" name="2">'
        +'                              <el-row><el-col :span="24"><div style="margin: 5px;text-align: left;font-size: 30px;color: #3a8ee6;"><i title="添加" class="el-icon-circle-plus" @click="openWin(\'2\',\'add\')"></i></div></el-col></el-row>'
        +'                              <el-row><el-table :data="hotMapData" border style="width: 100%" size="mini" max-height="350"><el-table-column prop="MODEL_RELATION_NAME" label="名称" width="220"></el-table-column><el-table-column label="样式设置"><template slot-scope="scope"><el-button @click="modifyClick(scope.$index,scope.row,\'2\')" type="text" size="small">修改</el-button><el-button @click="delModelRelation(scope.$index,scope.row,\'2\')" type="text" size="small">删除</el-button></template></el-table-column></el-table></el-row>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item title="标注" name="3">'
        +'                              <el-row><el-col :span="24"><div style="margin: 5px;text-align: left;font-size: 30px;color: #3a8ee6;"><i title="添加" class="el-icon-circle-plus" @click="openWin(\'3\',\'add\')"></i></div></el-col></el-row>'
        +'                              <el-row><el-table :data="lableMapData" border style="width: 100%" size="mini" max-height="350"><el-table-column prop="MODEL_RELATION_NAME" label="名称" width="220"></el-table-column><el-table-column label="样式设置"><template slot-scope="scope"><el-button @click="modifyClick(scope.$index,scope.row,\'3\')" type="text" size="small">修改</el-button><el-button @click="delModelRelation(scope.$index,scope.row,\'3\')" type="text" size="small">删除</el-button></template></el-table-column></el-table></el-row>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item title="飞线图" name="4">'
        +'                              <el-row><el-col :span="24"><div style="margin: 5px;text-align: left;font-size: 30px;color: #3a8ee6;"><i title="添加" class="el-icon-circle-plus" @click="openWin(\'4\',\'add\')"></i></div></el-col></el-row>'
        +'                              <el-row><el-table :data="flightMapData" border style="width: 100%" size="mini" max-height="350"><el-table-column prop="MODEL_RELATION_NAME" label="名称" width="220"></el-table-column><el-table-column label="样式设置"><template slot-scope="scope"><el-button @click="modifyClick(scope.$index,scope.row,\'4\')" type="text" size="small">修改</el-button><el-button @click="delModelRelation(scope.$index,scope.row,\'3\')" type="text" size="small">删除</el-button></template></el-table-column></el-table></el-row>'
        +'                          </el-collapse-item>'
        +'                      </el-collapse>'
        +'                  </div>'
        +'              </el-tab-pane>'
        +'              <el-tab-pane label="数据显示" name="gisModel">'
        +'                  <el-row style="text-align: left;font-weight: bold;font-size: 18px;cursor: pointer;"><el-col :span="24"><div @click="choiceModelClick(false)"><icon class="el-icon-connection" style="color: rgb(51, 122, 183);"></icon>&nbsp;&nbsp;{{showModel.choiceModelName}}</div></el-col></el-row>'
        +'                  <div v-show="!showModel.modelDataChoice"><el-row><div @click="choiceModelClick(false)"><el-col :span="24"><table class="table table-bordered" id="datagismodeltable"  style="table-layout: fixed;word-break: break-all;text-align: center"><thead><tr><td width="15%">序号</td><td style="display: none">ID</td><td>名称</td></tr></thead><tbody><tr v-for="(item, index) in showModel.models" v-cloak  @click="dealModelData(item,$event,false)" style="cursor: pointer"><td>{{index+1}}</td><td style="display: none">{{item.ID}}</td><td>{{item.CN_NAME}}</td></tr></tbody></table></el-col></div></el-row></div>'
        +'                  <div v-show="showModel.modelDataChoice">'
        +'                      <el-collapse v-model="showModel.activeNames">'
        +'                          <el-collapse-item name="1">'
        +'                              <template slot="title"><div class="collapse-title">散点</div></template>'
        +'                              <el-table ref="multipleTable" :data="marksHeadData"  tooltip-effect="dark" border style="width: 100%" size="mini" max-height="350">'
        +'                                  <el-table-column label="名称" width="220"><template slot-scope="scope">{{ scope.row.MODEL_RELATION_NAME }}</template></el-table-column>'
        +'                                  <el-table-column label="操作"><template slot-scope="scope"><el-button @click="showClick(\'1\',scope.row)" type="text" size="small">显示</el-button><el-button @click="dataSettingClick(scope.row)" type="text" size="small">数据过滤</el-button></template></el-table-column>'
        +'                              </el-table>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item name="2">'
        +'                              <template slot="title"><div class="collapse-title">热力</div></template>'
        +'                              <el-table size=\'medium\' :data="hotMapData"  tooltip-effect="dark" border style="width: 100%" size="mini" max-height="350">'
        +'                                  <el-table-column label="名称" width="220"><template slot-scope="scope">{{ scope.row.MODEL_RELATION_NAME }}</template></el-table-column>'
        +'                                  <el-table-column label="操作"><template slot-scope="scope"><el-button @click="showClick(\'2\',scope.row)" type="text" size="small">显示</el-button><el-button @click="dataSettingClick(scope.row)" type="text" size="small">数据过滤</el-button></template></el-table-column>'
        +'                              </el-table>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item name="3">'
        +'                              <template slot="title"><div class="collapse-title">标注</div></template>'
        +'                              <el-table ref="multipleTable3" highlight-current-row :data="lableMapData"  tooltip-effect="dark" border style="width: 100%" size="mini" max-height="350">'
        +'                                  <el-table-column label="名称" width="220"><template slot-scope="scope">{{ scope.row.MODEL_RELATION_NAME }}</template></el-table-column>'
        +'                                  <el-table-column label="操作"><template slot-scope="scope"><el-button @click="showClick(\'3\',scope.row)" type="text" size="small">显示</el-button><el-button @click="dataSettingClick(scope.row)" type="text" size="small">数据过滤</el-button></template></el-table-column>'
        +'                              </el-table>'
        +'                          </el-collapse-item>'
        +'                          <el-collapse-item name="4">'
        +'                              <template slot="title"><div class="collapse-title">飞线</div></template>'
        +'                              <el-table :data="flightMapData" border style="width: 100%" size="mini" max-height="350">'
        +'                                  <el-table-column label="名称" width="220"><template slot-scope="scope">{{ scope.row.MODEL_RELATION_NAME }}</template></el-table-column>'
        +'                                  <el-table-column label="操作"><template slot-scope="scope"><el-button @click="showClick(\'4\',scope.row)" type="text" size="small">显示</el-button><el-button @click="dataSettingClick(scope.row)" type="text" size="small">数据过滤</el-button></template></el-table-column>'
        +'                              </el-table>'
        +'                          </el-collapse-item>'
        +'                      </el-collapse>'
        +'                  </div>'
        +'              </el-tab-pane>'
        +'          </el-tabs></template>'
        +'      </el-drawer>'
        +'      <div class="bottom_right">'
        +'          <div v-for="item in showBottomRight">'
        +'            <el-row v-if="item.isImg" style="margin-top: 5px;">'
        +'                <el-col :span="1">&nbsp;</el-col>'
        +'                <el-col :span="3" style="min-width: 40px;"><img :src="item.imgUrl"/></el-col>'
        +'                <el-col :span="18"><div class="div_middle">{{item.showName}}</div></el-col>'
        +'            </el-row>'
        +'            <el-row v-else style="margin-top: 5px;">'
        +'                <el-col :span="1">&nbsp;</el-col>'
        +'                <el-col :span="3" style="min-width: 40px;"><div class="div_circle" :style="{backgroundColor:item.imageColor}"></div></el-col>'
        +'                <el-col :span="18"><div class="div_middle">{{item.showName}}</div></el-col>'
        +'            </el-row>'
        +'          </div>'
        +'          <div v-else></div>'
        +'      </div>'
        +'      <div class="caroule_marks_right" :style="{bottom:carouleMarksHeight+\'px\'}">'
        +'          <div v-for="item in carouselNames" class="caroule_marks_middel">{{item.carouselName}}</div>'
        +'      </div>'
        +'	<el-dialog :title="dialogDataOperate+title" :visible.sync="dialogDatabing" width="45%">'
        +'	        <el-dialog width="30%" title="样式设定" :visible.sync="innerVisible" append-to-body>'
        +'	            <el-form ref="formMarks" :model="formMarks" lable-width="95">'
        +'	                <el-form-item label="样式选择">'
        +'	                    <el-radio-group v-model="formMarks.styleType">'
        +'	                        <el-radio :label="0">默认</el-radio>'
        +'	                        <el-radio :label="1">自定义</el-radio>'
        +'	                    </el-radio-group>'
        +'	                </el-form-item>'
        +'	                <div v-if="formMarks.styleType==\'1\' && formMarks.dataType!=\'4\'">'
        +'	                    <el-form-item label="显示方式" v-if="formMarks.dataType!=\'1\' && formMarks.dataType!=\'2\'">'
        +'	                        <el-radio-group v-model="formMarks.iconStatus">'
        +'	                            <el-radio :label="0">默认圆点</el-radio>'
        +'	                            <el-radio :label="1">图标</el-radio>'
        +'	                        </el-radio-group>'
        +'	                    </el-form-item>'
        +'	                    <div v-if="formMarks.iconStatus==\'0\'" style="text-align: left;">'
        +'	                        <el-form-item label="原点大小">'
        +'	                            <el-input-number v-model="formMarks.radius" :min="1" :max="100"></el-input-number>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="原点颜色">'
        +'	                            <el-color-picker v-model="formMarks.imageColor"></el-color-picker>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="文字颜色">'
        +'	                            <el-color-picker v-model="formMarks.textFillColor"></el-color-picker>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="阴影颜色">'
        +'	                            <el-color-picker v-model="formMarks.textStrokeColor"></el-color-picker>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="阴影大小">'
        +'	                            <el-input-number v-model="formMarks.textStrokeWidth" :min="1" :max="10"></el-input-number>'
        +'	                        </el-form-item>'
        +'	                    </div>'
        +'	                    <div v-else style="text-align: left;">'
        +'	                        <el-form-item label="图标清单" prop="iconData">'
        +'	                            <el-select v-model="formMarks.iconData" placeholder="请选择图标" @change="iconChangeData">'
        +'	                                <el-option v-for="(item,index) in iconList" :key="index" :label="item.iconNameCn" :value="index"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                    </div>'
        +'	                </div>'
        +'	                <div v-if="formMarks.styleType==\'1\' && formMarks.dataType==\'4\'" style="text-align:left;">'
        +'	                    <el-form-item label="起始色">'
        +'	                        <el-row>'
        +'	                            <el-col :span="9"><el-slider v-model="formMarks.gradient.general.percent" :max="100"></el-slider></el-col>'
        +'	                            <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                            <el-col :span="6"><el-color-picker v-model="formMarks.gradient.general.color" show-alpha></el-color-picker></el-col>'
        +'	                        </el-row>'
        +'	                    </el-form-item>'
        +'	                    <el-form-item label="中间色">'
        +'	                        <el-row>'
        +'	                            <el-col :span="9"><el-slider v-model="formMarks.gradient.warnning.percent" :max="100"></el-slider></el-col>'
        +'	                            <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                            <el-col :span="6"><el-color-picker v-model="formMarks.gradient.warnning.color" show-alpha></el-color-picker></el-col>'
        +'	                        </el-row>'
        +'	                    </el-form-item>'
        +'	                    <el-form-item label="结束色">'
        +'	                        <el-row>'
        +'	                            <el-col :span="9"><el-slider v-model="formMarks.gradient.danger.percent" :max="100"></el-slider></el-col>'
        +'	                            <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                            <el-col :span="6"><el-color-picker v-model="formMarks.gradient.danger.color" show-alpha></el-color-picker></el-col>'
        +'	                        </el-row>'
        +'	                    </el-form-item>'
        +'	                </div>'
        +'	            </el-form>'
        +'	            <div slot="footer" class="dialog-footer">'
        +'	                <el-button @click="innerVisible = false">取 消</el-button>'
        +'	                <el-button type="primary" @click="saveStyleData">保 存</el-button>'
        +'	            </div>'
        +'	        </el-dialog>'
        +'	        <el-dialog width="30%" title="悬浮框设定" :visible.sync="innerFloatVisible" append-to-body :before-close="beforeCloseModelDataFloat">'
        +'	            <el-table ref="multipleFloatTable" :data="floatData" @selection-change="handleFloatSelectionChange" tooltip-effect="dark" border style="width: 100%" size="mini" max-height="320">'
        +'	                <el-table-column type="selection" width="35"></el-table-column>'
        +'	                <el-table-column label="字段">'
        +'	                    <template slot-scope="scope">{{ scope.row.COLUMN_RENAME }}</template>'
        +'	                </el-table-column>'
        +'	                <el-table-column label="数据别名">'
        +'	                    <template slot-scope="scope">'
        +'	                        <el-input size="mini" v-model="scope.row.dataLable"/>'
        +'	                    </template>'
        +'	                </el-table-column>'
        +'	                <el-table-column label="聚合函数">'
        +'	                    <template slot-scope="scope">'
        +'	                        <el-select v-model="scope.row.groupBy" placeholder="请选择字段" size="mini">'
        +'	                            <el-option v-for="item in groupBys" :key="item.key" :label="item.text" :value="item.key"></el-option>'
        +'	                        </el-select>'
        +'	                    </template>'
        +'	                </el-table-column>'
        +'	                <el-table-column label="排序">'
        +'	                    <template slot-scope="scope">'
        +'	                        <el-input size="mini" v-model="scope.row.orderNum"/>'
        +'	                    </template>'
        +'	                </el-table-column>'
        +'	            </el-table>'
        +'	            <div slot="footer" class="dialog-footer">'
        +'	                <el-button @click="doCancle4ModelDataFloat">取 消</el-button>'
        +'	                <el-button type="primary" @click="doSaveModelDataFloat">保 存</el-button>'
        +'	            </div>'
        +'	        </el-dialog>'
        +'	        <div v-if="dialogType==\'1\' || dialogType==\'3\' || dialogType==\'4\'">'
        +'	            <el-container>'
        +'	                <el-aside width="350px">'
        +'	                    <el-form ref="formMarks" :model="formMarks" :rules="dialogRules" label-width="95px">'
        +'	                        <el-form-item :label="title+\'名称\'" prop="name">'
        +'	                            <el-col :span="21"><el-input v-model="formMarks.name" autocomplete="off"></el-input></el-col>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="区域名称" prop="addressCol">'
        +'	                            <el-select v-model="formMarks.addressCol" placeholder="请选择字段" @change="changeRegion">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <template v-if="formMarks.dataType==\'3\'">'
        +'	                            <el-form-item label="区域状态" prop="displayNameStatus">'
        +'	                                <el-switch v-model="formMarks.displayNameStatus" active-color="#13ce66" inactive-color="#ff4949" active-text="显示" inactive-text="不显示"></el-switch>'
        +'	                            </el-form-item>'
        +'	                        </template>'
        +'	                        <el-form-item label="地理位置" prop="coordCol">'
        +'	                            <el-select v-model="formMarks.coordCol" placeholder="请选择字段" @change="changeCoordCol">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="是否轮播" prop="carouselColType" v-if="formMarks.dataType==\'1\' || formMarks.dataType==\'2\'">'
        +'	                            <el-radio-group v-model="formMarks.carouselColType">'
        +'	                                <el-radio :label="0">否</el-radio>'
        +'	                                <el-radio :label="1">是</el-radio>'
        +'	                            </el-radio-group>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="轮播绑定" prop="carouselCol" v-if="(formMarks.dataType==\'1\' || formMarks.dataType==\'2\') && formMarks.carouselColType==\'1\'">'
        +'	                            <el-select v-model="formMarks.carouselCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="值绑定" prop="valCol">'
        +'	                            <el-select v-model="formMarks.valCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in metricColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <template v-if="formMarks.dataType==\'1\'">'
        +'	                            <el-form-item label="值状态" prop="displayNameStatus">'
        +'	                                <el-switch v-model="formMarks.displayNameStatus" active-color="#13ce66" inactive-color="#ff4949" active-text="显示" inactive-text="不显示"></el-switch>'
        +'	                            </el-form-item>'
        +'	                        </template>'
        +'	                        <el-form-item label="渲染方式" prop="hotType" v-if="formMarks.dataType==\'2\'">'
        +'	                            <el-radio-group v-model="formMarks.hotType">'
        +'	                                <el-radio :label="0">个数渲染</el-radio>'
        +'	                                <el-radio :label="1">数值渲染</el-radio>'
        +'	                            </el-radio-group>'
        +'	                        </el-form-item>'
        +'	                        <template v-if="formMarks.dataType==\'4\'">'
        +'	                            <el-form-item label="起止位置" prop="startStop">'
        +'	                                <el-col :span="21"><el-input v-model="formMarks.startStop" autocomplete="off"></el-input></el-col>'
        +'	                            </el-form-item>'
        +'	                        </template>'
        +'	                    </el-form>'
        +'	                </el-aside>'
        +'	                <el-container>'
        +'	                    <el-header>数据绑定</el-header>'
        +'	                    <el-main>'
        +'	                        <div class="show_table_button">'
        +'	                            <el-button @click="openSetStyleDialg(\'much\')" size="mini">批量设置样式</el-button>'
        +'	                            <template v-if="formMarks.dataType==\'3\'">'
        +'	                                <el-button @click="openSetFloatDialog" size="mini">悬浮框设置</el-button>'
        +'	                            </template>'
        +'	                        </div>'
        +'	                        <el-table ref="multipleTable" :data="tableDatas" @selection-change="handleSelectionChange" tooltip-effect="dark" border style="width: 100%" size="mini" max-height="320">'
        +'	                            <el-table-column type="selection" width="35"></el-table-column>'
        +'	                            <el-table-column label="名称">'
        +'	                                <template slot-scope="scope">{{ scope.row.REGION }}</template>'
        +'	                            </el-table-column>'
        +'	                            <el-table-column label="操作">'
        +'	                                <template slot-scope="scope">'
        +'	                                    <el-button size="mini" @click="openSetStyleDialg(\'single\',scope.row)">{{scope.row.STYLE_BUTTON}}</el-button>'
        +'	                                </template>'
        +'	                            </el-table-column>'
        +'	                        </el-table>'
        +'	                    </el-main>'
        +'	                </el-container>'
        +'	            </el-container>'
        +'	        </div>'
        +'	        <div v-else>'
        +'	            <el-form ref="formMarks" :model="formMarks" :rules="dialogRules" label-width="95px">'
        +'	                <el-container>'
        +'	                    <el-aside width="350px">'
        +'	                        <el-form-item :label="title+\'名称\'" prop="name">'
        +'	                            <el-row><el-col :span="20"><el-input v-model="formMarks.name" autocomplete="off"></el-input></el-col></el-row>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="区域绑定" prop="addressCol">'
        +'	                            <el-select v-model="formMarks.addressCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="地理位置" prop="coordCol">'
        +'	                            <el-select v-model="formMarks.coordCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="是否轮播" prop="carouselColType" v-if="formMarks.dataType==\'1\' || formMarks.dataType==\'2\'">'
        +'	                            <el-radio-group v-model="formMarks.carouselColType">'
        +'	                                <el-radio :label="0">否</el-radio>'
        +'	                                <el-radio :label="1">是</el-radio>'
        +'	                            </el-radio-group>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="轮播绑定" prop="carouselCol" v-if="formMarks.dataType==\'1\' || formMarks.dataType==\'2\'">'
        +'	                            <el-select v-model="formMarks.carouselCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in dimensionColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="值绑定" prop="valCol">'
        +'	                            <el-select v-model="formMarks.valCol" placeholder="请选择字段">'
        +'	                                <el-option v-for="item in metricColList" :key="item.COLUMN_NAME" :label="item.COLUMN_RENAME" :value="item.COLUMN_NAME"></el-option>'
        +'	                            </el-select>'
        +'	                        </el-form-item>'
        +'	                        <el-form-item label="渲染方式" prop="hotType" v-if="formMarks.dataType==\'2\'">'
        +'	                            <el-radio-group v-model="formMarks.hotType">'
        +'	                                <el-radio :label="1">数值渲染</el-radio>'
        +'	                                <el-radio :label="0">个数渲染</el-radio>'
        +'	                            </el-radio-group>'
        +'	                        </el-form-item>'
        +'	                    </el-aside>'
        +'	                    <el-container>'
        +'	                        <el-header>{{title}}样式</el-header>'
        +'	                        <el-main>'
        +'	                            <div v-if="formMarks.styleType==\'1\'">'
        +'	                                <el-form-item label="原点大小">'
        +'	                                    <el-input-number v-model="formMarks.radius" :min="1" :max="100"></el-input-number>'
        +'	                                </el-form-item>'
        +'	                                <el-form-item label="透明度" prop="hotOpacity">'
        +'	                                    <el-row><el-col :span="1">&nbsp;</el-col><el-col :span="16"><el-slider v-model="formMarks.hotOpacity" range :max="100"></el-slider></el-col></el-row>'
        +'	                                </el-form-item>'
        +'	                                <el-form-item label="模糊度" prop="hotBlur">'
        +'	                                    <el-row><el-col :span="1">&nbsp;</el-col><el-col :span="16"><el-slider v-model="formMarks.hotBlur" :max="100"></el-slider></el-col></el-row>'
        +'	                                </el-form-item>'
        +'	                                <el-form-item label="颜色梯度" prop="gradient">'
        +'	                                    <el-row>'
        +'	                                        <el-col :span="3">正常</el-col>'
        +'	                                        <el-col :span="9"><el-slider v-model="formMarks.gradient.general.percent" :max="100"></el-slider></el-col>'
        +'	                                        <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                                        <el-col :span="11"><el-color-picker v-model="formMarks.gradient.general.color"></el-color-picker></el-col>'
        +'	                                    </el-row>'
        +'	                                    <el-row>'
        +'	                                        <el-col :span="3">警告</el-col>'
        +'	                                        <el-col :span="9"><el-slider v-model="formMarks.gradient.warnning.percent" :max="100"></el-slider></el-col>'
        +'	                                        <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                                        <el-col :span="11"><el-color-picker v-model="formMarks.gradient.warnning.color"></el-color-picker></el-col>'
        +'	                                    </el-row>'
        +'	                                    <el-row>'
        +'	                                        <el-col :span="3">危险</el-col>'
        +'	                                        <el-col :span="9"><el-slider v-model="formMarks.gradient.danger.percent" :max="100"></el-slider></el-col>'
        +'	                                        <el-col :span="1">&nbsp;</el-input-number></el-col>'
        +'	                                        <el-col :span="11"><el-color-picker v-model="formMarks.gradient.danger.color"></el-color-picker></el-col>'
        +'	                                    </el-row>'
        +'	                                </el-form-item>'
        +'	                            </div>'
        +'	                        </el-main>'
        +'	                    </el-container>'
        +'	                </el-container>'
        +'	            </el-form>'
        +'	        </div>'
        +'	        <div slot="footer" class="dialog-footer">'
        +'	            <el-button @click="dialogDatabing = false">取 消</el-button>'
        +'	            <el-button type="primary" @click="submitDialogForm(\'formMarks\')">确 定</el-button>'
        +'	        </div>'
        +'	    </el-dialog>'
        +'	    <el-dialog title="数据过滤" :visible.sync="filterDialog" width="55%" :close-on-click-modal = "false">'
        +'	        <filter-component :data="filterData" ref="filterCom"></filter-component>'
        +'	        <span slot="footer" class="dialog-footer">'
        +'	            <el-button @click="filterDialog = false">取 消</el-button>'
        +'	            <el-button type="primary" @click="filterDialog = false">确 定</el-button>'
        +'	        </span>'
        +'	    </el-dialog>'
        +'  </div>'
        +'  <script type="text/javascript">'
        +'	var mapVue=  new Vue({'
        +'	        el: \'#app\','
        +'	        data:{'
        +'	            showDataActiveName:\'gisModel\','
        +'	            clientScreenWidth:0,'
        +'	            clientScreenHeight:0,'
        +'	            carouleMarksHeight:0,'
        +'	            size:\'20%\','
        +'	            drawer: false,'
        +'	            styleInfo:\'\','
        +'	            multipleMarksSelection:[],'
        +'	            multipleLableSelection:[],'
        +'	            mapTitle:\'\','
        +'	            showBottomRight:[],'
        +'	            timer:\'\','
        +'	            loopHeatMap:\'\','
        +'	            isCarousel:false,'
        +'	            carouselNames:[],'
        +'	'
        +'	            dimensionColList:[],'
        +'	            metricColList:[],'
        +'	            iconList:[],'
        +'	'
        +'	            dialogType:\'1\','
        +'	            dialogDatabing:false,'
        +'	            dialogDataOperate:\'\','
        +'	            title:\'标注\','
        +'	            formMarks:{'
        +'	                name:\'\','
        +'	                displayNameStatus:true,'
        +'	                addressCol:\'\','
        +'	                coordCol:\'\','
        +'	                carouselColType:0,'
        +'	                carouselCol:\'\','
        +'	                valCol:\'\','
        +'	                styleType:1,'
        +'	                status:\'1\','
        +'	                iconStatus:0,'
        +'	                opacity:0.7,'
        +'	                iconData:\'\','
        +'	                iconName:\'\','
        +'	                iconType:\'\','
        +'	                radius:4,'
        +'	                imageColor:\'#3392F4\','
        +'	                textAlign:\'center\','
        +'	                textBaseline:\'middle\','
        +'	                font:\'normal 14px 微软雅黑\','
        +'	                text:\'\','
        +'	                textFillColor:\'#FDF9FE\','
        +'	                textStrokeColor:\'#ffcc33\','
        +'	                textStrokeWidth:2,'
        +'	                opt:\'add\','
        +'	                MODEL_RELATION_ID:\'\','
        +'	                dataType:\'1\','
        +'	                hotType:1,'
        +'	                hotOpacity:[0,50],'
        +'	                hotBlur:75,'
        +'	                originGradient:{'
        +'	                    general:{percent:0,color:\'rgba(255,50,13,.2)\'},'
        +'	                    warnning:{percent:30,color:\'#2A68FF\'},'
        +'	                    danger:{percent:95,color:\'#FF320D\'}'
        +'	                },'
        +'	                gradient:{'
        +'	                    general:{percent:50,color:\'#081DFF\'},'
        +'	                    warnning:{percent:80,color:\'#FFCC33\'},'
        +'	                    danger:{percent:95,color:\'#FF241C\'}'
        +'	                },'
        +'	                startStop:\'\''
        +'	            },'
        +'	            modifyIndex:-1,'
        +'	'
        +'	            tableDatas:[],'
        +'	            innerVisible:false,'
        +'	            innerFloatVisible:false,'
        +'	            floatData :[{'
        +'	                colName:\'address\','
        +'	                dataLable:\'地址\','
        +'	                groupBy:\'0\','
        +'	                orderNum:1'
        +'	            },{'
        +'	                colName:\'address1\','
        +'	                dataLable:\'地址2\','
        +'	                groupBy:\'0\','
        +'	                orderNum:2'
        +'	            }],'
        +'	            groupBys:[{'
        +'	                key:\'0\','
        +'	                text:\'无\''
        +'	            },{'
        +'	                key:\'1\','
        +'	                text:\'求和\''
        +'	            }],'
        +'	'
        +'	            dialogRules:{'
        +'	                name: ['
        +'	                    { required: true, message: \'请输入名称\', trigger: \'blur\' },'
        +'	                    { min: 3, max: 15, message: \'长度在 3 到 15 个字符\', trigger: \'blur\' }'
        +'	                ],'
        +'	                addressCol:['
        +'	                    { required: true, message: \'请选择地址\', trigger: \'change\' }'
        +'	                ],'
        +'	                coordCol:['
        +'	                    { required: true, message: \'请选择地理位置\', trigger: \'change\' }'
        +'	                ],'
        +'	                carouselCol:['
        +'	                    { required: true, message: \'请绑定轮播字段\', trigger: \'change\' }'
        +'	                ],'
        +'	                valCol:['
        +'	                    { required: true, message: \'请选择值\', trigger: \'change\' }'
        +'	                ],'
        +'	                iconName:['
        +'	                    { required: true, message: \'请选择图标\', trigger: \'change\' }'
        +'	                ]'
        +'	            },'
        +'	'
        +'	            marksHeadData:[],'
        +'	            hotMapData:[],'
        +'	            heatModelRelation:\'\','
        +'	            lableMapData:[],'
        +'	            flightMapData:[],'
        +'	'
        +'	            hotMapRadio:\'\','
        +'	'
        +'	            model:{'
        +'	                activeNames: [\'1\'],'
        +'	                modelDataChoice:false,'
        +'	                choiceModelName:\'请选择数据模型\','
        +'	                models:[],'
        +'	                choiceModelData:\'\','
        +'	'
        +'	            },'
        +'	            currentPage: 1,'
        +'	            totalCount: 0,'
        +'	            prevText: \'上一页\','
        +'	            nextText: \'下一页\','
        +'	            pageSize: 15,'
        +'	            showModel:{'
        +'	                activeNames: [\'1\'],'
        +'	                modelDataChoice:false,'
        +'	                choiceModelName:\'请选择地图模型\','
        +'	                models:[],'
        +'	                choiceModelData:\'\','
        +'	                currentPage: 1,'
        +'	                totalCount: 0'
        +'	            },'
        +'	            colDatas:[],'
        +'	            styleDatas:\'\','
        +'	            saveFloatData:[],'
        +'	            floatDialog:false,'
        +'	            floatCompData:{'
        +'	                suffix:true,'
        +'	                top:0,'
        +'	                left:0,'
        +'	                items:{'
        +'	                    table:[]'
        +'	                }'
        +'	            },'
        +'	            allFloatDialogData:\'\','
        +'	            settingMap:\'\','
        +'	            heatmapInstance:\'\','
        +'	            heatmapData:\'\','
        +'	            flightInstance:\'\','
        +'	            filterDialog:false,'
        +'	            filterData:{modelRelationId:\'\',dataRadio:\'\',dimensionColList:[],metricColList:[]}'
        +'	        },'
        +'	        mounted(){'
        +'	            this.loadGisData(\'POST\',configpre.map_getMapByPkey,{ID:"'+pkey+'"});'
        +'	            this.getHeight();'
        +'	            this.loadModel(\'POST\',configpre.api_loadModels,{pageSize: this.pageSize, pageNo: 1});'
        +'	            this.loadGisModel(\'POST\',configpre.api_loadGisModels);'
        +'	            let me = this;'
        +'	            window.onresize = () => {'
        +'	                return (() => {'
        +'	                    me.mapResize();'
        +'	                })()'
        +'	            }'
        +'	        },'
        +'	        methods:{'
        +'	            getHeight:function(){'
        +'	                this.clientScreenWidth = this.$refs.clientScreen.offsetWidth;'
        +'	                this.clientScreenHeight = this.$refs.clientScreen.offsetHeight;'
        +'	                this.carouleMarksHeight = this.clientScreenHeight/2;'
        +'	                let width = this.$refs.mymap.offsetWidth;'
        +'	                let percent = 384/width;'
        +'	                if(percent>0.2){'
        +'	                    this.size=parseInt(percent*100)+\'%\';'
        +'	                }'
        +'	            },'
        +'	            handleClose:function(done) {'
        +'	                done();'
        +'	            },'
        +'	            loadGisData:function(method,api,data){'
        +'	                var me = this;'
        +'	                var jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        var body = json.body;'
        +'	                        var baseInfo = JSON.parse(body.BASE_INFO);'
        +'	                        var styleInfo = JSON.parse(body.STYLE_INFO);'
        +'	                        me.styleInfo = styleInfo;'
        +'	                        me.mapTitle = body.MAP_NAME;'
        +'	                        var cfgs = baseInfo;'
        +'	                        for(var p in styleInfo){cfgs[p] = styleInfo[p];}'
        +'	                        me.settingMap = initMap(cfgs);'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            loadModelRelationData:function(method,api,data){'
        +'	                var me = this;'
        +'	                var jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\' && json.body){'
        +'	                        me.marksHeadData = json.body.markList||[];'
        +'	                        me.hotMapData = json.body.hotMapList||[];'
        +'	                        me.lableMapData=json.body.lableList||[];'
        +'	                        me.flightMapData = json.body.flightlList||[];'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            toggleSelection:function(){'
        +'	                cleanMarks();'
        +'	                this.$refs.multipleTable.clearSelection();'
        +'	            },'
        +'	            handleSelectionChange:function(val){'
        +'	                this.multipleMarksSelection = val;'
        +'	            },'
        +'	            handleSelectionLableChange:function(val){'
        +'	                this.multipleLableSelection = val;'
        +'	            },'
        +'	            myMessage:function(msg,type) {'
        +'	                this.$message({'
        +'	                    message: msg,'
        +'	                    type: type'
        +'	                });'
        +'	            },'
        +'	            loadTableData:function(method,api,data,type){'
        +'	                let me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\' && json.body){'
        +'	                        let body = json.body;'
        +'	                        me.showData(body,type);'
        +'	                        me.drawer =false;'
        +'	                    }else{'
        +'	                        me.myMessage(\'数据异常\',\'error\');'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            showData:function(body,type){'
        +'	                switch(type){'
        +'	                    case \'1\':'
        +'	                        this.carourselData(body);'
        +'	                        break;'
        +'	                    case \'2\':'
        +'	                        this.carourselHeatMap(body);'
        +'	                        break;'
        +'	                    case \'3\':'
        +'	                        this.cleanMapData();'
        +'	                        if(!body || !body[0] || !body[0].data){'
        +'	                            this.myMessage("无数据","success");'
        +'	                            return;'
        +'	                        }'
        +'	                        this.showNameList(body[0].data);'
        +'	                        body.forEach(item=>{'
        +'	                            let cfgs={};'
        +'	                            let datas = item.data;'
        +'	                            datas.forEach(data=>{'
        +'	                                cfgs = data.style;'
        +'	                                if(typeof(cfgs)==\'string\'){'
        +'	                                    cfgs = JSON.parse(data.style);'
        +'	                                }'
        +'	                                let coords = eval(data.COORDS);'
        +'	                                cfgs[\'lng\']=coords[0];'
        +'	                                cfgs[\'lat\']=coords[1];'
        +'	                                cfgs[\'text\']=data.ADDRESS;'
        +'	                                addMarksV2(cfgs);'
        +'	                            });'
        +'	                        });'
        +'	                        break;'
        +'	                    case \'4\':'
        +'	                        this.initFlightMap(body);'
        +'	                    default:break;'
        +'	                }'
        +'	            },'
        +'	            showNameList:function(data){'
        +'	                this.showBottomRight=[];'
        +'	                if(!data || data.length==0){'
        +'	                    return;'
        +'	                }'
        +'	                data.forEach(item=>{'
        +'	                    let style = item.style;'
        +'	                    if(typeof(style) == "string"){'
        +'	                        style = JSON.parse(style);'
        +'	                    }'
        +'	                    let cfgs = {};'
        +'	                    cfgs[\'showName\'] = item.ADDRESS||style.text;'
        +'	                    let iconStatus = style.iconStatus==\'1\'?true:false;'
        +'	                    cfgs[\'isImg\'] = iconStatus;'
        +'	                    if(iconStatus){'
        +'	                        cfgs[\'imgUrl\'] = configpre.webGisPath+\'static/icon/\'+style.iconName+\'.\'+style.iconType;'
        +'	                    }else{'
        +'	                        cfgs[\'imageColor\'] = style.imageColor;'
        +'	                    }'
        +'	                    this.showBottomRight.push(cfgs);'
        +'	                });'
        +'	            },'
        +'	            carourselData:function(body){'
        +'	                this.cleanMapData();'
        +'	                if(!body){this.myMessage("无数据","error");return;}'
        +'	                this.allFloatDialogData=[];'
        +'	                if(body.length){'
        +'	                    this.showNameList(body[0].data);'
        +'	                    body.forEach(item=>{'
        +'	                        let cfgs;'
        +'	                        let datas = item.data;'
        +'	                        datas.forEach(data=>{'
        +'	                            cfgs = data.style;'
        +'	                            if(typeof(cfgs)==\'string\'){'
        +'	                                cfgs = JSON.parse(cfgs);'
        +'	                            }'
        +'	                            cfgs.radius=data.VAL;'
        +'	                            cfgs.text=data.VAL;'
        +'	                            let coords = eval(data.COORDS);'
        +'	                            cfgs[\'lng\']=coords[0];'
        +'	                            cfgs[\'lat\']=coords[1];'
        +'	                            addMarksV2(cfgs);'
        +'	                        });'
        +'	                    });'
        +'	                    return;'
        +'	                }'
        +'	                if(!body.data || body.data.length==0){this.myMessage("无数据","error");return;}'
        +'	                let bodyData = body.data;'
        +'	                let carouselNames = body.names||[];'
        +'	                let group=[];'
        +'	                for(let p in bodyData){'
        +'	                    group.push(p);'
        +'	                }'
        +'	                let i=0;'
        +'	                this.timer = setInterval(carourselFn,1000);'
        +'	                function carourselFn(){'
        +'	                    cleanMarks(true);'
        +'	                    mapVue.carouselNames=[];'
        +'	                    let el = group[i];'
        +'	                    carouselNames.forEach(item=>{'
        +'	                        let cfgs = {'
        +'	                            carouselName:el+item'
        +'	                        };'
        +'	                        mapVue.carouselNames.push(cfgs);'
        +'	                    });'
        +'	                    let data = bodyData[el]||[];'
        +'	                    mapVue.showNameList(data[0].data);'
        +'	                    data.forEach(item=>{'
        +'	                        let itemData = item.data;'
        +'	                        let cfgs = {};'
        +'	                        itemData.forEach(sItem=>{'
        +'	                            cfgs = sItem.style;'
        +'	                            if(typeof(sItem.style)==\'string\'){'
        +'	                                cfgs = JSON.parse(cfgs);'
        +'	                            }'
        +'	                            let coords = eval(sItem.COORDS);'
        +'	                            cfgs[\'lng\']=coords[0];'
        +'	                            cfgs[\'lat\']=coords[1];'
        +'	                            cfgs[\'text\']=\'\'+sItem.VAL;'
        +'	                            cfgs.radius=sItem.VAL;'
        +'	                            addCarouselMarks(cfgs);'
        +'	                        });'
        +'	                    });'
        +'	                    if(i==group.length-1){'
        +'	                        i=0;'
        +'	                    }else{'
        +'	                        i++'
        +'	                    }'
        +'	                }'
        +'	            },'
        +'	            initFlightMap:function(body){'
        +'	                this.cleanMapData();'
        +'	                if(!body || body.length==0 || !body[0].data ||  body[0].data.length==0){this.myMessage("无数据","error");}'
        +'	                if(!this.flightInstance){'
        +'	                    this.flightInstance = this.createFlight();'
        +'	                }'
        +'	                this.flightData = body[0].data;'
        +'	                this.showNameList(this.flightData);'
        +'	                this.drawFlight(this.flightPluginsData());'
        +'	            },'
        +'	            createFlight:function(){'
        +'	                let ele = $(".ol-viewport")[0];'
        +'	                let canvas = document.createElement(\'canvas\');'
        +'	                ele.appendChild(canvas);'
        +'	                let flightInstance = canvas.getContext(\'2d\');'
        +'	                canvas.style.cssText = \'position:absolute;left:0;top:0;\';'
        +'	                var computed = getComputedStyle(ele) || {};'
        +'	                canvas.className = \'flightMap-canvas\';'
        +'	                canvas.width=computed.width.replace(/px/,\'\');'
        +'	                canvas.height=computed.height.replace(/px/,\'\');'
        +'	                return flightInstance;'
        +'	            },'
        +'	            drawFlight:function(data){'
        +'	                getPoint(data);'
        +'	                let flightData = {'
        +'	                    ctx:this.flightInstance,'
        +'	                    data:{'
        +'	                        percent:0,'
        +'	                        rate:0.5,'
        +'	                        width:this.clientScreenWidth*10,'
        +'	                        height:this.clientScreenHeight*10,'
        +'	                        curves:data'
        +'	                    }'
        +'	                };'
        +'	                cleanFlight(this.flightInstance);'
        +'	                initFlight(flightData);'
        +'	            },'
        +'	            flightPluginsData:function(){'
        +'	                let data = this.flightData;'
        +'	                let datas = [];'
        +'	                let endPoint;'
        +'	                if(this.formMarks.startStop && this.formMarks.startStop!=\'\'){'
        +'	                    endPoint = this.settingMap.getPixelFromCoordinate(eval(\'[\'+this.formMarks.startStop+\']\'));'
        +'	                }'
        +'	                for(let i=0,length=data.length;i<length;i++){'
        +'	                    let style = data[i].style;'
        +'	                    if(typeof (style)==\'string\'){'
        +'	                        style = JSON.parse(style);'
        +'	                    }'
        +'	                    if(!endPoint){'
        +'	                        endPoint = this.settingMap.getPixelFromCoordinate(eval(\'[\'+style.startStop+\']\'));'
        +'	                    }'
        +'	                    let beginPoint =this.settingMap.getPixelFromCoordinate(eval(data[i].COORDS));'
        +'	                    let item = {'
        +'	                        start: beginPoint,'
        +'	                        end: endPoint,'
        +'	                        gradient:style.gradient'
        +'	                    };'
        +'	                    addMiddelPoint(item);'
        +'	                    datas.push(item);'
        +'	                }'
        +'	                return datas;'
        +'	            },'
        +'	            carourselHeatMap:function(body){'
        +'	                this.cleanMapData();'
        +'	                if(!body || !body.heatData){this.myMessage(\'无数据\',\'success\');return;}'
        +'	                let style = body.style;'
        +'	                if(typeof(style) == "string"){'
        +'	                    style = JSON.parse(body.style);'
        +'	                }'
        +'	                this.showNameList([{style:style}]);'
        +'	                if(style.hotType==\'0\'){'
        +'	                    this.olOriginalHeatMap(body,style);'
        +'	                }else{'
        +'	                    this.heatmapPlugins(body,style);'
        +'	                }'
        +'	            },'
        +'	            olOriginalHeatMap:function(body,style){'
        +'	                let gradient,opacity;'
        +'	                if(style.gradient){'
        +'	                    gradient = [\'black\'];'
        +'	                    gradient.push(style.gradient.general.color);'
        +'	                    gradient.push(style.gradient.warnning.color);'
        +'	                    gradient.push(style.gradient.danger.color);'
        +'	                }'
        +'	                if(style.hotOpacity){'
        +'	                    opacity = [style.hotOpacity[0]/100,style.hotOpacity[1]/100];'
        +'	                }'
        +'	                let config = {'
        +'	                    opacity: opacity || [0, 0.8],'
        +'	                    blur: style.hotBlur || 15,'
        +'	                    radius: style.radius || 13,'
        +'	                    shadow: 150,'
        +'	                    gradient:gradient || [\'black\',\'blue\',\'yellow\',\'red\'],'
        +'	                };'
        +'	                if(style.carouselColType && style.carouselColType==\'1\'){'
        +'	                    let dataIndex=0;'
        +'	                    this.loopHeatMap = setInterval(loopShowHotMapFn,2000);'
        +'	                    function loopShowHotMapFn(){'
        +'	                        let heatDatas = body.heatData;'
        +'	                        showHotMap(heatDatas[dataIndex],config);'
        +'	                        dataIndex++;'
        +'	                        if(dataIndex==heatDatas.length){'
        +'	                            dataIndex=0;'
        +'	                        }'
        +'	                    }'
        +'	                }else{'
        +'	                    loopShowHotMap(body.heatData,config);'
        +'	                }'
        +'	            },'
        +'	            heatmapPlugins:function(body,style){'
        +'	                if(body.heatData.length==0){'
        +'	                    return;'
        +'	                }'
        +'	                let gradient,maxOpacity,minOpacity,blur;'
        +'	                if(style.gradient){'
        +'	                    gradient = {};'
        +'	                    gradient[style.gradient.general.percent/100] = style.gradient.general.color;'
        +'	                    gradient[style.gradient.warnning.percent/100] = style.gradient.warnning.color;'
        +'	                    gradient[style.gradient.danger.percent/100] = style.gradient.danger.color;'
        +'	                }'
        +'	                if(style.hotOpacity){'
        +'	                    minOpacity = style.hotOpacity[0]/100;'
        +'	                    maxOpacity = style.hotOpacity[1]/100;'
        +'	                }'
        +'	                if(style.hotBlur){'
        +'	                    blur = style.hotBlur/100;'
        +'	                }'
        +'	                this.heatConfig = {'
        +'	                    container: $(".ol-viewport")[0],'
        +'	                    radius: style.radius||20,'
        +'	                    maxOpacity: maxOpacity || .5,'
        +'	                    minOpacity: minOpacity || 0,'
        +'	                    blur: blur || .75,'
        +'	                    gradient:gradient || {'
        +'	                        \'0.5\': \'blue\','
        +'	                        \'0.8\': \'yellow\','
        +'	                        \'0.95\': \'red\''
        +'	                    }'
        +'	                };'
        +'	                if(this.heatmapInstance == \'\'){'
        +'	                    this.heatmapInstance = h337.create(this.heatConfig);'
        +'	                }'
        +'	                let heatmapData = {'
        +'	                    max: body.maxVal || 20,'
        +'	                    min: 0,'
        +'	                    data: []'
        +'	                };'
        +'	                if(style.carouselColType && style.carouselColType==\'1\'){'
        +'	                    let dataIndex=0;'
        +'	                    let me = this;'
        +'	                    this.loopHeatMap = setInterval(loopShowHotMapFn,2000);'
        +'	                    function loopShowHotMapFn(){'
        +'	                        let features = body.heatData[dataIndex].features;'
        +'	                        me.carouselNames=[{carouselName:body.heatData[dataIndex].carouselCol+body.heatData[dataIndex].text}];'
        +'	                        heatmapData[\'data\'] = me.heatmapPluginsData(features);'
        +'	                        me.heatmapData = {data:features,max:heatmapData.max,min:heatmapData.min};'
        +'	                        me.setHeatMapData(heatmapData);'
        +'	                        dataIndex++;'
        +'	                        if(dataIndex==body.heatData.length){'
        +'	                            dataIndex=0;'
        +'	                        }'
        +'	                    }'
        +'	                }else{'
        +'	                    let features = body.heatData[body.heatData.length-1].features;'
        +'	                    this.heatmapData = {data:features,max:heatmapData.max,min:heatmapData.min};'
        +'	                    heatmapData[\'data\'] = this.heatmapPluginsData(features);'
        +'	                    this.setHeatMapData(heatmapData);'
        +'	                }'
        +'	            },'
        +'	            heatmapPluginsData:function(data){'
        +'	                let datas = [];'
        +'	                for(let i=0,length=data.length;i<length;i++){'
        +'	                    let xy =this.settingMap.getPixelFromCoordinate(data[i].coordinates);'
        +'	                    if(i==0){'
        +'	                        let x = parseInt(xy[0]);'
        +'	                        let y = parseInt(xy[1]);'
        +'	                        xy = [x,y]'
        +'	                    }'
        +'	                    var dataPoint = {'
        +'	                        x: xy[0],'
        +'	                        y: xy[1],'
        +'	                        value: data[i].count'
        +'	                    };'
        +'	                    datas.push(dataPoint);'
        +'	                }'
        +'	                return datas;'
        +'	            },'
        +'	            setHeatMapData:function(data){'
        +'	                this.heatmapInstance.setData(data);'
        +'	            },'
        +'	            cleanMapData:function(){'
        +'	                cleanMarks();'
        +'	                cleanMarks(true);'
        +'	                this.cleanLoopHearMap();'
        +'	                this.closeCarourse();'
        +'	                this.cleanDeepFlight();'
        +'	            },'
        +'	            cleanDeepFlight:function(){'
        +'	                if(this.flightInstance){'
        +'	                    cleanFlight(this.flightInstance);'
        +'	                    $(\'.flightMap-canvas\').remove();'
        +'	                }'
        +'	                this.flightInstance = \'\';'
        +'	                this.flightData=[];'
        +'	            },'
        +'	            cleanLoopHearMap:function(){'
        +'	                if(this.loopHeatMap){'
        +'	                    clearInterval(this.loopHeatMap);'
        +'	                    this.loopHeatMap = undefined;'
        +'	                }'
        +'	                removeHotMap();'
        +'	                this.removeHeatMap();'
        +'	            },'
        +'	            removeHeatMap:function(){'
        +'	                $(\'.heatmap-canvas\').remove();'
        +'	                this.heatmapInstance=\'\';'
        +'	                this.heatConfig={};'
        +'	            },'
        +'	            closeCarourse:function(){'
        +'	                clearInterval(this.timer);'
        +'	                this.timer = undefined;'
        +'	            },'
        +'	            closeCarourse:function(){'
        +'	                clearInterval(this.timer);'
        +'	                this.timer = undefined;'
        +'	            },'
        +'	            choiceModelClick:function(type){'
        +'	                if(type){'
        +'	                    if(this.model.choiceModelData==\'\'){'
        +'	                        this.myMessage(\'请选择数据模型\',\'warnning\');'
        +'	                        return;'
        +'	                    }'
        +'	                    this.model.modelDataChoice = !this.model.modelDataChoice;'
        +'	                }else{'
        +'	                    if(this.showModel.choiceModelData==\'\'){'
        +'	                        this.myMessage(\'请选择地图模型\',\'warnning\');'
        +'	                        return;'
        +'	                    }'
        +'	                    this.showModel.modelDataChoice = !this.showModel.modelDataChoice;'
        +'	                }'
        +'	            },'
        +'	            handleCurrentChange(val) {'
        +'	                this.loadModel(\'POST\',configpre.api_loadModels,{pageSize: this.pageSize, pageNo: val || 1});'
        +'	            },'
        +'	            dealModelData: function (item, event,isModel) {'
        +'	                let element;'
        +'	                if(isModel){'
        +'	                    element = \'#datamodeltable tr\';'
        +'	                    this.model.choiceModelData = item;'
        +'	                    this.model.choiceModelName = \'已选中模型:\'+item.CN_NAME;'
        +'	                }else{'
        +'	                    element = \'#datagismodeltable tr\';'
        +'	                    this.showModel.choiceModelData = item;'
        +'	                    this.showModel.choiceModelName = \'已选中地图模型:\'+item.CN_NAME;'
        +'	                }'
        +'	                if (event) {'
        +'	                    var el = event.currentTarget;'
        +'	                    $(element).removeClass(\'row_background\');'
        +'	                    $(el).addClass(\'row_background\');'
        +'	                }'
        +'	                let data = {'
        +'	                    tableName:item.EN_NAME'
        +'	                };'
        +'	                this.loadModelRelationData(\'POST\',configpre.map_loadModelRelation,data);'
        +'	            },'
        +'	            loadGisModel:function(method,api,data){'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        me.showModel.models =json.body || [];'
        +'	                        me.showModel.totalCount = json.totalCount;'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            loadModel:function(method,api,data){'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        me.model.models =json.body || [];'
        +'	                        me.model.totalCount = json.totalCount;'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            dataSettingClick:function(row,type){'
        +'	                if(this.$refs.filterCom){this.$refs.filterCom.initParams();}'
        +'	                this.filterDialog=true;'
        +'	                let params = {MODEL_ID: row.MODEL_ID,TABLE_NAME: row.TABLE_NAME};'
        +'	                this.loadModelColumnData(\'POST\',configpre.api_loadColsByTableNameAndModleId,params);'
        +'	                this.filterData[\'modelRelationId\'] = row.MODEL_RELATION_ID;'
        +'	                this.filterData[\'dataRadio\'] = \'\';'
        +'	            },'
        +'	            getCurrentRow(scope) {'
        +'	                this.hotMapRadio=scope.row.MODEL_RELATION_ID;'
        +'	                this.heatModelRelation = scope.row;'
        +'	            },'
        +'	            initFormStyle:function(row){'
        +'	                let styleData = row.MODEL_STYLE_DATA;'
        +'	                if(typeof(row.MODEL_STYLE_DATA) == "string"){'
        +'	                    styleData = JSON.parse(row.MODEL_STYLE_DATA);'
        +'	                }'
        +'	                for(let p in styleData){'
        +'	                    this.formMarks[p] = styleData[p];'
        +'	                }'
        +'	            },'
        +'	            showClick:function(type,row){'
        +'	                this.initFormStyle(row);'
        +'	                let params = {modelRelation:[row]};'
        +'	                let apiPath = configpre.map_queryTableDataByGisModelRelationV2;'
        +'	                this.allFloatDialogData=[];'
        +'	                switch (type){'
        +'	                    case \'1\':'
        +'	                        break;'
        +'	                    case \'2\':'
        +'	                        apiPath = configpre.map_queryHeatMapDataByGisModelRelation;'
        +'	                        break;'
        +'	                    case \'3\':'
        +'	                        this.loadDialogDataByRelation(row);'
        +'	                        break;'
        +'	                }'
        +'	                if(this.checkCarousel(params.modelRelation)){'
        +'	                    params[\'isCarousel\'] = true;'
        +'	                }'
        +'	                this.loadTableData(\'POST\',apiPath,params,type);'
        +'	            },'
        +'	            loadDialogDataByRelation:function(row){'
        +'	                let data = {'
        +'	                    DATA_MODEL_ID:row.MODEL_ID,'
        +'	                    TABLE_NAME:row.TABLE_NAME,'
        +'	                    COORDS:row.RELATION_DIM_COOR'
        +'	                };'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(\'POST\',configpre.map_loadFloatDialogByRelation,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        me.allFloatDialogData = json.body ||\'\';'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            rquestParams:function(method,api,data){'
        +'	                var jsonDataList={'
        +'	                    httpMethod:method,'
        +'	                    url:api,'
        +'	                    data:data?JSON.stringify(data):\'\''
        +'	                };'
        +'	                return jsonDataList;'
        +'	            },'
        +'	            checkCarousel:function(modelRelations){'
        +'	                this.showBottomRight=[];'
        +'	                this.carouselNames=[];'
        +'	                let isCarousel = true;'
        +'	                for(let i=0,len=modelRelations.length;i<len;i++){'
        +'	                    let style = modelRelations[i].MODEL_STYLE_DATA;'
        +'	                    if(typeof(style) == "string"){'
        +'	                        style = JSON.parse(modelRelations[i].MODEL_STYLE_DATA);'
        +'	                    }'
        +'	                    if(isCarousel && typeof(style.carouselColType)!=\'undefined\' && style.carouselColType==\'0\'){'
        +'	                        isCarousel = false;'
        +'	                    }'
        +'	                }'
        +'	                return isCarousel;'
        +'	            },'
        +'	            delModelRelation:function(index,row){'
        +'	                row[\'STATUS\'] =\'0\';'
        +'	                this.formMarks.opt=\'delete\';'
        +'	                this.saveMarksData(row,index);'
        +'	            },'
        +'	            modifyClick:function(index, row,type){'
        +'	                this.modifyIndex=index;'
        +'	                this.modelRadioEnName = row.TABLE_NAME;'
        +'	                this.modelRadio = row.MODEL_ID;'
        +'	                this.openWin(type,\'modify\',row);'
        +'	            },'
        +'	            initDialogParam:function(init){'
        +'	                if(init){'
        +'	                    this.modelRadio=\'\';'
        +'	                    this.modelRadioEnName = \'\';'
        +'	                    this.tableDatas=[];'
        +'	                }'
        +'	                this.modifyIndex=-1;'
        +'	                this.dimensionColList=[];'
        +'	                this.metricColList=[];'
        +'	                this.formMarks.name=\'\';'
        +'	                this.formMarks.displayNameStatus=true;'
        +'	                this.formMarks.addressCol=\'\';'
        +'	                this.formMarks.coordCol=\'\';'
        +'	                this.formMarks.carouselCol=\'\';'
        +'	                this.formMarks.carouselColType=0;'
        +'	                this.formMarks.hotType=1;'
        +'	                this.formMarks.valCol=\'\';'
        +'	                this.formMarks.styleType=0;'
        +'	                this.formMarks.status=\'1\';'
        +'	                this.formMarks.iconStatus=0;'
        +'	                this.formMarks.opacity=0.7;'
        +'	                this.formMarks.iconData=\'\';'
        +'	                this.formMarks.iconName=\'disease\';'
        +'	                this.formMarks.iconType=\'jpg\';'
        +'	                this.formMarks.radius=4;'
        +'	                this.formMarks.imageColor=\'#3392F4\';'
        +'	                this.formMarks.textAlign=\'center\';'
        +'	                this.formMarks.textBaseline=\'middle\';'
        +'	                this.formMarks.font=\'normal 14px 微软雅黑\';'
        +'	                this.formMarks.text=\'\';'
        +'	                this.formMarks.textFillColor=\'#FDF9FE\';'
        +'	                this.formMarks.textStrokeColor=\'#ffcc33\';'
        +'	                this.formMarks.textStrokeWidth=2;'
        +'	                this.formMarks.opt=\'add\';'
        +'	                this.formMarks.hotOpacity = [0,50];'
        +'	                this.formMarks.hotBlur = 75;'
        +'	                this.formMarks.gradient = this.formMarks.originGradient;'
        +'	                this.startStop = \'\';'
        +'	            },'
        +'	            numToTypeName:function(optType){'
        +'	                let typeName;'
        +'	                switch (optType){'
        +'	                    case \'add\':typeName=\'新增\';break;'
        +'	                    case \'modify\':typeName=\'修改\';break;'
        +'	                    case \'delete\':typeName=\'删除\';break;'
        +'	                    case \'view\':typeName=\'查看\';break;'
        +'	                    default:typeName=\'新增\';break;'
        +'	                }'
        +'	                return typeName;'
        +'	            },'
        +'	            numToTitle:function(dataType){'
        +'	                let title;'
        +'	                switch (dataType){'
        +'	                    case \'1\':title=\'散点图\';break;'
        +'	                    case \'2\':title=\'热力图\';break;'
        +'	                    case \'3\':title=\'标注\';break;'
        +'	                    case \'4\':title=\'轮播图\';break;'
        +'	                    default:title=\'散点图\';break;'
        +'	                }'
        +'	                return title;'
        +'	            },'
        +'	            openWin:function(dataType,optType,row){'
        +'	                this.dialogType = dataType;'
        +'	                this.dialogDatabing = true;'
        +'	                this.dialogDataOperate = this.numToTypeName(optType);'
        +'	                this.title = this.numToTitle(dataType);'
        +'	                this.formMarks.dataType=dataType;'
        +'	                this.formMarks.status=\'1\';'
        +'	                this.formMarks.opt=optType;'
        +'	                if(optType==\'add\'){'
        +'	                    if(dataType==\'2\'){'
        +'	                    }'
        +'	                    this.initDialogParam(true);'
        +'	                    this.modelChange(this.model.choiceModelData.ID,this.model.choiceModelData.EN_NAME);'
        +'	                }else if(optType==\'modify\'){'
        +'	                    this.changeRegion(row.RELATION_DIM_ADDRESS);'
        +'	                    let params = {'
        +'	                        MODEL_ID: row.MODEL_ID,'
        +'	                        TABLE_NAME: row.TABLE_NAME'
        +'	                    };'
        +'	                    this.loadModelColumnData(\'POST\',configpre.api_loadColsByTableNameAndModleId,params,row.RELATION_DIM_COOR);'
        +'	                    this.formMarks.name=row.MODEL_RELATION_NAME;'
        +'	                    this.formMarks.addressCol=row.RELATION_DIM_ADDRESS;'
        +'	                    this.formMarks.coordCol=row.RELATION_DIM_COOR;'
        +'	                    this.formMarks.carouselCol=row.RELATION_DIM_CAROUSEL;'
        +'	                    this.formMarks.valCol=row.RELATION_MEASURE_VAL;'
        +'	                    this.formMarks.MODEL_RELATION_ID=row.MODEL_RELATION_ID;'
        +'	                    this.initFormStyle(row);'
        +'	                }'
        +'	            },'
        +'	            modelChange:function(modelId,tableName){'
        +'	                this.initDialogParam();'
        +'	                this.modelRadioEnName = tableName;'
        +'	                this.modelRadio = modelId;'
        +'	                let params = {'
        +'	                    MODEL_ID: modelId,'
        +'	                    TABLE_NAME: tableName'
        +'	                };'
        +'	                this.loadModelColumnData(\'POST\',configpre.api_loadColsByTableNameAndModleId,params);'
        +'	            },'
        +'	            loadModelColumnData:function(method,api,data,floatCol){'
        +'	                let me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\' && json.body){'
        +'	                        let body = json.body;'
        +'	                        me.dimensionColList = body.dimensionColList ||[];'
        +'	                        me.metricColList = body.metricColList ||[];'
        +'	                        me.filterData.dimensionColList=body.dimensionColList || [];'
        +'	                        me.filterData.metricColList=body.metricColList || [];'
        +'	                        if(floatCol){'
        +'	                            me.changeCoordCol(floatCol);'
        +'	                        }'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            changeCoordCol:function(colName){'
        +'	                if(!this.modelRadio || this.modelRadio==\'\' || !this.modelRadioEnName || this.modelRadioEnName==\'\'){'
        +'	                    this.myMessage(\'请选择数据模型\',\'warnning\');'
        +'	                    return;'
        +'	                }'
        +'	                if(this.formMarks.dataType==\'3\'){'
        +'	                    let data = {'
        +'	                        modelId:this.modelRadio,'
        +'	                        tableName:this.modelRadioEnName,'
        +'	                        coords:colName'
        +'	                    };'
        +'	                    this.loadFloatData(\'POST\',configpre.map_loadModelDataFloat,data);'
        +'	                }'
        +'	            },'
        +'	            loadFloatData:function(method,api,data){'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        me.floatData = json.body||[];'
        +'	                        let allCols = me.dimensionColList.concat(me.metricColList);'
        +'	                        let newFloatData = [];'
        +'	                        allCols.forEach(item=>{'
        +'	                            let cfg = {'
        +'	                                colName:item.COLUMN_NAME,'
        +'	                                COLUMN_RENAME:item.COLUMN_RENAME,'
        +'	                                dataLable:item.COLUMN_RENAME,'
        +'	                                groupBy:\'0\','
        +'	                            };'
        +'	                            me.floatData.forEach(el=>{'
        +'	                                if(el.COL_NAME==item.COLUMN_NAME){'
        +'	                                    cfg.dataLable = el.DATA_LABLE;'
        +'	                                    cfg.groupBy = el.GROUP_BY;'
        +'	                                    cfg[\'orderNum\'] = el.ORDER_NUM;'
        +'	                                }'
        +'	                            });'
        +'	                            newFloatData.push(cfg);'
        +'	                        });'
        +'	                        me.floatData = newFloatData;'
        +'	                    }else{'
        +'	                        me.myMessage(\'加载悬浮框数据异常\',\'error\');'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            saveStyleData:function(){'
        +'	                let params=[];'
        +'	                this.colDatas.forEach(item=>{'
        +'	                    let cfgs = {'
        +'	                        modelId:this.modelRadio,'
        +'	                        tableName:this.modelRadioEnName,'
        +'	                        colName:this.formMarks.addressCol,'
        +'	                        colData:item.REGION,'
        +'	                        mapType:this.formMarks.dataType,'
        +'	                        status:\'1\''
        +'	                    };'
        +'	                    let style ={'
        +'	                        carouselColType:this.formMarks.carouselColType,'
        +'	                        displayNameStatus:this.formMarks.displayNameStatus,'
        +'	                        styleType:this.formMarks.styleType,'
        +'	                        status:this.formMarks.status,'
        +'	                        iconStatus:this.formMarks.iconStatus,'
        +'	                        opacity:this.formMarks.opacity,'
        +'	                        iconData:this.formMarks.iconData,'
        +'	                        iconName:this.formMarks.iconName,'
        +'	                        iconType:this.formMarks.iconType,'
        +'	                        radius:this.formMarks.radius,'
        +'	                        imageColor:this.formMarks.imageColor,'
        +'	                        textAlign:this.formMarks.textAlign,'
        +'	                        textBaseline:this.formMarks.textBaseline,'
        +'	                        font:this.formMarks.font,'
        +'	                        text:item.REGION,'
        +'	                        textFillColor:this.formMarks.textFillColor,'
        +'	                        textStrokeColor:this.formMarks.textStrokeColor,'
        +'	                        textStrokeWidth:this.formMarks.textStrokeWidth,'
        +'	                        gradient:this.formMarks.gradient'
        +'	                    };'
        +'	                    cfgs[\'styleData\'] = style;'
        +'	                    params.push(cfgs);'
        +'	                });'
        +'	                if(params.length>0){'
        +'	                    const me = this;'
        +'	                    let jsonDataList = this.rquestParams(\'POST\',configpre.map_saveModelStyle,{data:params});'
        +'	                    ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                        if(code==\'200\'){'
        +'	                            me.innerVisible = false;'
        +'	                            params.forEach(item=>{'
        +'	                                let key = me.formMarks.addressCol+\'-\'+item.colData;'
        +'	                                me.styleDatas[key] = item.styleData;'
        +'	                            });'
        +'	                            let len = me.tableDatas.length;'
        +'	                            if(me.styleDatas!=\'\' && len>0){'
        +'	                                for(let i=0;i<len;i++){'
        +'	                                    let key = me.formMarks.addressCol+\'-\'+me.tableDatas[i].REGION;'
        +'	                                    if(me.styleDatas[key]){'
        +'	                                        me.tableDatas[i].STYLE_BUTTON=\'已设定\';'
        +'	                                    }else{'
        +'	                                        me.tableDatas[i].STYLE_BUTTON=\'样式设定\';'
        +'	                                    }'
        +'	                                }'
        +'	                            }'
        +'	                            me.initStyle();'
        +'	                            me.myMessage(\'保存成功\',\'success\');'
        +'	                        }else{'
        +'	                            me.myMessage(\'系统异常，请联系管理员\',\'error\');'
        +'	                        }'
        +'	                    });'
        +'	                }'
        +'	            },'
        +'	            initStyle:function(style){'
        +'	                if(style){'
        +'	                    for(let p in style){'
        +'	                        if(p!=\'carouselColType\' || p!=\'displayNameStatus\'){'
        +'	                            this.formMarks[p] = style[p];'
        +'	                        }'
        +'	                    }'
        +'	                }else{'
        +'	                    this.formMarks.styleType=1;'
        +'	                    this.formMarks.status=\'1\';'
        +'	                    this.formMarks.iconStatus=0;'
        +'	                    this.formMarks.opacity=0.7;'
        +'	                    this.formMarks.iconData=\'\';'
        +'	                    this.formMarks.iconName=\'\';'
        +'	                    this.formMarks.iconType=\'\';'
        +'	                    this.formMarks.radius=4;'
        +'	                    this.formMarks.imageColor=\'#3392F4\';'
        +'	                    this.formMarks.textAlign=\'center\';'
        +'	                    this.formMarks.textBaseline=\'middle\';'
        +'	                    this.formMarks.font=\'normal 14px 微软雅黑\';'
        +'	                    this.formMarks.text=\'\';'
        +'	                    this.formMarks.textFillColor=\'#FDF9FE\';'
        +'	                    this.formMarks.textStrokeColor=\'#ffcc33\';'
        +'	                    this.formMarks.textStrokeWidth=2;'
        +'	                    this.formMarks.gradient=JSON.parse(JSON.stringify(this.formMarks.originGradient));'
        +'	                }'
        +'	            },'
        +'	            beforeCloseModelDataFloat:function(done){'
        +'	                this.cleanFloatTableSelection();'
        +'	                done();'
        +'	            },'
        +'	            cleanFloatTableSelection:function(){'
        +'	                this.$refs.multipleFloatTable.clearSelection();'
        +'	                this.innerFloatVisible = false;'
        +'	            },'
        +'	            handleFloatSelectionChange:function(rows){'
        +'	                this.saveFloatData = rows;'
        +'	            },'
        +'	            doSaveModelDataFloat:function(){'
        +'	                if(this.saveFloatData.length>0){'
        +'	                    let cfgs = {'
        +'	                        modelId:this.modelRadio,'
        +'	                        tableName:this.modelRadioEnName,'
        +'	                        coords:this.formMarks.coordCol,'
        +'	                        status:\'1\','
        +'	                        data:this.saveFloatData'
        +'	                    };'
        +'	                    const me = this;'
        +'	                    let jsonDataList = this.rquestParams(\'POST\',configpre.map_saveModelDataFloat,cfgs);'
        +'	                    ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                        if(code==\'200\'){'
        +'	                            me.cleanFloatTableSelection();'
        +'	                            me.myMessage(\'保存成功\',\'success\');'
        +'	                        }else{'
        +'	                            me.myMessage(\'系统异常，请联系管理员\',\'error\');'
        +'	                        }'
        +'	                    });'
        +'	                }else{'
        +'	                    this.myMessage(\'请勾选数据\',\'warning\');'
        +'	                }'
        +'	            },'
        +'	            doCancle4ModelDataFloat:function(){'
        +'	                this.cleanFloatTableSelection();'
        +'	            },'
        +'	            changeRegion:function(colName){'
        +'	                if(!this.modelRadio || this.modelRadio==\'\' || !this.modelRadioEnName || this.modelRadioEnName==\'\'){'
        +'	                    this.myMessage(\'请选择数据模型\',\'warnning\');'
        +'	                    return;'
        +'	                }'
        +'	                let data = {'
        +'	                    modelId:this.modelRadio,'
        +'	                    tableName:this.modelRadioEnName,'
        +'	                    colName:colName'
        +'	                };'
        +'	                this.loadTableDataGroupByCol(\'POST\',configpre.map_loadTableDataGroupByCol,data);'
        +'	                delete data.colName;'
        +'	                data[\'mapType\'] = this.formMarks.dataType;'
        +'	            },'
        +'	            loadTableDataGroupByCol:function(method,api,data){'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\' && json.body){'
        +'	                        if(json.body){'
        +'	                            me.tableDatas = json.body||[];'
        +'	                            me.loadModelStyle(\'POST\',configpre.map_loadModelStyle,data);'
        +'	                        }else{'
        +'	                            me.myMessage(\'无数据\',\'success\');'
        +'	                        }'
        +'	                    }else{'
        +'	                        me.myMessage(\'系统异常，请联系管理员\',\'error\');'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            loadModelStyle:function(method,api,data){'
        +'	                const me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\' && json.body){'
        +'	                        if(json.body){'
        +'	                            me.styleDatas = json.body||\'\';'
        +'	                            let len = me.tableDatas.length;'
        +'	                            if(me.styleDatas!=\'\' && len>0){'
        +'	                                for(let i=0;i<len;i++){'
        +'	                                    let key = me.formMarks.addressCol+\'-\'+me.tableDatas[i].REGION;'
        +'	                                    if(me.styleDatas[key]){'
        +'	                                        me.tableDatas[i].STYLE_BUTTON=\'已设定\';'
        +'	                                    }'
        +'	                                }'
        +'	                            }'
        +'	                        }'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            openSetStyleDialg:function(opt,row){'
        +'	                let style;'
        +'	                if(opt==\'single\'){'
        +'	                    this.colDatas = [];'
        +'	                    if(this.styleDatas!=\'\'){'
        +'	                        this.colDatas.push(row);'
        +'	                        let key = this.formMarks.addressCol+\'-\'+row.REGION;'
        +'	                        style = this.styleDatas[key];'
        +'	                        if(typeof(style) == \'string\'){'
        +'	                            style = JSON.parse(style);'
        +'	                            style[\'carouselColType\'] = this.formMarks.carouselColType;'
        +'	                            style[\'displayNameStatus\'] = this.formMarks.displayNameStatus;'
        +'	                        }'
        +'	                    }'
        +'	                }else{'
        +'	                    if(this.colDatas.length==0){'
        +'	                        this.myMessage(\'请勾选数据\',\'warning\');'
        +'	                        return;'
        +'	                    }'
        +'	                }'
        +'	                this.initStyle(style);'
        +'	                this.loadIconData(\'POST\',configpre.map_getGisIcon);'
        +'	                this.innerVisible = true;'
        +'	            },'
        +'	            handleStyleSelectionChange:function(rows){'
        +'	                this.colDatas = rows;'
        +'	            },'
        +'	            loadIconData:function(method,api,data){'
        +'	                let me = this;'
        +'	                let jsonDataList = this.rquestParams(method,api,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        me.iconList= json.body||[];'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            openSetFloatDialog:function(){'
        +'	                this.saveFloatData=[];'
        +'	                if(this.formMarks.coordCol==\'\'){'
        +'	                    this.myMessage(\'请绑定地理位置\',\'warning\');'
        +'	                }else{'
        +'	                    this.innerFloatVisible = true;'
        +'	                }'
        +'	            },'
        +'	            iconChangeData:function(index){'
        +'	                let item = this.iconList[index];'
        +'	                this.formMarks.iconName = item.iconName;'
        +'	                this.formMarks.iconType = item.iconType;'
        +'	            },'
        +'	            submitDialogForm:function(formName) {'
        +'	                this.$refs[formName].validate((valid) => {'
        +'	                    if(valid){'
        +'	                        this.saveDialogData(this.modifyIndex);'
        +'	                        this.dialogDatabing = false;'
        +'	                    }else{'
        +'	                        return false;'
        +'	                    }'
        +'	                })'
        +'	            },'
        +'	            saveDialogData:function(index){'
        +'	                let data ={};'
        +'	                let formMarks = this.formMarks;'
        +'	                let marksStyleData = {};'
        +'	                marksStyleData[\'iconStatus\'] = formMarks.iconStatus;'
        +'	                marksStyleData[\'opacity\'] = formMarks.opacity;'
        +'	                marksStyleData[\'iconName\'] = formMarks.iconName;'
        +'	                marksStyleData[\'iconType\'] = formMarks.iconType;'
        +'	                marksStyleData[\'radius\'] = formMarks.radius;'
        +'	                marksStyleData[\'imageColor\'] = formMarks.imageColor;'
        +'	                marksStyleData[\'textAlign\'] = formMarks.textAlign;'
        +'	                marksStyleData[\'textBaseline\'] = formMarks.textBaseline;'
        +'	                marksStyleData[\'font\'] = formMarks.font;'
        +'	                marksStyleData[\'text\'] = formMarks.name;'
        +'	                marksStyleData[\'textFillColor\'] = formMarks.textFillColor;'
        +'	                marksStyleData[\'textStrokeColor\'] = formMarks.textStrokeColor;'
        +'	                marksStyleData[\'textStrokeWidth\'] = formMarks.textStrokeWidth;'
        +'	                marksStyleData[\'styleType\'] = formMarks.styleType;'
        +'	                marksStyleData[\'displayNameStatus\'] = formMarks.displayNameStatus;'
        +'	                marksStyleData[\'carouselColType\']=formMarks.carouselColType;'
        +'	                marksStyleData[\'hotType\']=formMarks.hotType;'
        +'	                marksStyleData[\'hotOpacity\']=formMarks.hotOpacity;'
        +'	                marksStyleData[\'hotBlur\']=formMarks.hotBlur;'
        +'	                marksStyleData[\'gradient\']=formMarks.originGradient;'
        +'	                marksStyleData[\'startStop\']=formMarks.startStop;'
        +'	                data[\'MODEL_RELATION_NAME\']=formMarks.name;'
        +'	                data[\'MODEL_RELATION_TYPE\']=formMarks.dataType;'
        +'	                if(formMarks.opt==\'modify\'){'
        +'	                    data[\'MODEL_RELATION_ID\'] = formMarks.MODEL_RELATION_ID;'
        +'	                }'
        +'	                data[\'STATUS\'] = formMarks.status;'
        +'	                data[\'MODEL_ID\']=this.model.choiceModelData.ID;'
        +'	                data[\'TABLE_NAME\']=this.model.choiceModelData.EN_NAME;'
        +'	                data[\'RELATION_DIM_COOR\']=formMarks.coordCol;'
        +'	                data[\'RELATION_DIM_CAROUSEL\']=formMarks.carouselCol;'
        +'	                data[\'RELATION_DIM_ADDRESS\']=formMarks.addressCol;'
        +'	                data[\'RELATION_MEASURE_VAL\']=formMarks.valCol;'
        +'	                data[\'MODEL_STYLE_DATA\']=marksStyleData;'
        +'	                this.saveMarksData(data,index);'
        +'	            },'
        +'	            saveMarksData:function(data,index){'
        +'	                let me = this;'
        +'	                let type = this.formMarks.opt;'
        +'	                let dataType = data.MODEL_RELATION_TYPE;'
        +'	                let jsonDataList = this.rquestParams(\'POST\',configpre.map_saveModelRelation,data);'
        +'	                ajaxrequestasync(jsonDataList,function(code,msg,json){'
        +'	                    if(code==\'200\'){'
        +'	                        let msg = \'修改成功\';'
        +'	                        if(type==\'delete\'){'
        +'	                            msg="删除成功";'
        +'	                            if(dataType==\'1\'){'
        +'	                                me.marksHeadData.splice(index,1);'
        +'	                            }else if(dataType==\'2\'){'
        +'	                                me.hotMapData.splice(index,1);'
        +'	                            }else if(dataType==\'3\'){'
        +'	                                me.lableMapData.splice(index,1);'
        +'	                            }else if(dataType==\'4\'){'
        +'	                                me.flightMapData.splice(index,1);'
        +'	                            }'
        +'	                        }else if(type==\'add\'){'
        +'	                            msg="添加成功";'
        +'	                            data.MODEL_RELATION_ID=json.body;'
        +'	                            if(dataType==\'1\'){'
        +'	                                me.marksHeadData.push(data);'
        +'	                            }else if(dataType==\'2\'){'
        +'	                                me.hotMapData.push(data);'
        +'	                            }else if(dataType==\'3\'){'
        +'	                                me.lableMapData.push(data);'
        +'	                            }else if(dataType==\'4\'){'
        +'	                                me.flightMapData.push(data);'
        +'	                            }'
        +'	                        }else if(type==\'modify\'){'
        +'	                            msg = \'修改成功\';'
        +'	                            if(dataType==\'1\'){'
        +'	                                me.marksHeadData.splice(index,1,data);'
        +'	                            }else if(dataType==\'2\'){'
        +'	                                me.hotMapData.splice(index,1,data);'
        +'	                            }else if(dataType==\'3\'){'
        +'	                                me.lableMapData.splice(index,1,data);'
        +'	                            }else if(dataType==\'4\'){'
        +'	                                me.flightMapData.splice(index,1,data);'
        +'	                            }'
        +'	                        }'
        +'	                        me.myMessage(msg,\'success\');'
        +'	                    }else{'
        +'	                        me.myMessage(\'操作失败\',\'error\');'
        +'	                    }'
        +'	                });'
        +'	            },'
        +'	            mapResize:function(){'
        +'	                this.resizeStatus=true;'
        +'	                if(this.heatmapInstance!=\'\'){'
        +'	                    $(\'.heatmap-canvas\').remove();'
        +'	                    this.heatmapInstance = h337.create(this.heatConfig);'
        +'	                    let heatmapData = {'
        +'	                        max: this.heatmapData.max,'
        +'	                        min: this.heatmapData.min,'
        +'	                        data: this.heatmapPluginsData(this.heatmapData.data)'
        +'	                    };'
        +'	                    this.setHeatMapData(heatmapData);'
        +'	                }'
        +'	                if(this.flightInstance!=\'\'){'
        +'	                    $(\'.flightMap-canvas\').remove();'
        +'	                    this.flightInstance = this.createFlight();'
        +'	                    if(this.flightData){'
        +'	                        this.drawFlight(this.flightPluginsData());'
        +'	                    }'
        +'	                }'
        +'	            }'
        +'	        }'
        +'	    });'
        +'</s'+ 'cript>'
        +'</body>'
        +'</html>';
    html=html.replace(/%/g,'%25');//将百分号转义
    html=html.replace(/\+/g,'%2b');//将百分号转义
    return html
}