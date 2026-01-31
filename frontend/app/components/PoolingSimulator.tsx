"use client";
import { useState } from 'react';

// Re-define the Ship interface for this component
interface Ship {
  ship_id: string;
  ship_type: string;
  Compliance_Status: string;
  Compliance_Balance: number;
}

// Define Props: This component expects a list of Ships named 'fleet'
interface PoolingProps {
  fleet: Ship[];
}

export default function PoolingSimulator({ fleet }: PoolingProps) {
  // These states can be a Ship object OR null (if nothing is selected)
  const [shipA, setShipA] = useState<Ship | null>(null);
  const [shipB, setShipB] = useState<Ship | null>(null);

  const calculatePool = () => {
    if (!shipA || !shipB) return "0.00";
    
    return (shipA.Compliance_Balance + shipB.Compliance_Balance).toFixed(2);
  };

  const poolTotal = parseFloat(calculatePool());

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-8">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Pooling Arbitrage Simulator</h2>
      <p className="text-sm text-slate-500 mb-6">
          Pair a high-emitting vessel (Deficit) with a low-emitting vessel (Surplus) to check combined compliance.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Dropdown 1: Deficit Vessel */}
        <div className="flex-1">
            <label className="block text-xs font-bold mb-2 text-red-600 uppercase">Select Deficit Vessel</label>
            <select onChange={(e) => setShipA(fleet.find(s => s.ship_id === e.target.value) || null)} 
                    className="w-full p-3 border border-red-200 rounded bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700">
            <option value="">-- Select Vessel --</option>
            {fleet.filter(s => s.Compliance_Status === 'Deficit').map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {s.ship_id} ({Number(s.Compliance_Balance).toFixed(1)})
                </option>
            ))}
            </select>
        </div>

        {/* Dropdown 2: Surplus Vessel */}
        <div className="flex-1">
            <label className="block text-xs font-bold mb-2 text-green-600 uppercase">Select Surplus Vessel</label>
            <select onChange={(e) => setShipB(fleet.find(s => s.ship_id === e.target.value) || null)}
                    className="w-full p-3 border border-green-200 rounded bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700">
            <option value="">-- Select Vessel --</option>
            {fleet.filter(s => s.Compliance_Status === 'Surplus').map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {s.ship_id} (+{Number(s.Compliance_Balance).toFixed(1)})
                </option>
            ))}
            </select>
        </div>
      </div>

      {/* Result Display */}
      {shipA && shipB && (
          <div className={`p-6 rounded-xl text-center border-2 transition-all duration-500 ${
            poolTotal >= 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
          }`}>
            <h3 className={`text-3xl font-bold ${poolTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Balance: {poolTotal}
            </h3>
            <p className="font-semibold mt-2 text-slate-700">
                {poolTotal >= 0 
                    ? "POOL COMPLIANT: No penalties required." 
                    : "POOL NON-COMPLIANT: Additional credits needed."}
            </p>
          </div>
      )}
    </div>
  );
}