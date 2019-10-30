/**
 * Created by Vee on 2019/10/25.
 */
// (function (global) {
//     global.GisFlight = global.GisFlight || {};
//     GisFlight.prototype.config ={};
// })(window);
// GisFlight.prototype.flight_percent = 100;
// GisFlight.prototype.drawCurvePaths = function(flightCfg,percent){
//     let curveData = flightCfg.data.curves;
//     let ctx = flightCfg.ctx;
//     curveData.forEach(item=>{
//         ctx.beginPath();
//         ctx.strokeStyle = createLinearGradient(item,ctx);
//         ctx.moveTo(item.start[0], item.start[1]);   //画笔移动到起点
//         for (var t = 0; t <= percent / GisFlight.flight_percent; t += 0.005) {
//             //获取每个时间点的坐标
//             var x = quadraticBezier(item.start[0], item.point[0], item.end[0], t);
//             var y = quadraticBezier(item.start[1], item.point[1], item.end[1], t);
//             ctx.lineTo(x, y);   //画出上个时间点到当前时间点的直线
//         }
//         ctx.lineWidth=item.lineWidth||2;
//         ctx.stroke();   //描边
//         createHeadLight(x,y,ctx);
//         ctx.closePath();
//     });
// }
const flight_percent = 100;
let requestAnimation;
/**
 * 二次贝塞尔曲线动画
 * @param  {Array<number>} curveData 曲线数据：start 起点坐标,point曲度点坐标(也就是转弯的点,不是准确的坐标,只是大致的方向)，end 终点坐标
 * @param  {number} percent 绘制百分比(0-100)
 */
function drawCurvePaths(flightCfg,percent){
    let curveData = flightCfg.data.curves;
    let ctx = flightCfg.ctx;
    curveData.forEach(item=>{
        ctx.beginPath();
        ctx.strokeStyle = createLinearGradient(item,ctx);
        ctx.moveTo(item.start[0], item.start[1]);   //画笔移动到起点
        for (var t = 0; t <= percent / flight_percent; t += 0.005) {
            //获取每个时间点的坐标
            var x = quadraticBezier(item.start[0], item.point[0], item.end[0], t);
            var y = quadraticBezier(item.start[1], item.point[1], item.end[1], t);
            ctx.lineTo(x, y);   //画出上个时间点到当前时间点的直线
        }
        ctx.lineWidth=item.lineWidth||2;
        ctx.stroke();   //描边
        createHeadLight(x,y,ctx);
        ctx.closePath();
    });
    // testDrawLine(ctx);
}
/**
 * 二次贝塞尔曲线方程
 * @param  {Array<number>} start 起点
 * @param  {Array<number>} 曲度点
 * @param  {Array<number>} end 终点
 * @param  {number} 绘制进度(0-1)
 */
function quadraticBezier(p0, p1, p2, t) {
    var k = 1 - t;
    return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}
/**
 * 创建线性渐变
 * @param  {Array<number>} start 起点
 * @param  {Array<number>} 曲度点
 * @param  {Array<number>} end 终点
 * @param  {number} 绘制进度(0-1)
 */
function createLinearGradient(item,ctx){
    let start = item.start;
    let end = item.end;
    let percent1 = item.gradient?item.gradient.general.percent/100:0;
    let color1 = item.gradient?item.gradient.general.color:'rgba(255,50,13,.2)';
    let percent2 = item.gradient?item.gradient.warnning.percent/100:0.3;
    let color2 = item.gradient?item.gradient.warnning.color:'#2a68ff';
    let percent3 = item.gradient?item.gradient.danger.percent/100:1;
    let color3 = item.gradient?item.gradient.danger.color:'#ff320d';
    var lineGradient = ctx.createLinearGradient(...start, ...end);
    // lineGradient.addColorStop(0, (item.lineStroke && item.lineStroke[0])?item.lineStroke[0]:'rgba(255,50,13,.2)');
    // lineGradient.addColorStop(0.3, (item.lineStroke && item.lineStroke[1])?item.lineStroke[1]:'#2a68ff');
    // lineGradient.addColorStop(1, (item.lineStroke && item.lineStroke[2])?item.lineStroke[2]: '#ff320d');
    lineGradient.addColorStop(percent1, color1);
    lineGradient.addColorStop(percent2, color2);
    lineGradient.addColorStop(percent3, color3);
    return lineGradient
}
/**
 * 创建头部原点及添加样式
 * @param {number} x轴位置
 * @param {number} y轴位置
 */
