const ChatBox = () => {

  const messages = [
    {
      agent:"🛒 Buyer Agent",
      text:"I offer $500 for this product."
    },
    {
      agent:"🏭 Seller Agent",
      text:"Counter offer: $650."
    },
    {
      agent:"🛒 Buyer Agent",
      text:"I can increase to $600."
    }
  ];


  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">

      <h2 className="text-2xl font-bold text-white mb-5">
        Negotiation Chat
      </h2>


      <div className="space-y-4">

        {messages.map((msg,index)=>(
          <div 
            key={index}
            className="bg-black/30 p-4 rounded-xl"
          >

            <p className="text-cyan-400 font-semibold">
              {msg.agent}
            </p>

            <p className="text-white mt-2">
              {msg.text}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
};


export default ChatBox;