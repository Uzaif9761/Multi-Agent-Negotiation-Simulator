interface ScenarioCardProps {
  icon: string;
  title: string;
  description: string;
}

const ScenarioCard = ({
  icon,
  title,
  description,
}: ScenarioCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:scale-105 transition duration-300">

      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-white">
        {title}
      </h3>

      <p className="text-gray-300 mt-4 leading-6">
        {description}
      </p>

    </div>
  );
};

export default ScenarioCard;