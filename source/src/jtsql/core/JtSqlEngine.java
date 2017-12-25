package jtsql.core;


import jtsql.utils.HttpUtil;
import jtsql.utils.LogUtil;
import jtsql.utils.Timespan;
import noear.snacks.ONode;
import noear.weed.DataItem;
import noear.weed.DataList;
import noear.weed.DbContext;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;

public class JtSqlEngine {
    private ScriptEngine jsEngine = null;
    private JTAPI jtapi = null;

    public JtSqlEngine(){
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        jsEngine = scriptEngineManager.getEngineByName("nashorn");

        jtapi = new JTAPI();

        jsEngine.put("JTAPI",jtapi);

        try {
            jsEngine.eval("function set(key,obj){JTAPI.set(key,JSON.stringify(obj))};");
            jsEngine.eval("function get(key){var txt=JTAPI.get(key);if(txt){return JSON.parse(txt)}else{return null}};");

            jsEngine.eval("function log(txt){JTAPI.log(txt)};");
            jsEngine.eval("function http(obj){return JTAPI.http(JSON.stringify(obj))};"); //obj:{url:'xxx', form:{}, header:{}}
            jsEngine.eval("function sql(txt){var _d=JTAPI.sql(txt);if(_d&&typeof(_d)=='object'&&_d.getRow){var item=_d.getRow(0);var keys=item.keys();if(_d.getRowCount()==1){var obj={};for(var i in keys){var k1=keys.get(i);obj[k1]=item.get(k1)};return obj}else{var ary=[];if(item.count()==1){var list=_d.toArray(0);for(var i in list){ary.push(list[i])}}else{var rows=_d.getRows();for(var j in rows){var m1=rows.get(j);var obj={};for(var i in keys){var k1=keys.get(i);obj[k1]=m1.get(k1)};ary.push(obj)}};return ary}}else{return _d}};");
        }catch (Exception ex){
            ex.printStackTrace();
        }
    }

    public void exec(String jtsql) throws ScriptException {
        jtapi.clear();

        String jscode = "(function(){"+compile(jtsql)+"})();";

        jsEngine.eval(jscode);
    }

    public String last_sql(){
        return jtapi.last_sql;
    }

    private String compile(String jtsql){
        String jscode = jtsql.replaceAll("\r\n"," ");

        jscode = jscode.replaceAll("\\$\\<","sql(\"");
        jscode = jscode.replaceAll("\\>;","\");");

        jscode = jscode.replaceAll("\\{\\{","\"+");
        jscode = jscode.replaceAll("\\}\\}","+\"");

        LogUtil.write("JtSQL.code", jscode);

        return jscode;
    }

    public class JTAPI {
        private Map<String,String> setting = new HashMap<>();
        public String last_sql = null;


        public JTAPI() { }

        /*
            $<water.water_log::UPDATE user_ip SET city_code = {{ipx.adcode}},is_checked=1 WHERE ip_id = {{item.ip_id}};::nolog>;
            $<{host:'xxxx',db:'xxx',usr:'xxx',pwd:'xxxx'}::UPDATE user_ip SET city_code = {{ipx.adcode}},is_checked=1 WHERE ip_id = {{item.ip_id}};>;
        */
        public Object sql(String sql) throws SQLException {
            this.last_sql = sql;

            boolean isLog = (sql.endsWith("::nolog") == false);

            if (isLog == false) {
                sql = sql.replace("::nolog", "");
            }

            DbContext db = null;
            if (sql.indexOf("::") > 0) {
                String[] ss = sql.split("::");

                db = jtapi.getDb(ss[0]);
                sql = ss[1];

            } else {
                LogUtil.write("JtSQL.sql", "error: no db!!!");
                return "error: no db!!!";
            }


            Date start_time = new Date();
            Object temp = doSql(db, sql);

            long exec_time = new Timespan(start_time).milliseconds();

            if (isLog) {
                LogUtil.write("JtSQL.sql", (exec_time / 1000.0) + "s::" + sql);
            }

            return temp;
        }

        private Object doSql(DbContext db, String sql) throws SQLException {
            if (sql.startsWith("INSERT INTO ")) {
                return db.sql(sql).insert();
            }

            if (sql.startsWith("SELECT ")) {
                DataList list = db.sql(sql).getDataList();

                if (list.getRowCount() == 0) {
                    return null;
                }

                if (list.getRowCount() == 1) {
                    DataItem item = list.getRow(0);
                    if (item.count() == 1) {
                        for (String k1 : item.keys()) {
                            return item.get(k1);
                        }
                    }
                }

                return list;
            } else { //DELETE UPDATE TRUNCACHE DTRAN...
                return db.sql(sql).execute();
            }
        }

        public String http(String obj_str) throws IOException {
            //obj_str:{url:'xxx', form:{}, header:{}}

            ONode obj = ONode.tryLoad(obj_str);

            String url = obj.get("url").getString();

            Map<String, String> header = null;
            if (obj.contains("header")) {
                header = new HashMap<>();
                ONode j_header = obj.get("header").asObject();
                for (String k1 : j_header.allKeys()) {
                    header.put(k1, j_header.get(k1).getString());
                }
            }


            String rst = null;
            if (obj.contains("form") == false) { //get
                rst = HttpUtil.getString(url, header);
            } else { //post
                List<NameValuePair> args = new ArrayList<>();
                ONode j_form = obj.get("form").asObject();

                for (String k1 : j_form.allKeys()) {
                    args.add(new BasicNameValuePair(k1, j_form.get(k1).getString()));
                }

                rst = HttpUtil.postString(url, args, header);
            }

            return rst;
        }

        public void log(Object txt) {

            LogUtil.write("JtSQL.log", txt.toString());
        }

        //
        public void set(String key, String val) {
            setting.put(key,val);
        }

        public String get(String key){
            if(setting.containsKey(key))
                return setting.get(key);
            else
                return null;
        }

        public void clear(){
            setting.clear();
        }

        private DbContext getDb(String setting_key){
           String json = get(setting_key);
           ONode cfg = ONode.tryLoad(json);

           //String schemaName, String url, String user, String password, String fieldFormat;

           DbContext db = new DbContext(
                   cfg.get("db").getString(),
                   cfg.get("url").getString(),
                   cfg.get("user").getString(),
                   cfg.get("password").getString(),
                   "");

           return db;
        }
    }
}