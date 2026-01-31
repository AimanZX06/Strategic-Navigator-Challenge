"use client";
import { useState, useMemo } from 'react';

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
  isLoading?: boolean;
}

export default function PoolingSimulator({ fleet, isLoading = false }: PoolingProps) {
  // These states can be a Ship object OR null (if nothing is selected)
  const [shipA, setShipA] = useState<Ship | null>(null);
  const [shipB, setShipB] = useState<Ship | null>(null);
  // Memoized filtered lists for performance
  const deficitShips = useMemo(() => 
    fleet.filter(s => s.Compliance_Status === 'Deficit'), [fleet]
  );
  const surplusShips = useMemo(() => 
    fleet.filter(s => s.Compliance_Status === 'Surplus'), [fleet]
  );
  const calculatePool = () => {
    if (!shipA || !shipB) return "0.00";
    
    return (shipA.Compliance_Balance + shipB.Compliance_Balance).toFixed(2);
  };

  const poolTotal = parseFloat(calculatePool());

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mt-8">
      <h2 className="text-xl text-black font-bold mb-4">Pooling Arbitrage Simulator</h2>
      <p className="text-sm text-black mb-6">
          Pair a high-emitting vessel (Deficit) with a low-emitting vessel (Surplus) to check combined compliance.
      </p>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Dropdown 1: Deficit Vessel */}
        <div className="flex-1">
            <label 
              id="deficit-label" 
              htmlFor="deficit-select" 
              className="block text-xs font-bold mb-2 text-red-600 uppercase"
            >
              Select Deficit Vessel
            </label>
            <select 
              id="deficit-select"
              aria-labelledby="deficit-label"
              aria-describedby="deficit-help"
              disabled={isLoading || deficitShips.length === 0}
              onChange={(e) => setShipA(fleet.find(s => s.ship_id === e.target.value) || null)} 
              className="w-full p-3 border border-red-200 rounded bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{isLoading ? 'Loading...' : deficitShips.length === 0 ? 'No deficit vessels' : '-- Select Vessel --'}</option>
              {deficitShips.map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {s.ship_id} ({Number(s.Compliance_Balance).toFixed(1)})
                </option>
              ))}
            </select>
            <p id="deficit-help" className="sr-only">Select a vessel with negative compliance balance</p>
        </div>

        {/* Dropdown 2: Surplus Vessel */}
        <div className="flex-1">
            <label 
              id="surplus-label" 
              htmlFor="surplus-select" 
              className="block text-xs font-bold mb-2 text-green-600 uppercase"
            >
              Select Surplus Vessel
            </label>
            <select 
              id="surplus-select"
              aria-labelledby="surplus-label"
              aria-describedby="surplus-help"
              disabled={isLoading || surplusShips.length === 0}
              onChange={(e) => setShipB(fleet.find(s => s.ship_id === e.target.value) || null)}
              className="w-full p-3 border border-green-200 rounded bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{isLoading ? 'Loading...' : surplusShips.length === 0 ? 'No surplus vessels' : '-- Select Vessel --'}</option>
              {surplusShips.map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {s.ship_id} (+{Number(s.Compliance_Balance).toFixed(1)})
                </option>
              ))}
            </select>
            <p id="surplus-help" className="sr-only">Select a vessel with positive compliance balance</p>
        </div>
      </div>

      {/* Result Display */}
      {shipA && shipB && (
          <div 
            role="alert"
            aria-live="polite"
            className={`p-6 rounded-xl text-center border-2 transition-all duration-500 ${
              poolTotal >= 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
            }`}
          >
            <h3 className={`text-3xl font-bold ${poolTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Balance: {poolTotal} kg/NM
            </h3>
            <p className="font-semibold mt-2 text-slate-700">
                {poolTotal >= 0 
                    ? "POOL COMPLIANT: No penalties required." 
                    : "POOL NON-COMPLIANT: Additional credits needed."}
            </p>
            {/* Detailed breakdown for transparency */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center gap-8 text-sm">
              <div>
                <span className="text-slate-500">Deficit Ship:</span>
                <span className="ml-2 font-mono text-red-600">{shipA.Compliance_Balance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Surplus Ship:</span>
                <span className="ml-2 font-mono text-green-600">+{shipB.Compliance_Balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}