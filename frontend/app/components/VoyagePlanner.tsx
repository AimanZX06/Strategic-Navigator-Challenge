"use client";
import { useState } from 'react';

interface VoyagePlannerProps {
    darkMode?: boolean;
}

// Define the shape of the response from the backend
interface PredictionResult {
    predicted_co2: number;
    ghg_intensity: number;
    compliance_status: string;
    compliance_balance: number;
    target_used: number; // Added to match the backend response
}

export default function VoyagePlanner({ darkMode = false }: VoyagePlannerProps) {
    // Input States
    const [shipType, setShipType] = useState("Oil Service Boat");
    const [distance, setDistance] = useState("");
    const [fuel, setFuel] = useState("");
    const [fuelType, setFuelType] = useState("HFO");

    // Output State
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setShipType("Oil Service Boat");
        setDistance("");
        setFuel("");
        setFuelType("HFO");
        setResult(null);
        setError(null);
    };

    const handlePredict = async () => {
        // Basic validation
        if (!distance || !fuel) {
            setError("Please enter both distance and fuel consumption.");
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            // 1. Send data to Python Backend
            const res = await fetch('http://127.0.0.1:8000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ship_type: shipType,
                    distance: parseFloat(distance),
                    fuel_consumption: parseFloat(fuel),
                    fuel_type: fuelType 
                }),
            });

            if (!res.ok) throw new Error("API Request Failed");

            // 2. Get the Result
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError("Failed to connect to Model. Is the backend running?");
        }
        setLoading(false);
    };

    return (
        <div className={`p-8 rounded-2xl shadow-xl border mt-8 mb-12 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>

            <div className="flex items-center justify-between mb-2">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Voyage Planner</h2>
                {(distance || fuel || result) && (
                    <button
                        onClick={handleReset}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>
                )}
            </div>

            <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Predict FuelEU Maritime compliance for a future voyage using the Random Forest model.
            </p>

            {/* Error Message */}
            {error && (
                <div className={`mb-6 p-4 border rounded-xl flex items-center gap-3 ${darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'}`}>
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Input 1: Ship Type */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        Ship Type
                    </label>
                    <select 
                        value={shipType} 
                        onChange={(e) => setShipType(e.target.value)}
                        className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all cursor-pointer font-medium ${darkMode ? 'border-slate-600 bg-slate-700 focus:ring-amber-900 focus:border-amber-500 text-slate-200' : 'border-slate-200 bg-slate-50/50 focus:ring-amber-100 focus:border-amber-400 text-slate-700'}`}
                    >
                        <option value="Oil Service Boat">Oil Service Boat</option>
                        <option value="Fishing Trawler">Fishing Trawler</option>
                        <option value="Surfer Boat">Surfer Boat</option>
                        <option value="Tanker Ship">Tanker Ship</option>
                    </select>
                </div>

                {/* Input 2: Fuel Type */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                        Fuel Type
                    </label>
                    <select 
                        value={fuelType} 
                        onChange={(e) => setFuelType(e.target.value)}
                        className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all cursor-pointer font-medium ${darkMode ? 'border-slate-600 bg-slate-700 focus:ring-pink-900 focus:border-pink-500 text-slate-200' : 'border-slate-200 bg-slate-50/50 focus:ring-pink-100 focus:border-pink-400 text-slate-700'}`}
                    >
                        <option value="HFO">Heavy Fuel Oil (HFO)</option>
                        <option value="Diesel">Marine Diesel (MDO)</option>
                    </select>
                </div>

                {/* Input 3: Distance */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Distance (NM)
                    </label>
                    <input 
                        type="number" 
                        value={distance} 
                        onChange={(e) => setDistance(e.target.value)}
                        className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${darkMode ? 'border-slate-600 bg-slate-700 focus:ring-blue-900 focus:border-blue-500 text-slate-200 placeholder:text-slate-500' : 'border-slate-200 bg-slate-50/50 focus:ring-blue-100 focus:border-blue-400 text-slate-700 placeholder:text-slate-400'}`}
                        placeholder="e.g. 1500" 
                    />
                </div>

                {/* Input 4: Fuel Amount */}
                <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        Fuel (kg)
                    </label>
                    <input 
                        type="number" 
                        value={fuel} 
                        onChange={(e) => setFuel(e.target.value)}
                        className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${darkMode ? 'border-slate-600 bg-slate-700 focus:ring-purple-900 focus:border-purple-500 text-slate-200 placeholder:text-slate-500' : 'border-slate-200 bg-slate-50/50 focus:ring-purple-100 focus:border-purple-400 text-slate-700 placeholder:text-slate-400'}`}
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
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating Compliance...
                    </span>
                ) : (
                    "Predict Compliance"
                )}
            </button>

            {/* Result Box */}
            {result && (
                <div className={`mt-8 p-8 rounded-2xl border-2 shadow-inner ${
                    result.compliance_status === 'Surplus' 
                    ? (darkMode ? 'bg-emerald-900/30 border-emerald-700' : 'bg-green-50 border-green-200')
                    : (darkMode ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200')
                }`}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        
                        {/* 1. Total CO2 */}
                        <div className="text-center md:text-left">
                             <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Emissions</p>
                             <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                {result.predicted_co2.toFixed(0)} <span className="text-lg font-medium text-slate-400">kg</span>
                             </p>
                        </div>

                        {/* 2. GHG Intensity (THE KEY METRIC) */}
                        <div className="text-center p-4 rounded-xl border border-dashed border-slate-300">
                             <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>GHG Intensity</p>
                             <div className="flex items-baseline justify-center gap-1">
                                <p className={`text-4xl font-bold ${result.compliance_status === 'Surplus' ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.ghg_intensity.toFixed(2)}
                                </p>
                                {/* OLD UNIT: gCO2/MJ (Commented Out) */}
                                {/* <span className="text-sm font-bold text-slate-500">gCO2/MJ</span> */}

                                {/* NEW UNIT: kg/nm */}
                                <span className="text-sm font-bold text-slate-500">kg/NM</span>
                             </div>
                             <p className="text-xs text-slate-400 mt-1">Target: &lt; {result.target_used}</p>
                        </div>

                        {/* 3. Compliance Status */}
                        <div className="text-center md:text-right">
                             <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                                 result.compliance_status === 'Surplus' 
                                 ? 'bg-green-100 text-green-700' 
                                 : 'bg-red-100 text-red-700'
                             }`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${
                                    result.compliance_status === 'Surplus' ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                                <span className="font-bold uppercase">{result.compliance_status}</span>
                             </div>
                             <p className={`text-sm mt-2 font-mono ${result.compliance_status === 'Surplus' ? 'text-green-600' : 'text-red-600'}`}>
                                 Balance: {result.compliance_balance > 0 ? '+' : ''}{result.compliance_balance.toFixed(2)}
                             </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}