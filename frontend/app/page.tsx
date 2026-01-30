"use client";
import { useEffect, useState } from 'react';
import PoolingSimulator from './components/PoolingSimulator';

// 1. Define the Shape of a Ship
// This tells what data to expect from the API
export interface Ship {
  ship_id: string;
  ship_type: string;
  route_id: string;
  Compliance_Status: string;
  Compliance_Balance: number;
}

export default function Home() {
  // 2. Tell 'fleet' is a list of 'Ship' objects
  const [fleet, setFleet] = useState<Ship[]>([]);

  useEffect(() => {
    // Fetch data from your FastAPI backend
    fetch('http://127.0.0.1:8000/api/fleet')
      .then((res) => res.json())
      .then((data) => setFleet(data))
      .catch(err => console.error("API Error:", err));
  }, []);

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">MindX Strategic Navigator</h1>
      
      {/* Fleet Liability Map */}
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Fleet Liability Map</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* We map through the first 9 ships to keep the UI clean */}
        {fleet.slice(0, 9).map((ship, index) => (
          <div key={index} className={`p-4 rounded-lg shadow border-l-4 ${
            ship.Compliance_Status === 'Deficit' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
          }`}>
            <h3 className="font-bold text-lg text-slate-900">{ship.ship_id}</h3>
            <p className="text-sm text-gray-600">Type: {ship.ship_type}</p>
            <div className="mt-2 flex justify-between items-center">
                {/* Badge for Status */}
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    ship.Compliance_Status === 'Deficit' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                }`}>
                    {ship.Compliance_Status}
                </span>
                {/* Balance Number */}
                <span className="text-xs font-mono text-slate-500">
                    {Number(ship.Compliance_Balance).toFixed(2)}
                </span>
            </div>
          </div>
        ))}
      </div>

      {/* TASK B.2: Pooling Simulator Component */}
      <PoolingSimulator fleet={fleet} />
    </main>
  );
}