package jtsql.utils;

public class LogUtil {
    public static void write(String tag, String content) {
        System.out.print(tag + "::");
        System.out.println(content);
    }

    public static void error(String tag, Exception ex) {

    }
}
