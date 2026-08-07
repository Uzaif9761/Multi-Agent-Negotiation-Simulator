import React, { useState, useEffect } from "react";
import { MdSettings, MdSmartToy, MdPlayArrow, MdPerson } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const scenarios = {
  "Vendor Pricing Negotiation": {
    agent1: { role: "Buyer", title: "Procurement Manager", target: 8000, limit: 9000, prompt: "You are a strict procurement manager. Do not reveal your reservation price immediately. Negotiate in Indian Rupees (₹).", strategy: "Collaborative (Win-Win)" },
    agent2: { role: "Supplier", title: "Sales Director", target: 11000, limit: 8500, prompt: "You are an assertive sales director. Push for higher margins and anchor high. Negotiate in Indian Rupees (₹).", strategy: "Assertive (Win-Lose)" }
  },
  "Job Offer Negotiation": {
    agent1: { role: "Candidate", title: "Software Engineer", target: 2500000, limit: 2000000, prompt: "You are an experienced software engineer seeking a competitive salary. Negotiate in Indian Rupees (₹).", strategy: "Collaborative (Win-Win)" },
    agent2: { role: "Hiring Manager", title: "VP of Engineering", target: 2200000, limit: 2600000, prompt: "You want to hire the candidate but must strictly stick to the budget. Negotiate in Indian Rupees (₹).", strategy: "Assertive (Win-Lose)" }
  },
  "Project Budget Allocation": {
    agent1: { role: "Marketing Dept", title: "Head of Marketing", target: 5000000, limit: 3000000, prompt: "You need budget for an aggressive Q3 campaign. Negotiate in Indian Rupees (₹).", strategy: "Collaborative (Win-Win)" },
    agent2: { role: "Engineering Dept", title: "Head of Engineering", target: 8000000, limit: 6000000, prompt: "You need budget for server infrastructure and new hires. Negotiate in Indian Rupees (₹).", strategy: "Assertive (Win-Lose)" }
  }
};

