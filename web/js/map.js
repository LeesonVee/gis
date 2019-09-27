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
            var addPointStatus = false;
            var params = {
                areaCode:jsonAreaCode.areaCode
            };
            var jsonDataList ={
                httpMethod:'POST',
                url:configpre.map_getOrganInfoByAreaCode,
                data:JSON.stringify(params)
            }
            ajaxrequestasync(jsonDataList,function(code,msg,json){
                if(code=='200'){
                    map.on(element,function(e){
                        var zoom = map.getView().getZoom();  //获取当前地图的缩放级别
                        if(zoom >= 13){
                            if(!addPointStatus){
                                console.log('添加点标记');
                                json.body.forEach(item=>{
                                    me.addPoint(item.LNG,item.LAT,item.MARK_NAME);
                                });
                                addPointStatus = true;
                            }
                        }else{
                            if(addPointStatus){
                                me.layer.getSource().clear();   //控制地图图层不可见
                                addPointStatus = false;
                            }
                        }
                    });
                }
            });
        }
    });

    // var addPointStatus = false;
    // var converLayer = this.converLayer;
    // var featureOverlay = (eventName=='pointermove')?this.featureOverlay(map):'';
    // this.highlight;
    // map.on(eventName, function (evt) {
    //     if(eventName=='singleclick'){
    //         //地图绑定单击事件
    //         me.singleClick(evt);
    //     }else if(eventName=='pointermove'){
    //         //地图绑定鼠标滑过事件
    //         me.highlight = me.pointerMove(evt,converLayer,featureOverlay,me.highlight,map);
    //     }else if(eventName=='moveend'){
    //         var zoom = map.getView().getZoom();  //获取当前地图的缩放级别
    //         if(zoom >= 12){
    //             if(!addPointStatus){
    //                 console.log('添加点标记');
    //                 data.forEach(item=>{
    //                     me.addPoint(item.coord,item.lableName);
    //                 });
    //                 addPointStatus = true;
    //             }
    //         }else{
    //             if(addPointStatus){
    //                 me.layer.getSource().clear();   //控制地图图层不可见
    //                 addPointStatus = false;
    //             }
    //         }
    //     }
    // });
}
function pointermoveMap(element,map){
    var converLayer = this.converLayer;
    var featureOverlay = this.featureOverlay(map);
    //地图绑定鼠标滑过事件
    map.on(element, function (evt) {
        me.highlight = me.pointerMove(evt,converLayer,featureOverlay,me.highlight,map);
    });
}
function pointerMoveSetXY(element,map){
    map.on(element, function (evt) {
        var point = evt.pixel;
        if(mapVue){
            var coordinate;
            var coordinateData = mapVue.allFloatDialogData;
            for(var p in coordinateData){
                var arry = JSON.parse(p);
                console.info((evt.coordinate[0]-arry[0])*1000);
                console.info((evt.coordinate[1]-arry[1])*1000);
                if(Math.abs(evt.coordinate[0]-arry[0])*1000<2 && Math.abs(evt.coordinate[1]-arry[1])*1000<1){
                    coordinate=p;
                }
            }
            if(coordinateData && coordinateData!='' && coordinateData[coordinate]){
                // console.info(coordinate);
                mapVue.floatDialogLeft=point[0]+5;
                mapVue.floatDialogTop=point[1]+5;
                mapVue.floatDialogData = coordinateData[coordinate];
                mapVue.floatDialog = true;
            }else{
                mapVue.floatDialog = false;
            }

        }
    });
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
        text: cfgs.displayNameStatus?cfgs.text||'':'',
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

function showHotMap(heatData){
    removeHotMap();
    //矢量图层 获取geojson数据
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(heatData,{
            dataProjection : 'EPSG:4326',
            featureProjection : 'EPSG:4326'
        })
    });
    // Heatmap热力图
    this.loopHotVector = new ol.layer.Heatmap({
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
    this.map.addLayer(this.loopHotVector);

}
var dataIndex=0;
function loopShowHotMap(heatDatas){
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