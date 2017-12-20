set("sponge.sponge_track",{db:"sponge_track",user:"xxxx",password:"xxxxxx",url:"jdbc:mysql://x.x.x.x:3306/sponge_track?useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true"});

var date1  = $<sponge.sponge_track::SELECT DATE_FORMAT(DATE_ADD(NOW(),INTERVAL -1 DAY),'%Y%m%d');>;

$<sponge.sponge_track::DELETE FROM stat_city_date_pv_uv_ip WHERE log_date = {{date1}};>;

$<sponge.sponge_track::INSERT INTO stat_city_date_pv_uv_ip(url_id,tag_id,province_code,log_date,pv,uv,ip)
SELECT -1,tag_id,log_city_code*10000,log_date,COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
FROM short_redirect_log_30d 
WHERE log_date = {{date1}}
GROUP BY tag_id,log_city_code;>;


$<sponge.sponge_track::INSERT INTO stat_city_date_pv_uv_ip(url_id,tag_id,province_code,log_date,pv,uv,ip)
SELECT url_id,tag_id,log_city_code*10000,log_date,COUNT(*) pv,COUNT(DISTINCT user_key) uv,COUNT(DISTINCT log_ip_id) ip
FROM short_redirect_log_30d 
WHERE log_date = {{date1}}
GROUP BY url_id,log_city_code;>;


