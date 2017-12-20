package jtsql;

import jtsql.core.JtSqlEngine;
import jtsql.utils.FileUtil;
import jtsql.utils.LogUtil;
import org.apache.http.util.TextUtils;

import java.util.Scanner;

public class App {
    private static JtSqlEngine engine;

    public static void main(String[] args) {
        engine = new JtSqlEngine();

        if (args != null && args.length > 0) {
            System.out.println(args[0]);
            String code = FileUtil.readAll(args[0]);
            System.out.println(code);

            doExec(code);
        }else{
            while (true) {
                String code = getInputString();

                if("exit".equals(code)){
                    break;
                }

                doExec(code);
            }
        }
    }

    private static String getInputString() {
        Scanner s = new Scanner(System.in);
        System.out.println("please enter code:");

        StringBuilder sb = new StringBuilder();

        while (true) {
            String line = s.nextLine();
            if (line.equals(";;;")) {
                break;
            }
            sb.append(line + "\r\n");
        }

        return sb.toString();
    }


    private static void doExec(String code) {
        if (TextUtils.isEmpty(code)) {
            LogUtil.write("error", "no code!!!");
            return;
        }

        try {
            engine.exec(code);
        } catch (Exception ex) {
            LogUtil.write("error", engine.last_sql());
            ex.printStackTrace();
        }
    }
}
