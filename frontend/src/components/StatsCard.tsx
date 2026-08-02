interface StatsCardProps {
  title:string;
  value:string;
  icon:string;
}


const StatsCard = ({
  title,
  value,
  icon
}:StatsCardProps)=>{

  return (

    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:scale-105 transition">

      <div className="text-4xl">
        {icon}
      </div>


      <h3 className="text-gray-300 mt-4">
        {title}
      </h3>


      <p className="text-4xl font-bold text-cyan-400 mt-2">
        {value}
      </p>


    </div>

  );
};


export default StatsCard;