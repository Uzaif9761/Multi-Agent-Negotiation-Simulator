import { useNavigate } from "react-router-dom";

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

    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">

      <div className="max-w-6xl mx-auto px-6">

        <h1 className="text-5xl font-bold text-white text-center mb-12">

          Choose Negotiation Scenario

        </h1>

        <div className="grid md:grid-cols-3 gap-8">

          {

            scenarios.map((scenario,index)=>(

              <div
                key={index}
                className="bg-white rounded-2xl shadow-xl p-8 hover:scale-105 transition duration-300"
              >

                <div className="text-6xl text-center mb-5">

                  {scenario.icon}

                </div>

                <h2 className="text-2xl font-bold text-center mb-4">

                  {scenario.title}

                </h2>

                <p className="text-gray-600 text-center mb-8">

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

                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"

                >

                  Start Negotiation

                </button>

              </div>

            ))

          }

        </div>

      </div>

    </div>

  );

};

export default Scenario;