interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
}: FeatureCardProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300 border border-white/20">

      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white mb-3">
        {title}
      </h3>

      <p className="text-gray-300 leading-6">
        {description}
      </p>

    </div>
  );
};

export default FeatureCard;