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
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setShipType("Oil Service Boat");
        setDistance("");
        setFuel("");
        setPrediction(null);
        setError(null);
    };

    const handlePredict = async () => {
        // Basic validation
        if (!distance || !fuel) {
            setError("Please enter both distance and fuel consumption.");
            return;
        }

        setLoading(true);
        setPrediction(null);
        setError(null);

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
            setError("Failed to connect to Model. Is the backend running?");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-8 mb-12">

            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl text-slate-800 font-bold">Voyage Planner</h2>
                {(distance || fuel || prediction) && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>
                )}
            </div>

            <p className="text-slate-500 mb-8">
                Plan a future trip and use the Random Forest model to predict your CO2 liability.
            </p>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Input 1: Ship Type */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-600 uppercase">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        Ship Type
                    </label>
                    <select 
                        value={shipType} 
                        onChange={(e) => setShipType(e.target.value)}
                        className="w-full p-4 text-base border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-400 text-slate-700 transition-all cursor-pointer font-medium"
                    >
                        <option value="Oil Service Boat">Oil Service Boat</option>
                        <option value="Fishing Trawler">Fishing Trawler</option>
                        <option value="Surfer Boat">Surfer Boat</option>
                        <option value="Tanker Ship">Tanker Ship</option>
                    </select>
                </div>

                {/* Input 2: Distance */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-600 uppercase">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Distance (NM)
                    </label>
                    <input 
                        type="number" 
                        value={distance} 
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full p-4 text-base border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-slate-700 transition-all font-medium placeholder:text-slate-400"
                        placeholder="e.g. 1500" 
                    />
                </div>

                {/* Input 3: Fuel */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3 text-slate-600 uppercase">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        Fuel Consumption (kg)
                    </label>
                    <input 
                        type="number" 
                        value={fuel} 
                        onChange={(e) => setFuel(e.target.value)}
                        className="w-full p-4 text-base border-2 border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 text-slate-700 transition-all font-medium placeholder:text-slate-400"
                        placeholder="e.g. 5000" 
                    />
                </div>
            </div>

            {/* Predict Button */}
            <button 
                onClick={handlePredict} 
                disabled={loading}
                className={`mt-8 w-full font-bold py-4 rounded-xl transition-colors duration-200 text-lg ${loading
                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 animate-spin\" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating Emissions...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        
                        Predict CO2 Emissions
                    </span>
                )}
            </button>

            {/* Result Box */}
            {prediction !== null && (
                <div className="mt-8 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 text-center shadow-inner">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 rounded-full mb-4">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <p className="text-emerald-700 text-sm font-semibold uppercase tracking-wider">Projected Emission Impact</p>
                    </div>
                    <p className="text-6xl font-bold text-emerald-700 mt-2 mb-2 tracking-tight">
                        {prediction.toFixed(2)}
                    </p>
                    <span className="text-emerald-600 text-sm font-bold uppercase tracking-widest">
                        Kilograms of CO₂
                    </span>
                    
                    {/* Additional context */}
                    <div className="mt-6 pt-6 border-t border-emerald-200 grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400 mb-1">Ship Type</p>
                            <p className="font-semibold text-slate-700">{shipType}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Distance</p>
                            <p className="font-semibold text-slate-700">{distance} NM</p>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Fuel Used</p>
                            <p className="font-semibold text-slate-700">{fuel} kg</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}