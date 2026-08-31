package com.livestockguard.dto;

/** One veterinary business found via Google Places, not our own database. */
public class NearbyVet {
    public String name;
    public String address;
    public Double latitude;
    public Double longitude;
    public String placeId;
    public String mapsUrl;
    public Double rating;
    public Boolean openNow;
}
