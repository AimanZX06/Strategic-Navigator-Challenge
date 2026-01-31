"use client";
import { useState } from 'react';

export default function VoyagePlanner() {
    // Input States
    const [shipType, setShipType] = useState("Oil Service Boat");
    const [distance, setDistance] = useState("");
    const [fuel, setFuel] = useState("");

    // Output State
    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        // Basic validation
        if (!distance || !fuel) {
            alert("Please enter both distance and fuel consumption.");
            return;
        }

        setLoading(true);
        setPrediction(null); // Reset previous result

        try {
            // 1. Send data to Python Backend
            const res = await fetch('http://127.0.0.1:8000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ship_type: shipType,
                    distance: parseFloat(distance),
                    fuel_consumption: parseFloat(fuel)
                }),
            });

            if (!res.ok) throw new Error("API Request Failed");

            // 2. Get the Result
            const data = await res.json();
            setPrediction(data.predicted_co2);
        } catch (err) {
            console.error(err);
            alert("Failed to connect to Model. Is the backend running?");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl text-black font-bold">Voyage Planner</h2>
            </div>

            <p className="text-sm text-black mb-6">
                Plan a future trip and use the Random Forest model to predict your CO2 liability.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input 1: Ship Type */}
                <div>
                    <label className="block text-xs font-bold mb-2 text-black uppercase tracking-wider">Ship Type</label>
                    <select value={shipType} onChange={(e) => setShipType(e.target.value)}
                        className="w-full p-3 rounded bg-white border border-black-600 focus:border-black text-black outline-none">
                        <option value="Oil Service Boat">Oil Service Boat</option>
                        <option value="Fishing Trawler">Fishing Trawler</option>
                        <option value="Surfer Boat">Surfer Boat</option>
                        <option value="Tanker Ship">Tanker Ship</option>
                    </select>
                </div>

                {/* Input 2: Distance */}
                <div>
                    <label className="block text-xs font-bold mb-2 text-black uppercase tracking-wider">Distance (NM)</label>
                    <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)}
                        className="w-full p-3 rounded bg-white border border-black-600 focus:border-black text-black outline-none placeholder-black-500"
                        placeholder="e.g. 1500" />
                </div>

                {/* Input 3: Fuel */}
                <div>
                    <label className="block text-xs font-bold mb-2 text-black uppercase tracking-wider">Fuel Consumption (kg)</label>
                    <input type="number" value={fuel} onChange={(e) => setFuel(e.target.value)}
                        className="w-full p-3 rounded bg-white border border-black-600 focus:border-black text-black outline-none placeholder-black-500"
                        placeholder="e.g. 50" />
                </div>
            </div>

            {/* Predict Button */}
            <button onClick={handlePredict} disabled={loading}
                className={`mt-6 w-full font-bold py-4 rounded transition-all text-lg shadow-lg ${loading
                    ? "bg-slate-600 cursor-not-allowed text-slate-400"
                    : "bg-blue-600 hover:bg-cyan-500 text-white"
                    }`}>
                {loading ? "Calculating Emissions..." : "Predict CO2 Emissions"}
            </button>

            {/* Result Box */}
            {prediction !== null && (

                <div className="mt-8 p-6 bg-slate rounded-xl border border-cyan text-center animate-pulse-once">
                    <p className="text-black text-sm font-semibold uppercase">Projected Emission Impact</p>
                    <p className="text-5xl font-bold text-black mt-3 mb-1">
                        {prediction.toFixed(2)}
                    </p>
                    {/* "Units" removed. We now call it an Index or Score. */}
                    <span className="text-black text-sm font-bold uppercase tracking-widest">
                        Kilogram of CO2
                    </span>
                </div>

            )}
        </div>
    );
}