from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Constants
LCV_FACTORS = {
    'HFO': 40.2,    # MJ/kg
    'Diesel': 42.7, # MJ/kg
}

# Load Artifacts
try:
    model = joblib.load("model.pkl")
    # Load the regulatory target calculated during training
    target_2026 = joblib.load("target.pkl") 
    print(f"Model loaded. 2026 Target: {target_2026:.2f} gCO2/MJ")
except Exception as e:
    print(f"Warning: Artifacts not found. {e}")
    target_2026 = 89.34 # Fallback default if file missing

@app.get("/")
def root():
    return {"message": "Strategic Navigator API", "status": "Active"}


# Fleet Data Endpoint
@app.get("/api/fleet")
def get_fleet_compliance():
    try:
        df = pd.read_csv("compliance_data.csv")
        df = df.fillna("")
        return df.to_dict(orient="records")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Run train_model.py first to generate data.")

# Prediction Eendpoint
class ShipInput(BaseModel):
    ship_type: str
    distance: float
    fuel_consumption: float
    fuel_type: str

@app.post("/api/predict")
def predict_co2(ship: ShipInput):
    # Predict Raw CO2 (Using ML Model)
    # Note: The model expects specific columns. Ensure these match X_train columns.
    input_data = pd.DataFrame([{
        'ship_type': ship.ship_type,
        'distance': ship.distance,
        'fuel_consumption': ship.fuel_consumption,
        'fuel_type': ship.fuel_type # Model likely uses this now
    }])
    
    try:
        predicted_co2_kg = model.predict(input_data)[0]
    except Exception as e:
        # Fallback if model fails (e.g., column mismatch)
        print(f"Prediction Error: {e}")
        return HTTPException(status_code=400, detail=str(e))

    # B. Calculate Energy (Physics)
    # Energy (MJ) = Fuel (kg) * LCV (MJ/kg)
    lcv = LCV_FACTORS.get(ship.fuel_type, 40.2) # Default to HFO if unknown
    energy_mj = ship.fuel_consumption * lcv

    # Calculate Intensity (Regulation)
    # Formula: (CO2_kg * 1000) / Energy_MJ = gCO2/MJ
    if energy_mj > 0:
        ghg_intensity = (predicted_co2_kg * 1000) / energy_mj
    else:
        ghg_intensity = 0

    # Determine the compliance status
    # Compare against the loaded target
    compliance_balance = target_2026 - ghg_intensity
    status = "Surplus" if compliance_balance > 0 else "Deficit"

    # Return the FULL package for the frontend
    return {
        "predicted_co2": round(predicted_co2_kg, 2),
        "ghg_intensity": round(ghg_intensity, 2),
        "compliance_status": status,
        "compliance_balance": round(compliance_balance, 2),
        "target_used": round(target_2026, 2)
    }