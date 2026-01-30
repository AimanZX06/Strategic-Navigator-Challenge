import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# 1. Load Data from data folder
try:
    df = pd.read_csv('../data/mindx test dataset.csv')
    print("Data loaded successfully.")
except FileNotFoundError:
    print("Error: 'mindx test dataset.csv' not found in data/ folder.")
    exit()

# 2. Aggregate by Ship (Annual totals per vessel)
# Each ship has multiple voyages - we need ONE compliance status per vessel
ship_df = df.groupby('ship_id').agg({
    'ship_type': 'first',           # Ship type stays the same
    'CO2_emissions': 'sum',         # Total annual CO2 emissions
    'distance': 'sum',              # Total annual distance
    'fuel_consumption': 'sum',      # Total annual fuel consumption
}).reset_index()

print(f"Aggregated {len(df)} voyages into {len(ship_df)} unique vessels.")

# 3. GHG Intensity Calculation (per vessel)
# Formula: Total CO2 emissions / Total Distance
ship_df['GHG_Intensity'] = ship_df['CO2_emissions'] / ship_df['distance']

# 4. Regulatory Benchmarking
# Target is 5% lower than fleet average
avg_intensity = ship_df['GHG_Intensity'].mean()
target_2026 = avg_intensity * 0.95
print(f"2026 Target Intensity: {target_2026}")

# 5. Compliance Balance
# Identify "Surplus" vessels (below target) and "Deficit" vessels (above target)
ship_df['Compliance_Status'] = ship_df['GHG_Intensity'].apply(
    lambda x: 'Surplus' if x < target_2026 else 'Deficit'
)

# Calculate compliance balance (positive = surplus, negative = deficit)
ship_df['Compliance_Balance'] = target_2026 - ship_df['GHG_Intensity']

# Summary statistics
surplus_count = (ship_df['Compliance_Status'] == 'Surplus').sum()
deficit_count = (ship_df['Compliance_Status'] == 'Deficit').sum()
print(f"Surplus Vessels: {surplus_count}, Deficit Vessels: {deficit_count}")

# 6. Predictive Model (train on voyage-level data for predictions)
X = df[['ship_type', 'distance', 'fuel_consumption']]
y = df['CO2_emissions']

# Preprocessing pipeline
preprocessor = ColumnTransformer(transformers=[
    ('num', 'passthrough', ['distance', 'fuel_consumption']),
    ('cat', OneHotEncoder(), ['ship_type'])
])

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=50, random_state=42))
])

model.fit(X, y)

# 7. Save Artifacts
joblib.dump(model, 'model.pkl')
joblib.dump(target_2026, 'target.pkl')
# Save the AGGREGATED ship-level compliance data (unique ship_id per row)
ship_df.to_csv('compliance_data.csv', index=False)
print("Model, Target, and Compliance Data saved.")
print(f"compliance_data.csv now has {len(ship_df)} unique vessels (no duplicates).")