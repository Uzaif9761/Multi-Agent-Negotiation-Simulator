import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";


const ChartCard = () => {

  const negotiationData = [
    {
      name: "Buyer",
      score: 85
    },
    {
      name: "Seller",
      score: 75
    },
    {
      name: "Mediator",
      score: 90
    },
    {
      name: "Strategy",
      score: 88
    }
  ];


  const successData = [
    {
      round: "Round 1",
      success: 40
    },
    {
      round: "Round 2",
      success: 65
    },
    {
      round: "Round 3",
      success: 90
    }
  ];


  return (

    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-10">


      {/* Agent Performance Chart */}

      <div>

        <h2 className="text-2xl font-bold text-white mb-5">
          Agent Performance Analysis
        </h2>


        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={negotiationData}>

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Bar 
              dataKey="score" 
              fill="#22d3ee"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>



      {/* Negotiation Success Chart */}

      <div>

        <h2 className="text-2xl font-bold text-white mb-5">
          Negotiation Success Rate
        </h2>


        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={successData}>

            <XAxis dataKey="round" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="success"
              stroke="#22d3ee"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


    </div>

  );

};


export default ChartCard;