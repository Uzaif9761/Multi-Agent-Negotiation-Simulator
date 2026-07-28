const Timeline = () => {

  const rounds=[
    "Round 1: Initial Offer",
    "Round 2: Counter Offer",
    "Round 3: Final Agreement"
  ];


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">

      <h2 className="text-2xl font-bold text-white mb-5">
        Negotiation Timeline
      </h2>


      <div className="space-y-4">

      {rounds.map((round,index)=>(
        <div 
          key={index}
          className="border-l-4 border-cyan-400 pl-4"
        >

          <p className="text-white">
            {round}
          </p>

        </div>
      ))}

      </div>

    </div>
  );
};


export default Timeline;