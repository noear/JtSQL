package jtsql.utils;

import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;


import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Created by yuety on 2017/7/18.
 */
public class HttpUtil {
    public static String getString(String url, Map<String,String> header)throws IOException {
        HttpClient client = HttpClients.createDefault();

        HttpGet http = new HttpGet(url);

        if (header != null) {
            header.forEach((k, v) -> {
                http.addHeader(k, v);
            });
        }

        HttpEntity entity = client.execute(http).getEntity();

        return EntityUtils.toString(entity, "utf-8");
    }

    public static String postString(String url, List<NameValuePair> params, Map<String,String> header) throws IOException {
        HttpClient client = HttpClients.createDefault();
        HttpPost http = new HttpPost(url);

        if (header != null) {
            header.forEach((k, v) -> {
                http.addHeader(k, v);
            });
        }

        http.setEntity(new UrlEncodedFormEntity(params, "utf-8"));
        HttpEntity entity = client.execute(http).getEntity();

        return EntityUtils.toString(entity, "utf-8");
    }
}
