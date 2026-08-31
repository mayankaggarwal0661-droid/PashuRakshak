package com.livestockguard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestockguard.dto.ImageAnalysisRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Looks at a photo of a sick animal and returns a plain-language read on
 * what's visible — NOT a diagnosis. This calls Anthropic's Claude API
 * (a vision-capable model) directly, since actually interpreting an
 * uploaded photo needs a real vision model; no amount of rule-based logic
 * in this codebase can look at pixels.
 *
 * Requires your own Anthropic API key (console.anthropic.com), billed
 * per request. Set anthropic.api-key in application.properties. If left
 * blank, isConfigured() returns false and the frontend disables the
 * photo-analysis UI instead of erroring.
 *
 * The model is asked to return strict JSON matching a fixed shape so the
 * backend can parse it reliably: whether the photo is usable, what's
 * visible, possible conditions with rough likelihoods, general supportive
 * first-aid care, and a disclaimer. All of this is advisory, framed the
 * same way as the rest of the app: decision support, not a diagnosis.
 */
@Service
public class ImageDiagnosisService {

    private final String apiKey;
    private final String model;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
        You are assisting a village animal-health field worker in India who has photographed a
        sick or injured farm animal. You are NOT a veterinarian and this is NOT a diagnosis —
        it is a preliminary visual read to help the worker decide urgency and what to tell a vet.

        Respond with ONLY a single JSON object (no markdown, no prose outside the JSON) with
        exactly this shape:
        {
          "imageUsable": boolean,
          "retakeMessage": string or null,   // if imageUsable is false, a short plain-language reason and what to do (e.g. "The photo is too blurry to see the affected area clearly — please retake it in good light, closer to the affected spot.")
          "visibleSigns": [string],          // short phrases describing what you can actually see, e.g. "swelling on the left hind leg", "discharge around the nostrils". Empty array if imageUsable is false.
          "possibleConditions": [ { "name": string, "likelihood": "low"|"medium"|"high", "description": string } ], // at most 3, empty if imageUsable is false or nothing notable is visible
          "firstAid": [string],              // general, safe, non-prescription supportive care steps to do while arranging a vet visit (e.g. "keep the animal in a clean, dry, shaded area", "ensure access to clean water") — never suggest specific drug names or dosages
          "disclaimer": string               // one sentence reminding the reader this is not a diagnosis and a vet visit is needed to confirm
        }

        Be conservative: if the photo doesn't clearly show anything diagnostically useful, say so in
        imageUsable/retakeMessage rather than guessing. Never invent medication names or dosages under
        any circumstance — firstAid must stay to general supportive care only.
        """;

    public ImageDiagnosisService(
            @Value("${anthropic.api-key:}") String apiKey,
            @Value("${anthropic.model:claude-sonnet-5}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public Map<String, Object> analyze(ImageAnalysisRequest request) {
        if (!isConfigured()) {
            throw new ImageDiagnosisException("Photo analysis is not configured (missing anthropic.api-key).");
        }

        try {
            Map<String, Object> imageBlock = Map.of(
                    "type", "image",
                    "source", Map.of(
                            "type", "base64",
                            "media_type", request.getMediaType(),
                            "data", request.getImageBase64()
                    )
            );
            String userText = "Species: " + (request.getSpecies() == null ? "unspecified" : request.getSpecies())
                    + ". Analyze this photo of the animal per your instructions.";
            Map<String, Object> textBlock = Map.of("type", "text", "text", userText);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", model);
            body.put("max_tokens", 1000);
            body.put("system", SYSTEM_PROMPT);
            body.put("messages", List.of(Map.of(
                    "role", "user",
                    "content", List.of(imageBlock, textBlock)
            )));

            String requestJson = objectMapper.writeValueAsString(body);

            HttpRequest httpRequest = HttpRequest.newBuilder(URI.create("https://api.anthropic.com/v1/messages"))
                    .timeout(Duration.ofSeconds(30))
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode root = objectMapper.readTree(response.body());

            if (root.has("error")) {
                throw new ImageDiagnosisException("Claude API error: " + root.path("error").path("message").asText());
            }

            String text = root.path("content").get(0).path("text").asText();
            // Model is instructed to return only JSON, but strip code fences defensively.
            text = text.trim();
            if (text.startsWith("```")) {
                text = text.replaceAll("^```(json)?", "").replaceAll("```$", "").trim();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(text, Map.class);
            return parsed;

        } catch (IOException | InterruptedException e) {
            throw new ImageDiagnosisException("Could not reach the photo analysis service", e);
        }
    }

    public static class ImageDiagnosisException extends RuntimeException {
        public ImageDiagnosisException(String message) { super(message); }
        public ImageDiagnosisException(String message, Throwable cause) { super(message, cause); }
    }
}
