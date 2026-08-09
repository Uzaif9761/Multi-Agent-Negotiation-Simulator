import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";
import ReportCard from "../components/ReportCard";
import PageWrapper from "../components/PageWrapper";

import API from "../services/api";


const Dashboard = () => {


  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {

        const response = await API.get(
          "/analytics/dashboard",
          {
            headers:{
              Authorization:
              `Bearer ${localStorage.getItem("token")}`
            }
          }
        );


        setAnalytics(response.data);


      } catch(error){
        console.log(
          "Analytics error",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };


    fetchAnalytics();


  },[]);



  if (isLoading) {
    return (
      <PageWrapper className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </PageWrapper>
    );
  }

  if (!analytics) {
    return (
      <PageWrapper className="flex justify-center items-center h-[80vh]">
        <div className="text-slate-400 text-lg">No analytics data found.</div>
      </PageWrapper>
    );
  }




  const stats = [

    {
      icon:"🤝",
      title:"Total Negotiations",
      value:analytics.total_negotiations
    },


    {
      icon:"✅",
      title:"Accepted",
      value:analytics.accepted
    },


    {
      icon:"❌",
      title:"Rejected",
      value:analytics.rejected
    },

    {
      icon:"🔄",
      title:"Counter Offers",
      value:analytics.counter_offers
    },

    {
      icon:"🤖",
      title:"Active Agents",
      value:"4"
    }

  ];




return (
  <PageWrapper>
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 tracking-tight">
          Negotiation Analytics
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Monitor your active agent performance and negotiation outcomes in real-time.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="text-cyan-400">📊</span> Performance Trends
          </h3>
          <ChartCard />
        </div>
        <div className="glass-panel p-6 rounded-3xl flex flex-col">
          <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="text-purple-400">📄</span> Recent Reports
          </h3>
          <div className="flex-1 overflow-auto">
            <ReportCard />
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
);


};


export default Dashboard;