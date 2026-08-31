package com.livestockguard.dto;

import java.util.List;
import java.util.Map;

/** Mirrors the JSON printed by cpp-risk-engine/risk_engine on stdout. */
public class RiskEngineResult {
    public double riskScore;
    public String riskLevel;
    public List<String> flaggedSymptoms;
    public String recommendation;
    public String explanation;
    public List<Map<String, Object>> possibleDiseases;
}
