package com.ecommerce.ecommerce_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

@Service
public class ImageKitService {

    @Value("${IMAGEKIT_PRIVATE_KEY}")
    private String privateKey;

    public String uploadImage(MultipartFile file, String fileName) {

        try {

            String apiUrl = "https://upload.imagekit.io/api/v1/files/upload";

            HttpURLConnection connection =
                    (HttpURLConnection) new URL(apiUrl).openConnection();

            connection.setRequestMethod("POST");
            connection.setDoOutput(true);

            String auth = privateKey + ":";

            String encodedAuth =
                    Base64.getEncoder().encodeToString(auth.getBytes());

            connection.setRequestProperty(
                    "Authorization",
                    "Basic " + encodedAuth
            );

            String boundary = "Boundary-" + System.currentTimeMillis();

            connection.setRequestProperty(
                    "Content-Type",
                    "multipart/form-data; boundary=" + boundary
            );

            try (OutputStream outputStream = connection.getOutputStream()) {

                // fileName
                outputStream.write(("--" + boundary + "\r\n").getBytes());
                outputStream.write(
                        ("Content-Disposition: form-data; name=\"fileName\"\r\n\r\n")
                                .getBytes()
                );
                outputStream.write((fileName + "\r\n").getBytes());

                // file
                outputStream.write(("--" + boundary + "\r\n").getBytes());

                outputStream.write(
                        ("Content-Disposition: form-data; name=\"file\"; filename=\"" +
                                fileName + "\"\r\n").getBytes()
                );

                outputStream.write(
                        ("Content-Type: " + file.getContentType() + "\r\n\r\n")
                                .getBytes()
                );

                outputStream.write(file.getBytes());

                outputStream.write("\r\n".getBytes());

                outputStream.write(("--" + boundary + "--\r\n").getBytes());

                outputStream.flush();
            }

            int responseCode = connection.getResponseCode();

            InputStream responseStream =
                    (responseCode >= 200 && responseCode < 300)
                            ? connection.getInputStream()
                            : connection.getErrorStream();

            ObjectMapper mapper = new ObjectMapper();

            JsonNode responseJson = mapper.readTree(responseStream);

            System.out.println("ImageKit Response: " + responseJson);

            if (responseCode == 200) {

                return responseJson.get("url").asText();

            } else {

                throw new RuntimeException(
                        "Image upload failed: " + responseJson.toString()
                );
            }

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Image upload failed: " + e.getMessage()
            );
        }
    }
}