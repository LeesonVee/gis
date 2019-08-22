ajaxrequestsync=function (jsonData){
	var url = jsonData.url || "*.jsonRequest";
	var method = jsonData.httpMethod || "POST";
	var dataType=jsonData.dataType||'json'
	var data=jsonData.data;
	var responseData={};
	$.ajax({
		type : method,
		async : false,
		url : url,
		data : data,
		dataType:dataType,
		contentType: "application/json;charset=utf-8",
		complete:complete,
	});
	function complete(XMLHttpRequset,sucess){
		var json = {};
		var code = 200;
		var msg = "";
		if(sucess){
			var  response=JSON.parse(XMLHttpRequset.responseText);
			code = response["code"];
			msg = response["msg"];
			json=response;
		}else{
			code = 400;
			msg = "ConnectionError";
		}
		responseData={
				code:code,
				msg:msg,
				json:json,
		}
	}
	return responseData;
}