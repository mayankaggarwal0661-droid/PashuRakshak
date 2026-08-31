package com.livestockguard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.livestockguard.dto.NearbyVet;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Looks up real, currently-operating veterinary businesses near a point
 * using the Google Places API, so the "Find a vet" page works for a public
 * deployment without anyone manually typing every clinic into the database.
 *
 * Requires a Google Cloud project with the Places API enabled and a key
 * with billing set up (Google's free monthly credit comfortably covers a
 * hackathon demo's traffic). Set it as googlemaps.api-key in
 * application.properties. If it's left blank, isConfigured() returns
 * false and the controller responds with an empty, clearly-labeled
 * result instead of erroring — the rest of the app still works with
 * manually-added vets in the meantime.
 *
 * Uses the JDK's built-in java.net.http.HttpClient rather than adding a
 * new HTTP library dependency, since Spring's web starter doesn't ship
 * with a general-purpose outbound client.
 */
@Service
public class GooglePlacesService {

    private final String apiKey;
    private final int radiusMeters;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GooglePlacesService(
            @Value("${googlemaps.api-key:}") String apiKey,
            @Value("${googlemaps.places.radius-meters:15000}") int radiusMeters) {
        this.apiKey = apiKey;
        this.radiusMeters = radiusMeters;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public List<NearbyVet> findNearbyVets(double lat, double lng) {
        List<NearbyVet> results = new ArrayList<>();
        if (!isConfigured()) return results;

        try {
            String url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
                    + "?location=" + lat + "," + lng
                    + "&radius=" + radiusMeters
                    + "&type=veterinary_care"
                    + "&key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode root = objectMapper.readTree(response.body());

            String status = root.path("status").asText();
            if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                throw new GooglePlacesException("Google Places returned status " + status
                        + (root.has("error_message") ? ": " + root.path("error_message").asText() : ""));
            }

            for (JsonNode place : root.path("results")) {
                NearbyVet vet = new NearbyVet();
                vet.name = place.path("name").asText(null);
                vet.address = place.path("vicinity").asText(null);
                vet.latitude = place.path("geometry").path("location").path("lat").asDouble();
                vet.longitude = place.path("geometry").path("location").path("lng").asDouble();
                vet.placeId = place.path("place_id").asText(null);
                vet.mapsUrl = vet.placeId != null
                        ? "https://www.google.com/maps/place/?q=place_id:" + vet.placeId
                        : null;
                vet.rating = place.has("rating") ? place.path("rating").asDouble() : null;
                vet.openNow = place.path("opening_hours").has("open_now")
                        ? place.path("opening_hours").path("open_now").asBoolean()
                        : null;
                results.add(vet);
            }
            return results;

        } catch (IOException | InterruptedException e) {
            throw new GooglePlacesException("Could not reach Google Places API", e);
        }
    }

    public java.util.Optional<NearbyVet> findClosestVet(double lat, double lng) {
        if (!isConfigured()) return java.util.Optional.empty();
        try {
            // rankby=distance returns results ordered nearest-first, but Google
            // requires omitting `radius` when using it.
            String url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
                    + "?location=" + lat + "," + lng
                    + "&rankby=distance"
                    + "&type=veterinary_care"
                    + "&key=" + apiKey;

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode root = objectMapper.readTree(response.body());

            String status = root.path("status").asText();
            if ("ZERO_RESULTS".equals(status)) return java.util.Optional.empty();
            if (!"OK".equals(status)) {
                throw new GooglePlacesException("Google Places returned status " + status);
            }

            JsonNode first = root.path("results").get(0);
            if (first == null) return java.util.Optional.empty();

            NearbyVet vet = new NearbyVet();
            vet.name = first.path("name").asText(null);
            vet.address = first.path("vicinity").asText(null);
            vet.latitude = first.path("geometry").path("location").path("lat").asDouble();
            vet.longitude = first.path("geometry").path("location").path("lng").asDouble();
            vet.placeId = first.path("place_id").asText(null);
            vet.mapsUrl = vet.placeId != null
                    ? "https://www.google.com/maps/place/?q=place_id:" + vet.placeId
                    : null;
            return java.util.Optional.of(vet);

        } catch (IOException | InterruptedException e) {
            throw new GooglePlacesException("Could not reach Google Places API", e);
        }
    }

    public static class GooglePlacesException extends RuntimeException {
        public GooglePlacesException(String message) { super(message); }
        public GooglePlacesException(String message, Throwable cause) { super(message, cause); }
    }
}
