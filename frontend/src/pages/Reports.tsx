import { useEffect, useState } from "react";
import API from "../services/api";


const Reports = () => {

  console.log("REPORT PAGE LOADED");




  const [reports, setReports] = useState<any[]>([]);



  const fetchReports = async()=>{


    try{


      const response = await API.get(
  "/negotiations/"
);

console.log(response.data);

setReports(
  response.data.data
);


    }
    catch(error){

      console.log(error);

    }


  };



  useEffect(()=>{

    fetchReports();

  },[]);





  return (


    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">


      <div className="max-w-6xl mx-auto px-6">


        <h1 className="text-5xl font-bold text-white text-center mb-10">

          Negotiation Reports

        </h1>




        <div className="grid md:grid-cols-2 gap-8">



        {
          reports.map((report,index)=>(


            <div

            key={index}

            className="bg-white rounded-xl p-6 shadow-lg"

            >


              <h2 className="text-2xl font-bold mb-4">

                {report.product}

              </h2>



              <p>

                Scenario:
                {report.scenario}

              </p>



              <p>

                Final Offer:
                ₹{report.final_offer}

              </p>



              <p>

                Status:
                {report.status}

              </p>



              <p>

                Message:
                {report.message}

              </p>



              <p>

                Rounds:
                {report.history?.length || 0}

              </p>



            </div>


          ))

        }


        </div>


      </div>


    </div>


  );


};


export default Reports;