import ScenarioCard from "./ScenarioCard";

const ScenariosSection = () => {

  const scenarios = [
    {
      icon: "💼",
      title: "Business Deal Negotiation",
      description:
        "AI agents negotiate contracts, partnerships, and business agreements using intelligent strategies."
    },

    {
      icon: "🏠",
      title: "Real Estate Negotiation",
      description:
        "Simulate buyer and seller agents negotiating property prices and terms."
    },

    {
      icon: "🚗",
      title: "Vehicle Price Negotiation",
      description:
        "AI agents analyze market value and negotiate vehicle purchase decisions."
    },

    {
      icon: "📦",
      title: "Supply Chain Negotiation",
      description:
        "Optimize supplier and distributor agreements through autonomous negotiation."
    }
  ];


  return (
    <section className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Real-World Negotiation Scenarios
        </h2>


        <div className="grid md:grid-cols-4 gap-8">

          {scenarios.map((scenario,index)=>(
            <ScenarioCard
              key={index}
              icon={scenario.icon}
              title={scenario.title}
              description={scenario.description}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default ScenariosSection;