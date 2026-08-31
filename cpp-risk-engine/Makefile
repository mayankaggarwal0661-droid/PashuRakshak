CXX = g++
CXXFLAGS = -O2 -std=c++17 -Wall

all: risk_engine

risk_engine: risk_engine.cpp
	$(CXX) $(CXXFLAGS) -o risk_engine risk_engine.cpp

test: risk_engine
	echo '{"species":"cattle","ageMonths":24,"vaccinated":true,"daysSinceOnset":2,"nearbyActiveCases":3,"symptoms":["fever","nasal_discharge","lameness"]}' | ./risk_engine

clean:
	rm -f risk_engine

.PHONY: all test clean
