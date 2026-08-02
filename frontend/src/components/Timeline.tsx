interface TimelineProps {
  history: any[];
}


const Timeline = ({history}: TimelineProps) => {


  return (

    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">


      <h2 className="text-2xl font-bold text-white mb-5">
        Negotiation Timeline
      </h2>



      <div className="space-y-4">


      {
        history && history.length > 0 ? (

          history.map((round,index)=>(


            <div
              key={index}
              className="border-l-4 border-cyan-400 pl-4"
            >


              <p className="text-white font-bold">

                Round {round.round_number}

              </p>


              <p className="text-white">

                Buyer Offer:
                ₹{round.buyer_offer}

              </p>


              <p className="text-white">

                Seller Counter:
                ₹{round.seller_counter_offer}

              </p>


              <p className="text-white">

                Status:
                {round.status}

              </p>



            </div>


          ))

        )

        :

        (

          <p className="text-white">
            No negotiation history available
          </p>

        )

      }


      </div>


    </div>

  );

};


export default Timeline;