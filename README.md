# JtSQL
JtSQL = javascript + sql + 模板理念，组合而成的一种创意脚本<br />
定位为数据库的批处理或定时任务（尤其在分布式数据库情境下...）<br />
<br />
<br />
源码很简单，主要是创意：）<br />
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

```js
/*stat_by_track.jtsql.js*/
set("sponge.sponge_track",{db:"sponge_track",user:"xxxx",password:"xxxxxx",url:"jdbc:mysql://x.x.x.x:3306/sponge_track?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true"});

var date1  = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 DAY),'%Y%m%d')>;
var date0  = $<sponge.sponge_track::SELECT DATE_FORMAT(NOW(),'%Y%m%d');>;

var hours = (new Date()).getHours();


$<sponge.sponge_track::DELETE FROM stat_track_date_hour_pv_uv_ip WHERE log_date>={{ (hours>7? date0 : date1) }}>;

function stat_track(i) {
	/*url*/
	var url_ids = $<sponge.sponge_track::SELECT url_id FROM short_url WHERE track_params_num>={{i}}>;
	
	if(url_ids){
		for(var j in url_ids){
			$<sponge.sponge_track::INSERT INTO stat_track_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,vi,vd,uv,pv,ip)
			SELECT url_id,tag_id,log_date,-1,{{i}},v{{i}},COUNT(DISTINCT user_key) uv,COUNT(*) pv,COUNT(DISTINCT log_ip_id) ip
			FROM short_redirect_log_30d 
			WHERE log_date>={{ (hours>7? date0 : date1) }} AND url_id ={{url_ids[j]}}
			GROUP BY url_id,log_date,v{{i}};>;
		};
	};

	/*tag*/
	var tag_ids = $<sponge.sponge_track::SELECT tag_id FROM track_tag WHERE t_track_params_num>={{i}};>;
	if(tag_ids){
		for(var j in tag_ids){
			$<sponge.sponge_track::INSERT INTO stat_track_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,vi,vd,uv,pv,ip)
			SELECT -1,tag_id,log_date,-1,{{i}},v{{i}},COUNT(DISTINCT user_key) uv,COUNT(*) pv,COUNT(DISTINCT log_ip_id) ip
			FROM short_redirect_log_30d 
			WHERE log_date>={{ (hours>7? date0 : date1) }} AND tag_id = {{tag_ids[j]}}
			GROUP BY tag_id,log_date,v{{i}}>;
		};
	};
};

stat_track(1);
stat_track(2);
stat_track(3);
stat_track(4);
stat_track(5);


```

# 附言<br/>
一、统计任务的问题（关于分布式数据库）：<br/>
分布式数据库：<br/>
1.不能写存储过程；<br/>
2.不能写事件（即定时任务）；<br/>
3.不能写函数；<br/>
<br/>
SQL的客户端工具：<br/>
1.只能以单句SQL作为执行单元；<br/>
2.无变量，无上下文；<br/>
<br/>
开发统计程序：<br/>
1.需要编译和特定部署；<br/>
2.SQL一般由字符串拼接（无法做语法高亮）<br/>
3.DBA难以审核<br/>
<br/>
二、解决方案：J-SQL 特点：<br/>
*.结合了JS、SQL、模板理念；<br/>
*.保持了JS和SQL的语法高亮（利于DBA审核）；<br/>
*.可统一管理、部署、运行<br/>
4.像存储过程一样，提供当前上下文及变量支持；<br/>
5.像SQL客户端工具一样，即时编写即时运行；<br/>
6.像定制统计程序一样，提供过程和逻辑控制能力；<br/>
