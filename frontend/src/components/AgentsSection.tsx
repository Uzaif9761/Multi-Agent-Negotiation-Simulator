import AgentCard from "./AgentCard";

const AgentsSection = () => {

  const agents = [
    {
      icon: "🛒",
      name: "Buyer Agent",
      role: "Cost Optimization",
      description:
        "Analyzes offers, negotiates prices, and searches for the best possible deals."
    },

    {
      icon: "🏭",
      name: "Seller Agent",
      role: "Profit Maximization",
      description:
        "Creates pricing strategies and negotiates to maximize seller benefits."
    },

    {
      icon: "⚖️",
      name: "Mediator Agent",
      role: "Conflict Resolution",
      description:
        "Balances different interests and helps agents reach fair agreements."
    },

    {
      icon: "🧠",
      name: "Strategy Agent",
      role: "Decision Intelligence",
      description:
        "Studies negotiation patterns and predicts successful strategies."
    }
  ];


  return (
    <section className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Meet Your AI Negotiation Agents
        </h2>


        <div className="grid md:grid-cols-4 gap-8">

          {agents.map((agent,index)=>(
            <AgentCard
              key={index}
              icon={agent.icon}
              name={agent.name}
              role={agent.role}
              description={agent.description}
            />
          ))}

        </div>

      </div>

    </section>
  );
};

export default AgentsSection;