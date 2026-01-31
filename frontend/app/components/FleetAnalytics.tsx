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
  GHG_Intensity: number;
}

interface Props {
  fleet: Ship[];
  darkMode?: boolean;
}

export default function FleetAnalytics({ fleet, darkMode = false }: Props) {
  
  const totalShips = fleet.length;
  // Calculate Fleet Average Intensity (gCO2/MJ)
  const totalIntensity = fleet.reduce((sum, ship) => sum + (ship.GHG_Intensity || 0), 0);
  const avgIntensity = totalShips > 0 ? (totalIntensity / totalShips).toFixed(2) : "0.00";
  
  const surplusCount = fleet.filter(s => s.Compliance_Status === 'Surplus').length;
  const deficitCount = fleet.filter(s => s.Compliance_Status === 'Deficit').length;
  const complianceRate = totalShips > 0 ? ((surplusCount / totalShips) * 100).toFixed(1) : "0.0";

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
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Fleet Analytics</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real-time compliance metrics and risk distribution</p>
        </div>
      </div>

    {/* --- NEW KPI CARDS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Card 1: Fleet Average Intensity (The "Deep Research" Metric) */}
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Avg Intensity</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{avgIntensity}</h3>
            <span className="text-xs font-medium text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">gCO2/MJ</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Target: &lt; 89.34 gCO2/MJ</p>
        </div>

        {/* Card 2: Compliance Rate */}
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Compliance Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{complianceRate}%</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(complianceRate) > 80 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              Of Fleet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{surplusCount} Compliant Vessels</p>
        </div>

        {/* Card 3: Critical Risks */}
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Critical Liability</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{deficitCount}</h3>
            <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Vessels</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Requires immediate action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* CHART 1: Compliance Overview (Pie) */}
      <div className={`p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`text-sm font-bold uppercase mb-4 text-center tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Fleet Compliance Ratio</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
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
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: darkMode ? '#94a3b8' : '#64748b' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Risk by Vessel Type (Grouped Bar) */}
      <div className={`p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <h3 className={`text-sm font-bold uppercase mb-4 text-center tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Risk by Vessel Type</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: darkMode ? '#94a3b8' : '#64748b'}} interval={0} />
              <YAxis tick={{fill: darkMode ? '#94a3b8' : '#64748b'}} />
              <Tooltip 
                cursor={{fill: darkMode ? 'rgba(51, 65, 85, 0.5)' : 'transparent'}} 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  color: darkMode ? '#e2e8f0' : '#1e293b'
                }}
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