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

    // ✅ Get your COMPLETE keys from ImageKit Dashboard
    // Go to: https://imagekit.io/dashboard → Developer Options
    private static final String PUBLIC_KEY = "public_bWdjRxQuoMIqt0tKK3WOlBoTwwA=";
    private static final String PRIVATE_KEY = "private_rnkvr81huNfGgF5hhGzDp9L2GgU=";
    private static final String IMAGEKIT_ID = "mplaafdnv";

    public String uploadImage(MultipartFile file, String fileName) throws Exception {
        String auth = PUBLIC_KEY + ":" + PRIVATE_KEY;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        String boundary = "Boundary-" + System.currentTimeMillis();
        String url = "https://upload.imagekit.io/api/v1/files/upload";

        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Authorization", "Basic " + encodedAuth);
        connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        connection.setDoOutput(true);

        try (OutputStream outputStream = connection.getOutputStream()) {
            // Write file part
            outputStream.write(("--" + boundary + "\r\n").getBytes());
            outputStream.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n").getBytes());
            outputStream.write(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes());
            outputStream.write(file.getBytes());
            outputStream.write(("\r\n--" + boundary + "--\r\n").getBytes());
            outputStream.flush();
        }

        int responseCode = connection.getResponseCode();

        if (responseCode == 200) {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode responseJson = mapper.readTree(connection.getInputStream());
            String imageUrl = responseJson.get("url").asText();
            System.out.println("✅ ImageKit upload success: " + imageUrl);
            return imageUrl;
        } else {
            // Read error response
            String errorMsg = "";
            try (java.util.Scanner scanner = new java.util.Scanner(connection.getErrorStream()).useDelimiter("\\A")) {
                errorMsg = scanner.hasNext() ? scanner.next() : "";
            }
            System.err.println("❌ ImageKit upload failed: " + responseCode + " - " + errorMsg);
            throw new RuntimeException("Upload failed: " + responseCode);
        }
    }
}