function createHeadLight(x,y,ctx){
    ctx.beginPath();
    var radialGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    radialGradient.addColorStop(0, "rgba(255,50,13,1)");
    radialGradient.addColorStop(.2, "rgba(255,50,13,.8)");
    radialGradient.addColorStop(1, "transparent");
    ctx.fillStyle = radialGradient;
    ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
}
/**
 * 绘制文本
 * @param {string} department 文本标题
 * @param {object} value 文本内容
 * @param {number} x轴位置
 * @param {number} y轴位置
 */
function drawText(department, value, x, y,ctx) {
    ctx.fillStyle = '#fff'
    ctx.font = "22px 微软雅黑";
    ctx.fillText(department, x + 30, y + 20);  //为了使文本在光晕右下角x,y轴需要偏移一些距离
    let width = ctx.measureText(value).width;   //获取文本的宽度
    let gradientCfg = {
        start:[x + 30, 0],//文本渐变x轴的渲染范围是[x+30,x+30+文本的宽度],
        end:[x + 30 + width, 0],//这里y取0,是因为没找到获取文本高的api,写0也是可以的
        lineStroke:['#fffd00','#2a68ff','#ff6d00']
    }
    ctx.fillStyle = createLinearGradient(gradientCfg);
    ctx.fillText(value.toLocaleString(), x + 30, y + 50);
}
/**
 * 绘制图形
 * @param {object} img图片对象
 * @param {number} x轴位置
 * @param {number} y轴位置
 */
function drawImg(img,x,y,ctx){
    ctx.drawImage(img,x-20,y-20);
}
/**
 * 绘制飞线图
 * @param {object} data飞线图数据
 */
function draw(){
    let flightCfg= this.flightConfig;
    let ctx = flightCfg.ctx;
    let data = flightCfg.data;
    let percent = data.percent;
    cleanFlight(ctx);
    // ctx.clearRect(0, 0, data.width||1600, data.height||780);  //每次清除画布
    drawCurvePaths(flightCfg,percent);
    percent += data.rate || 0.5; //进程增加,这个控制动画速度
    this.flightConfig.data.percent = percent;
    if (percent <= flight_percent) { //没有画完接着调用,画完的话重置进度
        requestAnimation = requestAnimationFrame(draw);
    }else{
        init()
    }
}
/**
 * 初始化飞线图
 * @param {object} flightCfg飞线图数据
 * flightCfg={
 *     ctx:object,
 *     data:{
 *          percent:0,
 *          rate:0.5,
 *          width:1500,
 *          height:768
 *          curves:[
 *              {
 *                  start:[150,600],
 *                  point:[260,250],
 *                  end:[400,200],
 *                  textCfg:{
 *                      department: '数据3',
 *                      value: 4321,
 *                  }
 *                  img:new Image(),
 *                  lineStroke:['rgba(255,50,13,.2)','#2a68ff','#ff320d'],
 *                  lineWidth:2
 *              }
 *          ]
 *     }
 * }
 */
