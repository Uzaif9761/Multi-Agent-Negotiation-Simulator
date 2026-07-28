import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";
import ReportCard from "../components/ReportCard";


const Dashboard = () => {

  const stats = [
    {
      icon: "🤝",
      title: "Total Negotiations",
      value: "120"
    },

    {
      icon: "✅",
      title: "Success Rate",
      value: "85%"
    },

    {
      icon: "💰",
      title: "Average Deal Value",
      value: "$650"
    },

    {
      icon: "🤖",
      title: "Active Agents",
      value: "4"
    }
  ];


  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">

      <div className="max-w-7xl mx-auto px-6">


        <h1 className="text-5xl font-bold text-white text-center mb-12">
          Negotiation Analytics Dashboard
        </h1>


        {/* Statistics Cards */}

        <div className="grid md:grid-cols-4 gap-8 mb-10">

          {stats.map((stat,index)=>(

            <StatsCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
            />

          ))}

        </div>



        {/* Chart */}

        <div className="mb-10">

          <ChartCard />

        </div>



        {/* Reports */}

        <ReportCard />


      </div>

    </div>

  );

};


export default Dashboard;