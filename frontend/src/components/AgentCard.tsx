interface AgentCardProps {
  icon: string;
  name: string;
  role: string;
  description: string;
}

const AgentCard = ({
  icon,
  name,
  role,
  description,
}: AgentCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition duration-300">

      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-white">
        {name}
      </h3>

      <p className="text-cyan-400 font-semibold mt-2">
        {role}
      </p>

      <p className="text-gray-300 mt-4 leading-6">
        {description}
      </p>

    </div>
  );
};

export default AgentCard;