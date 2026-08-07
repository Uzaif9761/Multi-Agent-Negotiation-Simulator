import React, { useState, useEffect } from "react";
import { MdDownload, MdCheckCircle, MdCancel, MdTrendingUp, MdSwapHoriz } from "react-icons/md";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from "recharts";
import { useLocation } from "react-router-dom";

const Reports = () => {
  const location = useLocation();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        let id = searchParams.get('id');
        
        if (!id) {
            const resAll = await fetch("http://localhost:8000/negotiations/", { cache: 'no-store' });
            const allData = await resAll.json();
            if (allData.success && allData.data && allData.data.length > 0) {
                id = allData.data[0]._id;
            } else {
                setLoading(false);
                return;
            }
        }

        const res = await fetch(`http://localhost:8000/negotiations/${id}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.data) {
            setReportData(data.data);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [location]);

  if (loading) {
      return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            <p className="mt-4 font-bold text-gray-500 tracking-widest uppercase text-sm">Generating Report...</p>
        </div>
      );
  }

  if (!reportData) {
      return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center">
            <p className="font-bold text-gray-500 text-lg">No simulation data found.</p>
            <p className="text-gray-400">Please run a negotiation first.</p>
        </div>
      );
  }

  const scenarioMap = {
      "vendor_pricing": "Vendor Pricing Negotiation",
      "job_offer": "Job Offer Negotiation",
      "budget_allocation": "Project Budget Allocation"
  };
  const title = scenarioMap[reportData.scenario] || reportData.scenario;
  
  const buyerRole = reportData.buyer_agent_id || "Buyer";
  const sellerRole = reportData.seller_agent_id || "Supplier";
  
  const history = reportData.history || [];
  const rounds = history.length;
  
  const initialBuyerOffer = history[0]?.buyer_offer || 0;
  const initialSellerOffer = history[0]?.seller_counter_offer || 0;
  const initialGap = Math.abs(initialBuyerOffer - initialSellerOffer);
  
  const isSuccess = reportData.status === "success";
  
  const finalBuyerOffer = history[rounds - 1]?.buyer_offer || 0;
  const finalSellerOffer = history[rounds - 1]?.seller_counter_offer || 0;
  const finalGap = isSuccess ? 0 : Math.abs(finalBuyerOffer - finalSellerOffer);
  
  const lineData = history.map(r => ({
      name: `Round ${r.round_number}`,
      [buyerRole]: r.buyer_offer,
      [sellerRole]: r.seller_counter_offer
  }));
  
  const dateStr = new Date(reportData.created_at).toLocaleString('en-GB', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});

  const minVal = Math.min(...history.map(h => Math.min(h.buyer_offer || 9999999, h.seller_counter_offer || 9999999))) * 0.9;
  const maxVal = Math.max(...history.map(h => Math.max(h.buyer_offer || 0, h.seller_counter_offer || 0))) * 1.1;

  const currencySymbol = title.includes("Pricing") || title.includes("Budget") ? "₹" : "";

  return (
    <div className="w-full relative z-10 pb-10 print:pb-0 print:bg-white text-navy-700 dark:text-white">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none dark:bg-brand-400/5 print:hidden"></div>
      <div className="absolute top-40 left-0 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px] pointer-events-none dark:bg-teal-400/5 print:hidden"></div>

      {/* Action Bar */}
      <div className="mb-8 flex items-center justify-between relative z-20 print:hidden mt-4">
        <div>
            <h2 className="text-3xl font-extrabold flex items-center gap-3">
                 AI Simulation Report
            </h2>
            <p className="mt-1 text-sm text-gray-500 font-medium">Clean, modern summary of the negotiation.</p>
        </div>
        <button onClick={() => window.print()} className="group relative flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-navy-700 shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all dark:bg-navy-800 dark:border-white/10 dark:text-white dark:hover:bg-navy-700">
            <MdDownload className="text-lg text-brand-500 dark:text-brand-400" />
            <span>Download PDF</span>
        </button>
      </div>

      {/* Main Report Container - Glassmorphism */}
      <div className="mx-auto w-full max-w-5xl rounded-[32px] bg-white/70 p-8 md:p-12 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/60 dark:bg-navy-900/70 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] print:shadow-none print:border-none print:bg-white print:p-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-white/10 pb-4 mb-4 print:pb-2 print:mb-4">
            <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-brand-500 dark:from-brand-400 to-teal-400 bg-clip-text text-transparent mb-2">STRIVE AI</h1>
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400">{title}</h2>
            </div>
            <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Simulation ID: {reportData._id.slice(-8).toUpperCase()}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dateStr}</p>
            </div>
        </div>

        {/* Status Hero Card */}
        <div className={`relative overflow-hidden rounded-3xl p-6 mb-6 print:p-4 print:mb-4 border transition-all ${isSuccess ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:from-green-900/30 dark:to-emerald-900/20 dark:border-green-500/20' : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200 dark:from-red-900/30 dark:to-rose-900/20 dark:border-red-500/20'}`}>
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/40 blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`flex items-center justify-center h-12 w-12 rounded-full mb-2 shadow-sm ${isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isSuccess ? <MdCheckCircle className="text-2xl" /> : <MdCancel className="text-2xl" />}
                </div>
                <h3 className={`text-xl font-black uppercase tracking-widest mb-1 ${isSuccess ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {isSuccess ? 'Agreement Reached' : 'Walk Away'}
                </h3>
                
                {isSuccess ? (
                    <>
                        <span className="text-5xl print:text-4xl font-black text-navy-700 dark:text-white drop-shadow-sm my-1">
                            {currencySymbol}{reportData.final_offer.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-500 mt-1">Final Agreed Deal</span>
                    </>
                ) : (
                    <>
                        <span className="text-4xl print:text-3xl font-black text-navy-700 dark:text-white drop-shadow-sm my-2">
                            NO DEAL
                        </span>
                        <span className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 mt-1">Reservation Limits Exceeded</span>
                    </>
                )}
            </div>
        </div>

        {/* Modern Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-4 print:gap-2">
            <div className="rounded-2xl bg-white/50 p-4 print:p-2 border border-gray-100 dark:bg-navy-800/50 dark:border-white/5 text-center shadow-sm">
                <span className="block text-2xl print:text-xl font-black text-navy-700 dark:text-white mb-0.5">{rounds}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">Total Rounds</span>
            </div>
            <div className="rounded-2xl bg-white/50 p-4 print:p-2 border border-gray-100 dark:bg-navy-800/50 dark:border-white/5 text-center shadow-sm">
                <span className="block text-2xl print:text-xl font-black text-navy-700 dark:text-white mb-0.5">{currencySymbol}{initialGap.toLocaleString('en-IN')}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400">Initial Gap</span>
            </div>
            <div className="rounded-2xl bg-white/50 p-4 print:p-2 border border-gray-100 dark:bg-navy-800/50 dark:border-white/5 text-center shadow-sm">
                <span className="block text-2xl print:text-xl font-black text-navy-700 dark:text-white mb-0.5">{currencySymbol}{Math.abs(initialBuyerOffer - finalBuyerOffer).toLocaleString('en-IN')}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-blue-500">{buyerRole} Movement</span>
            </div>
            <div className="rounded-2xl bg-white/50 p-4 print:p-2 border border-gray-100 dark:bg-navy-800/50 dark:border-white/5 text-center shadow-sm">
                <span className="block text-2xl print:text-xl font-black text-navy-700 dark:text-white mb-0.5">{currencySymbol}{Math.abs(initialSellerOffer - finalSellerOffer).toLocaleString('en-IN')}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">{sellerRole} Movement</span>
            </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8 print:mb-4">
            <h3 className="text-lg print:text-base font-black uppercase tracking-widest text-navy-700 dark:text-white mb-4 print:mb-2 flex items-center gap-2">
                <MdTrendingUp className="text-brand-500 dark:text-brand-400 text-2xl print:text-xl" /> Offer Convergence
            </h3>
            <div className="h-[280px] print:h-[240px] w-full rounded-3xl bg-white p-4 print:p-2 border border-gray-100 shadow-sm dark:bg-navy-800 dark:border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 'bold'}} domain={[minVal, maxVal]} tickFormatter={(val) => val.toLocaleString('en-IN')} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', fontWeight: 'bold' }} 
                        />
                        <Legend wrapperStyle={{fontSize: '13px', fontWeight: 'bold', paddingTop: '15px'}} />
                        <Line name={buyerRole} type="monotone" dataKey={buyerRole} stroke="#3b82f6" strokeWidth={4} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                        <Line name={sellerRole} type="monotone" dataKey={sellerRole} stroke="#f97316" strokeWidth={4} dot={{r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-3xl bg-brand-50/50 p-6 print:p-4 border border-brand-100 dark:bg-brand-900/20 dark:border-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-brand-400/10 rounded-full blur-2xl"></div>
            <h3 className="text-sm print:text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2 flex items-center gap-2">
                <MdSwapHoriz className="text-xl print:text-lg" /> AI Negotiation Summary
            </h3>
            <p className="text-navy-700 dark:text-gray-300 text-base print:text-sm leading-relaxed font-medium relative z-10">
                {reportData.message || `The agents successfully resolved the initial gap of ${currencySymbol}${initialGap.toLocaleString('en-IN')} over ${rounds} rounds of competitive bidding.`}
            </p>
        </div>

      </div>
    </div>
  );
};

export default Reports;
