set("sponge.sponge_track",{db:"sponge_track",user:"xxxx",password:"xxxxxx",url:"jdbc:mysql://x.x.x.x:3306/sponge_track?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true"});

var date1  = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 DAY),'%Y%m%d')>;
var date30 = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -30 DAY),'%Y%m%d')>;
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

function stat_track_sum(){

	/*url total*/
	$<sponge.sponge_track::TRUNCATE short_url_ex_track_stat;>;
	
	$<sponge.sponge_track::INSERT INTO short_url_ex_track_stat(url_id,tag_id,vi,vd,uv_total,pv_total,ip_total)
	SELECT url_id,tag_id,vi,vd,SUM(uv) uv,SUM(pv) pv,SUM(ip) ip 
	FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date>={{date30}} AND log_hour=-1 AND url_id>0
	GROUP BY url_id,vi,vd;>;
	
	
	/*url yesday*/
	$<sponge.sponge_track::TRUNCATE _tmp_track_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_track_total_pv_uv_ip(obj_id,vi,vd,uv,pv,ip)
	SELECT url_id,vi,vd,uv,pv,ip FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date={{date1}} AND log_hour=-1 AND url_id>0;>;
	
	$<sponge.sponge_track::UPDATE short_url_ex_track_stat s, _tmp_track_total_pv_uv_ip t
	SET s.uv_yesterday = t.uv, s.pv_yesterday = t.pv, s.ip_yesterday = t.ip
	WHERE s.url_id = t.obj_id AND s.vi = t.vi AND s.vd = t.vd;>;
	
	/*url today*/
	$<sponge.sponge_track::TRUNCATE _tmp_track_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_track_total_pv_uv_ip(obj_id,vi,vd,uv,pv,ip)
	SELECT url_id,vi,vd,uv,pv,ip FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date={{date0}} AND log_hour=-1 AND url_id>0;>;
	
	$<sponge.sponge_track::UPDATE short_url_ex_track_stat s, _tmp_track_total_pv_uv_ip t
	SET s.uv_today = t.uv, s.pv_today = t.pv, s.ip_today = t.ip
	WHERE s.url_id = t.obj_id AND s.vi = t.vi AND s.vd = t.vd;>;
	
	
	
	/*tag total*/
	$<sponge.sponge_track::TRUNCATE track_tag_ex_track_stat;>;
	
	$<sponge.sponge_track::INSERT INTO track_tag_ex_track_stat(tag_id,vi,vd,uv_total,pv_total,ip_total)
	SELECT tag_id,vi,vd,SUM(uv) uv,SUM(pv) pv,SUM(ip) ip 
	FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date>={{date30}} AND log_hour=-1 AND url_id=-1
	GROUP BY tag_id,vi,vd;>;
	
	
	/*tag yesday*/
	$<sponge.sponge_track::TRUNCATE _tmp_track_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_track_total_pv_uv_ip(obj_id,vi,vd,uv,pv,ip)
	SELECT tag_id,vi,vd,uv,pv,ip FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date={{date1}} AND log_hour=-1 AND url_id=-1;>;
	
	$<sponge.sponge_track::UPDATE track_tag_ex_track_stat s, _tmp_track_total_pv_uv_ip t
	SET s.uv_yesterday = t.uv, s.pv_yesterday = t.pv, s.ip_yesterday = t.ip
	WHERE s.tag_id = t.obj_id AND s.vi = t.vi AND s.vd = t.vd;>;
	
	/*tag today*/
	$<sponge.sponge_track::TRUNCATE _tmp_track_total_pv_uv_ip;>;
	
	$<sponge.sponge_track::INSERT INTO _tmp_track_total_pv_uv_ip(obj_id,vi,vd,uv,pv,ip)
	SELECT tag_id,vi,vd,uv,pv,ip FROM stat_track_date_hour_pv_uv_ip 
	WHERE log_date={{date0}} AND log_hour=-1 AND url_id=-1;>;
	
	$<sponge.sponge_track::UPDATE track_tag_ex_track_stat s, _tmp_track_total_pv_uv_ip t
	SET s.uv_today = t.uv, s.pv_today = t.pv, s.ip_today = t.ip
	WHERE s.tag_id = t.obj_id AND s.vi = t.vi AND s.vd = t.vd;>;
}

stat_track(1);
stat_track(2);
stat_track(3);
stat_track(4);
stat_track(5);

stat_track_sum();
