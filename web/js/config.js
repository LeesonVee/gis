(function (global) {
    global.configpre = global.configpre || {};
	let curWwwPath=window.document.location.href;
    let pathName=window.document.location.pathname;
    let pos=curWwwPath.indexOf(pathName);
    let localhostPath=curWwwPath.substring(0,pos);
    let projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
    configpre.projectPath=localhostPath+projectName;
    let apiRootPath='http://10.32.0.169:8120/hub/';
    configpre.api_rootPath=apiRootPath;
    configpre.map_saveMapData=apiRootPath+'map/saveMapData.html';
    configpre.map_createFile=apiRootPath+'map/createFile.html';
    configpre.map_loadAreaCodeData=apiRootPath+'map/loadAreaCodeData.html';
    configpre.map_loadModelRelation=apiRootPath+'map/loadModelRelation.html';
    configpre.api_loadModelDataWithLayout=apiRootPath+'api/loadModelDataWithLayout.html';
    configpre.map_saveModelRelation=apiRootPath+'map/saveModelRelation.html';
    configpre.api_loadColsByTableNameAndModleId=apiRootPath+'api/loadColsByTableNameAndModleId.html';
    configpre.map_queryTableDataByGisModelRelation=apiRootPath+'map/queryTableDataByGisModelRelation.html';
    configpre.map_getGisIcon=apiRootPath+'map/getGisIcon.html';
    configpre.map_getOrganInfoByAreaCode=apiRootPath+'map/getOrganInfoByAreaCode.html';
    configpre.map_getMapByPkey=apiRootPath+'map/getMapByPkey.html';

    configpre.webGisPath='http://10.32.0.169:8140/gis/';
})(window);