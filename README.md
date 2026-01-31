# MIND X Strategic Navigator Challenge
A prototype solution for minimizing the Total Cost of Compliance (TCC) for fleet managers


## Notes
**Constraint:** The provided dataset consisted entirely of HFO/Diesel vessels with near-identical chemical carbon intensity (~77 gCO2/MJ).
**Problem:** Applying the regulation's "5% reduction target" to **Energy Intensity (gCO2/MJ)** resulted in a **100% Fleet-Wide Deficit**, rendering the "Pooling Simulator" functional but useless (zero surplus vessels available to pool).
**Solution:** I pivoted the compliance logic to **Operational Intensity (kg CO2 / nm)**.
* **Why?** This isolates **propulsive efficiency** (Hull/Engine performance) rather than fuel chemistry.
* **Result:** This successfully distributed the fleet into "Surplus" (High Efficiency) and "Deficit" (Low Efficiency) categories, enabling the **Pooling Simulator** to demonstrate arbitrage opportunities while strictly adhering to the "5% reduction" rule.

----------

## Tech Stack
* **Backend / ML:** Python, FastAPI, Scikit-learn, Pandas, Joblib.
* **Frontend:** React (Next.js), Tailwind CSS, Recharts.
* **Data Analysis:** Jupyter Notebooks (`Analysis.ipynb`).

----------

## Features

### **Task A: The Compliance Engine (ML)**
* **Predictive Model:** A **Random Forest Regressor** trained to predict CO2 emissions based on Ship Type, Distance, and Fuel Consumption.
* **Robustness:** Utilizes `min_samples_leaf=2` and ensemble averaging (500 trees) to handle sensor noise and outliers effectively.
* **Regulatory Logic:** Automatically benchmarks vessels against a dynamic 2026 Target (5% reduction from fleet average).

### **Task B: Fleet Arbitrage Dashboard (Web)**
* **Liability Map:** Interactive visualization of fleet risk (Red = Deficit, Green = Surplus).
* **Pooling Simulator:** A "What-If" analysis tool allowing Fleet Managers to pair high-intensity vessels with low-intensity vessels to offset financial penalties.
* **Voyage Planner:** A predictive interface for estimating compliance status of future voyages.

### **Task C: Deep Research (Anomaly Detection)**
Detailed analysis is available in `backend/Analysis.ipynb`.

----------

## Setup Instructions

### **1. Backend Setup**
Navigate to the `backend` directory and set up the Python environment.

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Train the model & Generate Compliance Data
python train_model.py
# (Output: Artifacts 'model.pkl', 'target.pkl', and 'compliance_data.csv' are created)

# Start the API Server
uvicorn main:app --reload

```
The Backend runs on http://127.0.0.1:8000

### **2. Backend Setup**
Navigate to the `frontend` directory (or root if using Next.js root).

```bash
cd frontend
# Install dependencies
npm install

# Start the Development Server
npm run dev
```

The Dashboard runs on http://localhost:3000

## Model Performance
The Random Forest model was evaluated on a 20% holdout test set.
R² Score (Accuracy): 0.9950 (Target > 0.90)
Mean Absolute Error (MAE): 611.89 kg

Key Drivers: Fuel Consumption (Primary), Distance (Secondary).