# JtSQL
JtSQL = javascript + sql + 模板理念，粘成一种创意脚本。定位为数据库的批处理或定时任务。

特别说明：
使用$<db::...>，在Js里嵌入SQL脚本
使用{{...}}，在SQL里嵌入Js脚本

运行说明：
1.启动运行时模式：
1.1.运行：java -jar jtsql.jar
1.2.输入：//把写好的脚本粘贴进去...
1.3.输入：;;; 

2.批处理运行模式：
运行：java -jar jtsql.jar /data/a/a.jt.sql

3.引入自己的项目：
把源码：JtSqlEngine 放到自己的项目里，随便弄：）

