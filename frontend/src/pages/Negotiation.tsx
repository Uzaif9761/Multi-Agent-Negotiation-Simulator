import ChatBox from "../components/ChatBox";
import OfferCard from "../components/OfferCard";
import Timeline from "../components/Timeline";


const Negotiation = () => {

  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">

      <div className="max-w-7xl mx-auto px-6">


        <h1 className="text-5xl font-bold text-white text-center mb-12">
          AI Negotiation Simulator
        </h1>


        <div className="grid md:grid-cols-3 gap-8">


          {/* Chat Section */}

          <div className="md:col-span-2">

            <ChatBox />

          </div>


          {/* Offer Section */}

          <div>

            <OfferCard />

          </div>


        </div>



        {/* Timeline */}

        <div className="mt-10">

          <Timeline />

        </div>


      </div>

    </div>

  );
};


export default Negotiation;