const Setup = () => {
  const location = useLocation();
  const [mode, setMode] = useState("Simulation");
  const [scenario, setScenario] = useState(location.state?.selectedScenario || "Vendor Pricing Negotiation");
  
  // Controlled configuration state
  const [config, setConfig] = useState(scenarios[scenario]);

  useEffect(() => {
    setConfig(scenarios[scenario]);
  }, [scenario]);

  const updateAgent1 = (field, value) => {
    setConfig(prev => ({
        ...prev,
        agent1: { ...prev.agent1, [field]: value }
    }));
  };

  const updateAgent2 = (field, value) => {
    setConfig(prev => ({
        ...prev,
        agent2: { ...prev.agent2, [field]: value }
    }));
  };

  return (
    <div className="mt-8 w-full relative z-10 pb-10">
      <div className="absolute -top-10 -left-10 h-96 w-96 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none dark:bg-brand-400/5"></div>
      
      <div className="mb-10 flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-extrabold text-navy-700 dark:text-white flex items-center gap-3">
                <MdSettings className="text-brand-500" /> Scenario Configuration
            </h2>
            <p className="mt-1 text-base text-gray-500">Select your mode and fine-tune your agents before launching.</p>
        </div>
        <Link to="/admin/arena" state={{ mode, scenario, config }} className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-emerald-400 px-8 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(34,197,94,0.5)] transition-all hover:scale-105">
            <MdPlayArrow className="text-xl" />
            <span>Launch Arena</span>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 relative z-20">
        <div className="rounded-[28px] bg-white/60 p-6 backdrop-blur-2xl shadow-sm border border-white/50 dark:bg-navy-800/60 dark:border-white/10">
          <label className="text-sm font-bold text-navy-700 dark:text-white mb-3 block">Simulation Mode</label>
          <div className="flex bg-gray-100 dark:bg-navy-900 rounded-xl p-1 relative">
             <button onClick={() => setMode("Simulation")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all z-10 ${mode === "Simulation" ? 'bg-white text-brand-500 shadow-sm dark:bg-navy-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Simulation (AI vs AI)</button>
             <button onClick={() => setMode("Practice")} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all z-10 ${mode === "Practice" ? 'bg-white text-brand-500 shadow-sm dark:bg-navy-800 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>Practice (You vs AI)</button>
          </div>
          <p className="mt-3 text-xs font-medium text-gray-500">
             {mode === "Simulation" ? "Watch two independent AI agents negotiate with each other." : "Take control of Agent 1 and practice negotiating against the Agent 2 AI."}
          </p>
        </div>

        <div className="rounded-[28px] bg-white/60 p-6 backdrop-blur-2xl shadow-sm border border-white/50 dark:bg-navy-800/60 dark:border-white/10">
          <label className="text-sm font-bold text-navy-700 dark:text-white mb-3 block">Negotiation Template</label>
          <select value={scenario} onChange={(e) => setScenario(e.target.value)} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-bold text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm">
              <option value="Vendor Pricing Negotiation">Vendor Pricing Negotiation</option>
              <option value="Job Offer Negotiation">Job Offer Negotiation</option>
              <option value="Project Budget Allocation">Project Budget Allocation</option>
          </select>
          <p className="mt-3 text-xs font-medium text-gray-500">
             Templates required by project brief.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 relative z-20">
        
        {/* Agent 1 Configuration */}
        <div className={`relative overflow-hidden rounded-[28px] bg-white/60 p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10 ${mode === 'Practice' ? 'opacity-70' : ''}`}>
          <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-brand-500/10 dark:bg-brand-400/10"></div>
          
          <div className="mb-6 flex items-start gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-navy-900 text-3xl text-brand-500 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-navy-700 shrink-0">
                {mode === 'Practice' ? <MdPerson /> : <MdSmartToy />}
             </div>
             <div className="w-full flex flex-col justify-center h-14">
                 <h4 className="text-2xl font-extrabold text-navy-700 dark:text-white">Agent 1: {config.agent1.role} {mode === 'Practice' ? '(You)' : ''}</h4>
                 <p className="text-sm font-medium text-brand-500 dark:text-brand-400">{config.agent1.title}</p>
             </div>
          </div>

          <div className="flex flex-col gap-5">
             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Negotiation Strategy</label>
                <select value={config.agent1.strategy} onChange={(e) => updateAgent1('strategy', e.target.value)} disabled={mode === 'Practice'} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm disabled:opacity-50">
                    <option value="Collaborative (Win-Win)">Collaborative (Win-Win)</option>
                    <option value="Assertive (Win-Lose)">Assertive (Win-Lose)</option>
                    <option value="Compromising">Compromising</option>
                    <option value="Accommodating">Accommodating</option>
                </select>
             </div>
             
             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Starting Target</label>
                <input type="number" value={config.agent1.target} onChange={(e) => updateAgent1('target', Number(e.target.value))} disabled={mode === 'Practice'} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm disabled:opacity-50" />
             </div>

             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Reservation Price - Walk Away</label>
                <input type="number" value={config.agent1.limit} onChange={(e) => updateAgent1('limit', Number(e.target.value))} disabled={mode === 'Practice'} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm disabled:opacity-50" />
             </div>

             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Custom Prompt Instructions</label>
                <textarea rows={3} value={config.agent1.prompt} onChange={(e) => updateAgent1('prompt', e.target.value)} disabled={mode === 'Practice'} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm custom-scrollbar disabled:opacity-50" />
             </div>
          </div>
        </div>

        {/* Agent 2 Configuration */}
        <div className="relative overflow-hidden rounded-[28px] bg-white/60 p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-orange-500/10 dark:bg-orange-400/10"></div>
          
          <div className="mb-6 flex items-start gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-navy-900 text-3xl text-orange-500 shadow-sm border border-orange-100 dark:border-navy-700 shrink-0">
                <MdSmartToy />
             </div>
             <div className="w-full flex flex-col justify-center h-14">
                 <h4 className="text-2xl font-extrabold text-navy-700 dark:text-white">Agent 2: {config.agent2.role}</h4>
                 <p className="text-sm font-medium text-orange-500">{config.agent2.title}</p>
             </div>
          </div>

          <div className="flex flex-col gap-5">
             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Negotiation Strategy</label>
                <select value={config.agent2.strategy} onChange={(e) => updateAgent2('strategy', e.target.value)} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm">
                    <option value="Collaborative (Win-Win)">Collaborative (Win-Win)</option>
                    <option value="Assertive (Win-Lose)">Assertive (Win-Lose)</option>
                    <option value="Compromising">Compromising</option>
                    <option value="Accommodating">Accommodating</option>
                </select>
             </div>
             
             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Starting Target</label>
                <input type="number" value={config.agent2.target} onChange={(e) => updateAgent2('target', Number(e.target.value))} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm" />
             </div>

             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Reservation Price - Walk Away</label>
                <input type="number" value={config.agent2.limit} onChange={(e) => updateAgent2('limit', Number(e.target.value))} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm" />
             </div>

             <div>
                <label className="text-sm font-bold text-navy-700 dark:text-white mb-2 block">Custom Prompt Instructions</label>
                <textarea rows={3} value={config.agent2.prompt} onChange={(e) => updateAgent2('prompt', e.target.value)} className="w-full rounded-xl border-none bg-gray-50/50 p-4 text-sm font-medium text-navy-700 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-orange-500 dark:bg-navy-900/50 dark:text-white dark:ring-navy-700 backdrop-blur-sm custom-scrollbar" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Setup;
