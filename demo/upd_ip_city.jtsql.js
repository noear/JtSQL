set("sponge.sponge_track",{db:"sponge_track",user:"xxxx",password:"xxxxxx",url:"jdbc:mysql://x.x.x.x:3306/sponge_track?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true"});

function doItem(item){
	var txt  = http({ url:"http://iploc.market.alicloudapi.com/v3/ip?ip={{item.ip_val}}",header:{"Authorization":"APPCODE x...x"} });
	var ipx = JSON.parse(txt);
	
	if(typeof(ipx.adcode) == 'string'){
		$<sponge.sponge_track::UPDATE user_ip SET city_code = {{ipx.adcode}},is_checked=1 WHERE ip_id = {{item.ip_id}};>;
	}else{
		$<sponge.sponge_track::UPDATE user_ip SET is_checked = 1 WHERE ip_id = {{item.ip_id}};>;
	};
};


var list = $<sponge.sponge_track::SELECT * FROM user_ip WHERE city_code=0 and is_checked=0 LIMIT 1000;>;

if(list && list.length){
	for(var i in list){
		var item = list[i];
		doItem(item);
	};
};


