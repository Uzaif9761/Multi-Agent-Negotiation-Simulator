import React, { useState, useEffect } from "react";
import { MdChat, MdCheckCircle, MdCancel, MdTimer, MdTrendingUp, MdAccessTime } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const sparklineData = [
  { uv: 400 }, { uv: 300 }, { uv: 500 }, { uv: 200 }, { uv: 600 }
];

const GlassWidget = ({ icon, title, subtitle, colorClass }) => (
  <div className="relative overflow-hidden rounded-[24px] bg-white/40 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.15)] dark:bg-navy-800/40 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
    <div className="flex items-center gap-4">
      <div className={`flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white/50 shadow-sm dark:bg-navy-900/50 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h4 className="text-2xl font-extrabold text-navy-700 dark:text-white">{subtitle}</h4>
      </div>
    </div>
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${colorClass.includes('brand') ? 'bg-brand-500' : colorClass.includes('green') ? 'bg-green-500' : colorClass.includes('red') ? 'bg-red-500' : 'bg-orange-500'}`}></div>
  </div>
);

const Dashboard = () => {
  const [sims, setSims] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchSims = async () => {
      try {
        const res = await fetch("http://localhost:8000/negotiations/", { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        if (data.success && data.data) {
          const mappedSims = data.data.map(item => {
            const scenarioMap = {
              "vendor_pricing": "Vendor Pricing Negotiation",
              "job_offer": "Job Offer Negotiation",
              "budget_allocation": "Project Budget Allocation"
            };
            const agentsStr = `${item.buyer_agent_id || 'Buyer'} vs ${item.seller_agent_id || 'Supplier'}`;
            return {
              id: item._id,
              scenario: scenarioMap[item.scenario] || item.scenario,
              agents: agentsStr,
              outcome: item.status === "success" ? "Reached" : "Walk Away",
              rounds: item.history ? item.history.length : 0,
              date: new Date(item.created_at)
            };
          });
          setSims(mappedSims);

          // Build last 7 days chart data
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
             const d = new Date();
             d.setDate(d.getDate() - i);
             const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
             
             const simsOnDay = mappedSims.filter(s => {
                 return s.date.getDate() === d.getDate() && s.date.getMonth() === d.getMonth() && s.date.getFullYear() === d.getFullYear();
             });
             
             const successCount = simsOnDay.filter(s => s.outcome === "Reached").length;
             const failedCount = simsOnDay.filter(s => s.outcome === "Walk Away").length;
             
             last7Days.push({
                 name: dateStr,
                 success: successCount,
                 failed: failedCount
             });
          }
          setChartData(last7Days);
        }
      } catch (err) {
        console.error("Dashboard fetch err:", err);
      }
    };
    fetchSims();
    
    // Auto-refresh the dashboard every 5 seconds so it feels "live"
    const interval = setInterval(fetchSims, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalSims = sims.length;
  const dealsReached = sims.filter(s => s.outcome === "Reached").length;
  const walkAways = sims.filter(s => s.outcome === "Walk Away").length;
  
  const totalRounds = sims.reduce((acc, curr) => acc + curr.rounds, 0);
  const avgRounds = totalSims > 0 ? (totalRounds / totalSims).toFixed(1) : "0";

  const recentActivity = sims.slice(0, 5); 

  return (
    <div className="relative z-10 w-full overflow-hidden pb-10">
      
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-400/10 blur-[100px] pointer-events-none dark:bg-brand-400/5"></div>
      <div className="absolute top-40 right-1/4 h-64 w-64 rounded-full bg-teal-400/10 blur-[80px] pointer-events-none dark:bg-teal-400/5"></div>

      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 relative z-20">
         <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-navy-700 dark:text-white">
              Welcome to STRIVE AI
            </h2>
            <p className="mt-2 text-lg text-gray-600 font-medium">AI-Driven Multi-Agent Negotiation Training & Simulation Platform</p>
         </div>
         <Link to="/admin/scenarios" className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-brand-600 to-brand-400 px-8 py-4 text-base font-bold text-white shadow-[0_8px_20px_-6px_rgba(66,42,251,0.5)] transition-all hover:scale-105 hover:shadow-[0_12px_25px_-6px_rgba(66,42,251,0.6)]">
            <span>Start Simulation</span>
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/20"></div>
            </div>
         </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-20">
        <GlassWidget icon={<MdChat className="h-7 w-7" />} title="Total Simulations" subtitle={totalSims} colorClass="text-brand-500 dark:text-brand-400" />
        <GlassWidget icon={<MdCheckCircle className="h-7 w-7" />} title="Deals Reached" subtitle={dealsReached} colorClass="text-green-500 dark:text-green-400" />
        <GlassWidget icon={<MdCancel className="h-7 w-7" />} title="Walk Aways" subtitle={walkAways} colorClass="text-red-500 dark:text-red-400" />
        <GlassWidget icon={<MdTimer className="h-7 w-7" />} title="Avg Rounds" subtitle={avgRounds} colorClass="text-orange-500 dark:text-orange-400" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3 relative z-20">
         <div className="xl:col-span-2 rounded-[24px] bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10 dark:shadow-none">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-extrabold text-navy-700 dark:text-white flex items-center gap-2">
                  <MdTrendingUp className="text-brand-500 dark:text-brand-400" /> Success Rate Overview
                </h4>
                <p className="text-sm font-medium text-gray-500">Last 7 days of simulation outcomes</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" />
                  <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFailed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="xl:col-span-1 rounded-[24px] bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10 dark:shadow-none">
            <h4 className="text-xl font-extrabold text-navy-700 dark:text-white mb-6">Recent Activity</h4>
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                
                {recentActivity.length === 0 && (
                    <p className="text-sm text-gray-500 font-medium text-center mt-4">No recent simulations found.</p>
                )}

                {recentActivity.map((activity, idx) => (
                    <div key={activity.id || idx} className="group flex justify-between items-center rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-navy-900 border border-transparent hover:border-gray-200 dark:hover:border-navy-700">
                        <div className="flex-1">
                            <h5 className="font-bold text-navy-700 dark:text-white truncate max-w-[140px]" title={activity.scenario}>{activity.scenario.replace(' Negotiation', '')}</h5>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">{activity.agents}</p>
                        </div>
                        <div className="h-10 w-12 opacity-50 group-hover:opacity-100 transition-opacity hidden sm:block shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                              <Line type="monotone" dataKey="uv" stroke={activity.outcome === "Reached" ? "#22c55e" : "#ef4444"} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-right shrink-0 ml-2 flex flex-col items-end">
                            <span className={`block text-sm font-bold ${activity.outcome === "Reached" ? 'text-green-500' : 'text-red-500'}`}>{activity.outcome}</span>
                            <Link to={`/admin/reports?id=${activity.id}`} className="text-xs font-bold text-brand-500 dark:text-brand-400 hover:underline mt-1">View Report</Link>
                        </div>
                    </div>
                ))}
                
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
