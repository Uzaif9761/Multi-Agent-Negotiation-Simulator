import FeatureCard from "./FeatureCard";

const Features = () => {

  const features = [
    {
      icon: "🤖",
      title: "Multiple AI Agents",
      description:
        "Simulate multiple intelligent agents with different strategies, goals, and decision-making abilities."
    },

    {
      icon: "💬",
      title: "Real-Time Negotiation",
      description:
        "Observe AI agents exchange offers, counter offers, and reach optimal agreements."
    },

    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Analyze negotiation performance using charts, statistics, and success metrics."
    },

    {
      icon: "📄",
      title: "Automated Reports",
      description:
        "Generate detailed reports about agent behavior, decisions, and negotiation outcomes."
    }
  ];


  return (
    <section className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Powerful AI Negotiation Features
        </h2>


        <div className="grid md:grid-cols-4 gap-8">

          {features.map((feature,index)=>(
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}

        </div>

      </div>

    </section>
  );
};


export default Features;