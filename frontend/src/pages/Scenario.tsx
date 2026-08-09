import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const Scenario = () => {

  const navigate = useNavigate();

  const scenarios = [

    {
      icon: "💼",
      title: "Job Offer",
      description: "Negotiate salary, bonus, compensation and employee benefits."
    },

    {
      icon: "🏷️",
      title: "Vendor Pricing",
      description: "Negotiate product pricing, discounts and vendor agreements."
    },

    {
      icon: "💰",
      title: "Budget Allocation",
      description: "Allocate organizational budget among multiple departments."
    }

  ];

  return (
    <PageWrapper className="flex items-center">
      <div className="w-full">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center mb-12 tracking-tight">
          Choose Negotiation Scenario
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {scenario.icon}
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">
                {scenario.title}
              </h2>

              <p className="text-slate-400 mb-8 flex-1">
                {scenario.description}
              </p>

              <button
                onClick={() =>
                  navigate("/negotiation", {
                    state: {
                      scenario:
                        scenario.title === "Job Offer"
                          ? "job_offer"
                          : scenario.title === "Vendor Pricing"
                          ? "vendor_pricing"
                          : "budget_allocation"
                    }
                  })
                }
                className="btn-primary w-full"
              >
                Start Negotiation
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Scenario;