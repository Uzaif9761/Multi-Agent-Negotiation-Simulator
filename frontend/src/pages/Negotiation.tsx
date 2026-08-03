import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import Timeline from "../components/Timeline";


const Negotiation = () => {

  const location = useLocation();

  const [agents, setAgents] = useState<any[]>([]);


  const [scenario, setScenario] = useState(
  location.state?.scenario || "job_offer"
);

  const [buyerAgent, setBuyerAgent] = useState("");

  const [sellerAgent, setSellerAgent] = useState("");

  const [subject, setSubject] = useState("");

  const [initialOffer, setInitialOffer] = useState("");

  const [minimumOffer, setMinimumOffer] = useState("");

  const [targetOffer, setTargetOffer] = useState("");


  const [result, setResult] = useState<any>(null);



  const fetchAgents = async()=>{

    try{

      const response = await API.get("/agents/");

      setAgents(response.data);

    }
    catch(error){

      console.log(error);

    }

  };



  useEffect(()=>{

    fetchAgents();

  },[]);




  const startNegotiation = async(
    e:React.FormEvent
  )=>{


    e.preventDefault();


    try{


      const response = await API.post(
        "/negotiations/start",
        {

          scenario,

          buyer_agent_id: buyerAgent,

          seller_agent_id: sellerAgent,


          negotiation_subject: subject,


          initial_offer:Number(initialOffer),

          minimum_acceptable_offer:Number(minimumOffer),

          target_offer:Number(targetOffer),


          max_rounds:5,


          buyer_strategy:"Balanced",

          seller_strategy:"Balanced"

        }
      );



      console.log(
        "Negotiation Response:",
        response.data
      );



      setResult(
        response.data
      );



      toast.success(
        "Negotiation completed"
      );


    }

    catch(error:any){


      toast.error(

        error.response?.data?.detail ||

        "Negotiation failed"

      );


    }


  };




return (

<div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">


<div className="max-w-5xl mx-auto px-6">


<h1 className="text-5xl text-white font-bold text-center mb-10">

AI Negotiation Simulator

</h1>




<form

onSubmit={startNegotiation}

className="bg-white p-8 rounded-xl"

>



<select

className="border p-3 w-full mb-4"

value={scenario}

onChange={(e)=>setScenario(e.target.value)}

>


<option value="job_offer">
Job Offer
</option>


<option value="vendor_pricing">
Vendor Pricing
</option>


<option value="budget_allocation">
Budget Allocation
</option>


</select>






<select

className="border p-3 w-full mb-4"

value={buyerAgent}

onChange={(e)=>setBuyerAgent(e.target.value)}

required

>


<option value="">
Select Buyer Agent
</option>


{

agents

.filter(
(a)=>a.role==="buyer"
)

.map(agent=>(

<option

key={agent._id}

value={agent._id}

>

{agent.name}

</option>


))


}



</select>






<select

className="border p-3 w-full mb-4"

value={sellerAgent}

onChange={(e)=>setSellerAgent(e.target.value)}

required

>


<option value="">
Select Seller Agent
</option>


{

agents

.filter(
(a)=>a.role==="seller"
)

.map(agent=>(

<option

key={agent._id}

value={agent._id}

>

{agent.name}

</option>


))


}



</select>






<input

className="border p-3 w-full mb-4"

placeholder="Negotiation Subject"

value={subject}

onChange={(e)=>setSubject(e.target.value)}

required

/>






<input

className="border p-3 w-full mb-4"

placeholder="Initial Offer"

type="number"

value={initialOffer}

onChange={(e)=>setInitialOffer(e.target.value)}

required

/>






<input

className="border p-3 w-full mb-4"

placeholder="Minimum Acceptable Offer"

type="number"

value={minimumOffer}

onChange={(e)=>setMinimumOffer(e.target.value)}

required

/>






<input

className="border p-3 w-full mb-4"

placeholder="Target Offer"

type="number"

value={targetOffer}

onChange={(e)=>setTargetOffer(e.target.value)}

required

/>





<button

className="bg-black text-white p-3 rounded w-full"

>

Start Negotiation

</button>



</form>






{

result && (

<>

<div className="bg-white mt-8 p-6 rounded-xl">


<h2 className="text-2xl font-bold">

Result

</h2>



<p>

Status:
{result.status}

</p>



<p>

Message:
{result.message}

</p>



<p>

Final Offer:
₹{result.final_offer}

</p>



</div>




<div className="mt-10">

<Timeline

history={
result.history || []
}

/>

</div>


</>


)

}




</div>

</div>


);


};


export default Negotiation;