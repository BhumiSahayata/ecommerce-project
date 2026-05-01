package com.ecommerce.ecommerce_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

@Service
public class ImageKitService {

    private static final String PRIVATE_KEY = "private_1QffJIHHJKcbkAo5XEqXsDt/y/M=";

    public String uploadImage(MultipartFile file, String fileName) {
        try {
            String url = "https://upload.imagekit.io/api/v1/files/upload";

            // ✅ CREATE CONNECTION FIRST
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();

            connection.setRequestMethod("POST");
            connection.setDoOutput(true);

            // ✅ AUTH AFTER CONNECTION CREATED
            String auth = PRIVATE_KEY + ":";
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            connection.setRequestProperty("Authorization", "Basic " + encodedAuth);

            String boundary = "Boundary-" + System.currentTimeMillis();
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (OutputStream outputStream = connection.getOutputStream()) {

                // fileName
                outputStream.write(("--" + boundary + "\r\n").getBytes());
                outputStream.write(("Content-Disposition: form-data; name=\"fileName\"\r\n\r\n").getBytes());
                outputStream.write((fileName + "\r\n").getBytes());

                // file
                outputStream.write(("--" + boundary + "\r\n").getBytes());
                outputStream.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n").getBytes());
                outputStream.write(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes());
                outputStream.write(file.getBytes());
                outputStream.write("\r\n".getBytes());

                outputStream.write(("--" + boundary + "--\r\n").getBytes());
                outputStream.flush();
            }

            int responseCode = connection.getResponseCode();

            if (responseCode == 200) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode responseJson = mapper.readTree(connection.getInputStream());

                // ✅ THIS IS YOUR IMAGEKIT URL
                String imageUrl = responseJson.get("url").asText();

                System.out.println("Image uploaded: " + imageUrl); // debug

                return imageUrl;

            } else {
                throw new RuntimeException("Upload failed: " + responseCode);
            }

        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
    }
}