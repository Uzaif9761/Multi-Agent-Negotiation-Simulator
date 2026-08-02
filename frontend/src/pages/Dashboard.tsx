import { useEffect, useState } from "react";

import StatsCard from "../components/StatsCard";
import ChartCard from "../components/ChartCard";
import ReportCard from "../components/ReportCard";

import API from "../services/api";


const Dashboard = () => {


  const [analytics, setAnalytics] = useState<any>(null);



  useEffect(() => {

    const fetchAnalytics = async () => {

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

      }

    };


    fetchAnalytics();


  },[]);



  if(!analytics){

    return (
      <div className="text-white text-center mt-20">
        Loading Dashboard...
      </div>
    )

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

<div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">


<div className="max-w-7xl mx-auto px-6">


<h1 className="text-5xl font-bold text-white text-center mb-12">

Negotiation Analytics Dashboard

</h1>



<div className="grid md:grid-cols-5 gap-8 mb-10">


{
stats.map((stat,index)=>(

<StatsCard

key={index}

icon={stat.icon}

title={stat.title}

value={stat.value}

/>

))
}


</div>



<div className="mb-10">

<ChartCard />

</div>



<ReportCard />


</div>


</div>


);


};


export default Dashboard;