ajaxrequestasync = function(jsonData,callback,scope){
	var url = jsonData.url || "*.jsonRequest";
	var method = jsonData.httpMethod || "POST";
	var dataType=jsonData.dataType||'json'
	var data=jsonData.data;
	$.ajax({
		type : method,
		async : true,
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
		if(typeof callback == "function"){
			var ctx = typeof scope == "object" ? scope : this;
			callback.call(ctx,code,msg,json);
		}
	}
};