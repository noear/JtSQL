# JtSQL
JtSQL = javascript + sql + 模板理念，组合而成的一种创意脚本<br />
定位为数据库的批处理或定时任务（尤其在分布式数据库情境下...）<br />
<br />
<br />
特别说明：<br />
使用$&lt;db::...&gt;，在Js里嵌入SQL脚本<br />
使用{{...}}，在SQL里嵌入Js脚本（注：若它处出现{{ 或 }} 当中加个空隔）<br />
函数log(...)，用于记录日志<br />
函数set(key,val)，用于设置配置信息<br />
函数get(key)，用于获取配置信息<br />
函数http({ur,form,header})，用于请求http<br />
<br />
<br />
运行说明：<br />
1.终端运行模式（可用于调试代码或即时运行）：<br />
1.1.运行：java -jar jtsql.jar<br />
1.2.输入：脚本代码//可把写好的脚本粘贴进去...<br />
1.3.输入：;;; 并回车<br />

2.批处理运行模式：<br />
运行：java -jar jtsql.jar /data/a/a.jt.sql<br />
<br />
3.引入自己的项目：<br />
把源码：JtSqlEngine 放到自己的项目里，随便弄：）<br />
<br />
<br />
# 示例（更多见demo目录）
```js
/*upd_ip_city.jtsql.js*/

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



```
