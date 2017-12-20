package jtsql.utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

public class FileUtil {
    public static String readAll(String filepath) {
        return readAll(new File(filepath));
    }

    public static String readAll(File file) {
        StringBuilder result = new StringBuilder();
        try {
            BufferedReader reader = new BufferedReader(new FileReader(file));//构造一个BufferedReader类来读取文件
            String s = null;
            while ((s = reader.readLine()) != null) {//使用readLine方法，一次读一行
                result.append(s + "\r\n");
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result.toString();
    }
}
