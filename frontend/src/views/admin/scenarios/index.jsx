import React from "react";
import { Link } from "react-router-dom";
import { MdBusinessCenter, MdShoppingCart, MdGavel, MdAdd } from "react-icons/md";

const Scenarios = () => {
  const scenariosList = [
    { id: 1, title: 'Vendor Pricing Negotiation', type: 'Buyer & Supplier', icon: <MdShoppingCart />, color: 'from-brand-500 to-purple-500', glow: 'shadow-[0_0_40px_rgba(139,92,246,0.3)]' },
    { id: 2, title: 'Job Offer Negotiation', type: 'Candidate & Hiring Manager', icon: <MdBusinessCenter />, color: 'from-blue-500 to-cyan-400', glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]' },
    { id: 3, title: 'Project Budget Allocation', type: 'Multiple Stakeholders', icon: <MdGavel />, color: 'from-orange-500 to-red-400', glow: 'shadow-[0_0_40px_rgba(249,115,22,0.3)]' },
  ];

  return (
    <div className="mt-8 w-full relative z-10 pb-10">
      <div className="absolute top-20 right-10 h-80 w-80 rounded-full bg-brand-500/10 blur-[100px] pointer-events-none dark:bg-brand-400/5"></div>
      <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none dark:bg-cyan-400/5"></div>

      <div className="mb-10 text-center flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-navy-700 dark:text-white mb-3">Choose a Scenario</h2>
        <p className="text-lg text-gray-500 max-w-xl">Select one of the three required negotiation templates to begin.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 px-4 xl:px-20 relative z-20">
         {scenariosList.map((scenario) => (
            <Link key={scenario.id} to="/admin/setup" state={{ selectedScenario: scenario.title }} className="group relative">
                <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${scenario.color} opacity-20 blur-xl transition-opacity group-hover:opacity-60`}></div>
                <div className={`relative h-full w-full rounded-[28px] bg-white/70 p-8 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 dark:bg-navy-800/70 border border-white/50 dark:border-white/10 ${scenario.glow}`}>
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${scenario.color} text-3xl text-white shadow-lg`}>
                        {scenario.icon}
                    </div>
                    <h4 className="mb-2 text-2xl font-extrabold text-navy-700 dark:text-white">
                        {scenario.title}
                    </h4>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                        {scenario.type}
                    </p>
                    <div className="flex items-center text-brand-500 font-bold group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                        Configure <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                </div>
            </Link>
         ))}
      </div>
    </div>
  );
};
export default Scenarios;