function init(){
    this.flightConfig.data.percent = 0;//每次重置进程
    draw();
}
function initFlight(data){
    // let flightCfg = {
    //     ctx:document.getElementById('canvas').getContext('2d'),
    //     data:data
    // }
    this.flightConfig =data;
    init();
}
function getPoint(datas){
    if(datas && datas.length>0){
        datas.forEach(item=>{
            // addMiddelPoint(item);
            addMiddelPointV2(item);
        });
    }
}
function addMiddelPoint(item){
    let start = item.start;
    let end = item.end;
    let x,y;
    if(start[0]-end[0]<0){
        x = start[0]+(start[0]+end[0])/4;
    }else if(start[0]-end[0]==0){
        x = end[0]+(start[0]+end[0])/4;
    }else{
        x = start[0]-(start[0]+end[0])/12;
    }
    if(start[1]-end[1]<0){
        y = start[1]-(start[1]+end[1])/12;
    }else if(start[1]-end[1] == 0){
        y = start[1]-10;
    }else{
        y = end[1]+(start[1]+end[1])/12;
    }
    item['point']=[x,y];
}
function addMiddelPointV2(item){
    let start = item.start;
    let end = item.end;
    let x,y,quadrant=0;
    if((start[0]-end[0]>0)&&(start[1]-end[1]>0)){
        quadrant=1;
    }else if((start[0]-end[0]>0)&&(start[1]-end[1]<0)){
        quadrant=2;
    }else if((start[0]-end[0]<0)&&(start[1]-end[1]<0)){
        quadrant=3;
    }else if((start[0]-end[0]<0)&&(start[1]-end[1]>0)){
        quadrant=4;
    }else if((start[0]-end[0]>0)&&(start[1]-end[1]==0)){
        //x轴正
        quadrant=5;
    }else if((start[0]-end[0]<0)&&(start[1]-end[1]==0)){
        //x轴负
        quadrant=6;
    }else if((start[0]-end[0]==0)&&(start[1]-end[1]<0)){
        //y轴正
        quadrant=7;
    }else if((start[0]-end[0]==0)&&(start[1]-end[1]>0)){
        //y轴负
        quadrant=8;
    }
    switch (quadrant){
        case 1:
            x = item.end[0]+50*((item.start[0]-item.end[0])/100);
            y = item.end[1];
            break;
        case 2:
            x = item.end[0]-10*((item.start[0]-item.end[0])/100);
            y = item.end[1];
            break;
        case 3:
            x = item.end[0]-10*((item.end[0]-item.start[0])/10);
            y = item.end[1];
            break;
        case 4:
            x = item.end[0];
            y = item.end[1]+50*((item.start[1]-item.end[1])/100);
            break;
        case 5:
            x=item.end[0];
            y=item.end[1]+10;
            if(item.start[0]-item.end[0]<=100){
                y=item.end[1];
            }
            break;
        case 6:
            x=item.end[0];
            y=item.end[1]-10;
            if(item.end[0]-item.start[0]<=100){
                y=item.end[1];
            }
            break;
        case 7:
            x=item.end[0]+10;
            y=item.end[1];
            if(item.end[1]-item.start[1]<=100){
                x=item.end[0];
            }
            break;
        case 8:
            x=item.end[0]-110;
            y=item.end[1];
            if(item.start[1]-item.end[1]<=100){
                x=item.end[0];
            }
            break;
    }
    item['point']=[x,y];
}
/**
 *
 */
function cleanFlight(ctx){
    if(!ctx){
        return;
    }
    if(requestAnimation){
        cancelAnimationFrame(requestAnimation);
    }
    ctx.clearRect(0, 0, window.screen.width, window.screen.height);
}
function testDrawLine(ctx){
    ctx.beginPath();
    ctx.strokeStyle = "rgb(250,0,0,0.2)";
    ctx.fillStyle = "rgb(250,0,0,0.8)";
    ctx.strokeWidth=1;
    ctx.moveTo(0,350);//先保存一个坐标
    ctx.lineTo(1500,350);//从moveTo提供的坐标绘制到500,500

    ctx.moveTo(700,0);//先保存一个坐标
    ctx.lineTo(700,800);//从moveTo提供的坐标绘制到500,500
    ctx.stroke();//通过此函数将以上绘制的图形绘制到画布上
    ctx.closePath();
}