# JtSQL
JtSQL = javascript + sql + 模板理念，粘成一种创意脚本。定位为数据库的批处理或定时任务。<br />
<br />
特别说明：<br />
使用$<db::...>，在Js里嵌入SQL脚本<br />
使用{{...}}，在SQL里嵌入Js脚本<br />
<br />
运行说明：<br />
1.启动运行时模式：<br />
1.1.运行：java -jar jtsql.jar<br />
1.2.输入：//把写好的脚本粘贴进去...<br />
1.3.输入：;;; <br />

2.批处理运行模式：<br />
运行：java -jar jtsql.jar /data/a/a.jt.sql<br />
<br />
3.引入自己的项目：<br />
把源码：JtSqlEngine 放到自己的项目里，随便弄：）<br />
<br />
