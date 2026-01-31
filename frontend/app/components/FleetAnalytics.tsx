"use client";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Define colors
const COLORS = {
  surplus: '#22c55e', // Green
  deficit: '#ef4444', // Red
};

interface Ship {
  ship_id: string;
  ship_type: string;
  Compliance_Status: string;
}

interface Props {
  fleet: Ship[];
}

export default function FleetAnalytics({ fleet }: Props) {
  
  // --- CHART 1: Pie Chart Data (Surplus vs Deficit) ---
  const statusData = [
    { name: 'Surplus', value: fleet.filter(s => s.Compliance_Status === 'Surplus').length },
    { name: 'Deficit', value: fleet.filter(s => s.Compliance_Status === 'Deficit').length },
  ];

  // --- CHART 2: Bar Chart Data (Type vs Status) ---
  const typeMap = new Map();
  
  fleet.forEach(ship => {
    if (!typeMap.has(ship.ship_type)) {
      typeMap.set(ship.ship_type, { name: ship.ship_type, Surplus: 0, Deficit: 0 });
    }
    const entry = typeMap.get(ship.ship_type);
    if (ship.Compliance_Status === 'Surplus') entry.Surplus += 1;
    else entry.Deficit += 1;
  });
  
  const typeData = Array.from(typeMap.values());

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Fleet Analytics</h2>
      {/* CHANGED: grid-cols-2 so charts are wider and side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* CHART 1: Compliance Overview (Pie) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 text-center">Fleet Compliance Ratio</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.surplus} />
                <Cell fill={COLORS.deficit} />
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Risk by Vessel Type (Grouped Bar) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 text-center">Risk by Vessel Type</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
              <YAxis />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="Deficit" fill={COLORS.deficit} name="Deficit" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Surplus" fill={COLORS.surplus} name="Surplus" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      </div>
    </div>
  );
}