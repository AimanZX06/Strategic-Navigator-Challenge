import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
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

# Split data (80% train, 20% test) to validate properly
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Preprocessing pipeline
preprocessor = ColumnTransformer(transformers=[
    ('num', 'passthrough', ['distance', 'fuel_consumption']),
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['ship_type'])
])

model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=500, min_samples_leaf=2, random_state=42, n_jobs=-1))
])

# Train
print("Training Random Forest Model...")
model.fit(X_train, y_train)


# 7. Validate Model
# Make predictions on the Test Set
y_pred = model.predict(X_test)

# Calculate Scores
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print("\n" + "="*40)
print("MODEL VALIDATION REPORT")
print("="*40)
print(f"R² Score (Accuracy): {r2:.4f}  (Target: > 0.90)")
print(f"Mean Absolute Error: {mae:.2f} kg  (Avg error per trip)")
print("-" * 40)


# 8. Feature Importance (Proof of Logic)

# Extract the internal logic to see what matters most
rf_model = model.named_steps['regressor']
preprocessor_step = model.named_steps['preprocessor']

# Get feature names from the OneHotEncoder
cat_features = preprocessor_step.named_transformers_['cat'].get_feature_names_out()
all_features = ['distance', 'fuel_consumption'] + list(cat_features)

print("Feature Importance(What drives CO2?)")
for name, importance in zip(all_features, rf_model.feature_importances_):
    print(f"   • {name}: {importance:.4f}")
print("="*40 + "\n")

# 9. Save Artifacts
joblib.dump(model, 'model.pkl')
joblib.dump(target_2026, 'target.pkl')
# Save the AGGREGATED ship-level compliance data (unique ship_id per row)
ship_df.to_csv('compliance_data.csv', index=False)
print("Model, Target, and Compliance Data saved.")
print(f"compliance_data.csv now has {len(ship_df)} unique vessels (no duplicates).")