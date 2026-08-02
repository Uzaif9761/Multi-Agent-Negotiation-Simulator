const OfferCard = () => {

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">

      <h2 className="text-2xl font-bold text-white">
        Current Offer
      </h2>


      <div className="mt-5 text-center">

        <p className="text-gray-300">
          Final Negotiated Price
        </p>


        <h1 className="text-5xl font-bold text-cyan-400 mt-3">
          $600
        </h1>


        <p className="text-green-400 mt-3">
          Agreement Reached ✓
        </p>

      </div>

    </div>
  );
};


export default OfferCard;