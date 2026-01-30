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

# 2.GHG Intensity Calculation
# Formula: CO2 emissions / Distance
# NOTE: Using column names: 'CO2_emissions' and 'distance'
df['GHG_Intensity'] = df['CO2_emissions'] / df['distance']

# 3.Regulatory Benchmarking
# Target is 5% lower than dataset average
avg_intensity = df['GHG_Intensity'].mean()
target_2026 = avg_intensity * 0.95
print(f"2026 Target Intensity: {target_2026}")

# 4.Compliance Balance
# Identify "Surplus" vessels (below target) and "Deficit" vessels (above target)
df['Compliance_Status'] = df['GHG_Intensity'].apply(
    lambda x: 'Surplus' if x < target_2026 else 'Deficit'
)

# Calculate compliance balance (positive = surplus, negative = deficit)
df['Compliance_Balance'] = target_2026 - df['GHG_Intensity']

# Summary statistics
surplus_count = (df['Compliance_Status'] == 'Surplus').sum()
deficit_count = (df['Compliance_Status'] == 'Deficit').sum()
print(f"Surplus Vessels: {surplus_count}, Deficit Vessels: {deficit_count}")

# 5. Predictive Model
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

# 6. Save Artifacts
joblib.dump(model, 'model.pkl')
joblib.dump(target_2026, 'target.pkl')
# Save the compliance data so the API can read it easily
df.to_csv('compliance_data.csv', index=False)
print("Model, Target, and Compliance Data saved.")