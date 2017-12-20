set("sponge.sponge_track",{db:"sponge_track",user:"xxxx",password:"xxxxxx",url:"jdbc:mysql://x.x.x.x:3306/sponge_track?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true"});

var date1  = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 DAY),'%Y%m%d');>;
var date30 = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -30 DAY),'%Y%m%d');>;
var date0  = $<sponge.sponge_track::SELECT DATE_FORMAT(NOW(),'%Y%m%d');>;


$<sponge.sponge_track::DELETE FROM stat_date_hour_pv_uv_ip WHERE log_date>={{date1}};>;

function stat_url() {

	/*统计典线图：日数据*/
	$<sponge.sponge_track::INSERT INTO stat_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,pv,uv,ip)
		SELECT url_id,tag_id,log_date,-1, COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
		FROM short_redirect_log_30d 
		WHERE log_date>={{date1}}
		GROUP BY url_id,log_date;>;

	$<sponge.sponge_track::INSERT INTO stat_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,pv,uv,ip)
		SELECT -1,tag_id,log_date,-1, COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
		FROM short_redirect_log_30d 
		WHERE log_date>={{date1}}
		GROUP BY tag_id,log_date;>;

	/*统计典线图：小时数据*/

	$<sponge.sponge_track::INSERT INTO stat_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,pv,uv,ip)
		SELECT url_id,tag_id,log_date, log_hour,COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
		FROM short_redirect_log_30d 
		WHERE log_date>={{date1}}
		GROUP BY url_id,log_date,log_hour;>;

	$<sponge.sponge_track::INSERT INTO stat_date_hour_pv_uv_ip(url_id,tag_id,log_date,log_hour,pv,uv,ip)
		SELECT -1,tag_id,log_date, log_hour,COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
		FROM short_redirect_log_30d 
		WHERE log_date>={{date1}}
		GROUP BY tag_id,log_date,log_hour;>;
};

function stat_url_sum(){
	/*总量统计：url记录昨日数据*/
	$<sponge.sponge_track::UPDATE short_url_ex_stat se, stat_date_hour_pv_uv_ip ss
	SET se.uv_yesterday = ss.uv, se.pv_yesterday = ss.pv, se.ip_yesterday = ss.ip
	WHERE se.url_id = ss.url_id AND ss.log_date={{date1}} AND ss.log_hour=-1 AND ss.url_id>0;>;
	
	/*总量统计：url记录今日数据*/
	$<sponge.sponge_track::UPDATE short_url_ex_stat SET uv_today=0,pv_today=0,ip_today=0 WHERE 1=1;>;
	
	$<sponge.sponge_track::UPDATE short_url_ex_stat se, stat_date_hour_pv_uv_ip ss
	SET se.uv_today = ss.uv, se.pv_today = ss.pv, se.ip_today = ss.ip
	WHERE se.url_id = ss.url_id AND ss.log_date={{date0}} AND ss.log_hour=-1 AND ss.url_id>0;>;

	/*总量统计：url合计总数*/
	$<sponge.sponge_track::TRUNCATE TABLE _tmp_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_total_pv_uv_ip(obj_id,pv,uv,ip)
	SELECT url_id,SUM(pv) pv, SUM(uv) uv,SUM(ip) ip
	FROM stat_date_hour_pv_uv_ip WHERE log_date>={{date30}} AND log_hour=-1 AND url_id>0 GROUP BY url_id;>;

	$<sponge.sponge_track::UPDATE short_url_ex_stat u, _tmp_total_pv_uv_ip s
	SET u.pv_total = s.pv, u.uv_total = s.uv, u.ip_total = s.ip
	WHERE u.url_id = s.obj_id;>;



	/*总量统计：tag记录昨日数据*/
	$<sponge.sponge_track::UPDATE track_tag_ex_stat se, stat_date_hour_pv_uv_ip ss
	SET se.uv_yesterday = ss.uv, se.pv_yesterday = ss.pv, se.ip_yesterday = ss.ip
	WHERE se.tag_id = ss.tag_id AND ss.log_date={{date1}} AND ss.log_hour=-1 AND ss.url_id=-1;>;
	
	/*总量统计：tag记录今日数据*/
	$<sponge.sponge_track::UPDATE track_tag_ex_stat SET uv_today=0,pv_today=0,ip_today=0 WHERE 1=1;>;
	
	$<sponge.sponge_track::UPDATE track_tag_ex_stat se, stat_date_hour_pv_uv_ip ss
	SET se.uv_today = ss.uv, se.pv_today = ss.pv, se.ip_today = ss.ip
	WHERE se.tag_id = ss.tag_id AND ss.log_date={{date0}} AND ss.log_hour=-1 AND ss.url_id=-1;>;
	
	/*总量统计：tag合计总数*/
	$<sponge.sponge_track::TRUNCATE TABLE _tmp_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_total_pv_uv_ip(obj_id,pv,uv,ip)
	SELECT tag_id,SUM(pv) pv, SUM(uv) uv,SUM(ip) ip
	FROM stat_date_hour_pv_uv_ip WHERE log_date>={{date30}} AND log_hour=-1 AND url_id=-1 GROUP BY tag_id;>;
	
	$<sponge.sponge_track::UPDATE track_tag_ex_stat u, _tmp_total_pv_uv_ip s
	SET u.pv_total = s.pv, u.uv_total = s.uv, u.ip_total = s.ip
	WHERE u.tag_id = s.obj_id;>;
};

stat_url();
stat_url_sum();