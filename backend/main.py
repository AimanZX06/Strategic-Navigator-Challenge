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

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Strategic Navigator API",
        "endpoints": {
            "fleet_data": "/api/fleet",
            "predict_co2": "/api/predict"
        }
    }

# Load Model
try:
    model = joblib.load("model.pkl")
except:
    print("Warning: model.pkl not found.")

# Serve the Compliance Data
@app.get("/api/fleet")
def get_fleet_compliance():
    try:
        # Load the pre-calculated data
        df = pd.read_csv("compliance_data.csv")
        # Handle NaN values (replace with 0 or empty string) to prevent JSON errors
        df = df.fillna("")
        return df.to_dict(orient="records")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Run train_model.py first.")

# Prediction Endpoint
class ShipInput(BaseModel):
    ship_type: str
    distance: float
    fuel_consumption: float

@app.post("/api/predict")
def predict_co2(ship: ShipInput):
    input_df = pd.DataFrame([ship.model_dump()])
    prediction = model.predict(input_df)[0]
    return {"predicted_co2": prediction}