import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";


const Agents = () => {


  const [agents, setAgents] = useState<any[]>([]);


  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer");
  const [goal, setGoal] = useState("");
  const [strategy, setStrategy] = useState("Balanced");



  const fetchAgents = async () => {

    try {

      const response = await API.get("/agents/");

      setAgents(response.data);

    } catch(error){

      console.log(error);

    }

  };



  useEffect(() => {

    fetchAgents();

  },[]);




  const createAgent = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    try {


      await API.post(
        "/agents/create",
        {
          name,
          role,
          goal,
          strategy
        }
      );


      toast.success(
        "Agent created successfully"
      );


      setName("");
      setGoal("");


      fetchAgents();


    } catch(error:any){


      toast.error(
        error.response?.data?.detail ||
        "Agent creation failed"
      );

    }

  };




  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">


      <div className="max-w-6xl mx-auto px-6">


        <h1 className="text-5xl font-bold text-white text-center mb-10">
          Agents
        </h1>



        {/* Create Agent Form */}

        <form
          onSubmit={createAgent}
          className="bg-white p-6 rounded-xl mb-10"
        >

          <h2 className="text-2xl font-bold mb-5">
            Create Agent
          </h2>


          <input
            className="border p-3 w-full mb-3"
            placeholder="Agent Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            required
          />


          <select
            className="border p-3 w-full mb-3"
            value={role}
            onChange={(e)=>setRole(e.target.value)}
          >

            <option value="buyer">
              Buyer
            </option>

            <option value="seller">
              Seller
            </option>

          </select>



          <input
            className="border p-3 w-full mb-3"
            placeholder="Goal"
            value={goal}
            onChange={(e)=>setGoal(e.target.value)}
            required
          />



          <select
            className="border p-3 w-full mb-3"
            value={strategy}
            onChange={(e)=>setStrategy(e.target.value)}
          >

            <option>
              Aggressive
            </option>

            <option>
              Balanced
            </option>

            <option>
              Conservative
            </option>


          </select>



          <button
            className="bg-black text-white p-3 rounded w-full"
          >

            Create Agent

          </button>


        </form>





        {/* Agent List */}


        <div className="grid md:grid-cols-3 gap-8">


        {
          agents.map((agent)=>(

            <div
              key={agent._id}
              className="bg-white rounded-xl p-6 shadow"
            >

              <h2 className="text-xl font-bold">
                {agent.name}
              </h2>


              <p>
                Role: {agent.role}
              </p>


              <p>
                Goal: {agent.goal}
              </p>


              <p>
                Strategy: {agent.strategy}
              </p>


            </div>

          ))
        }


        </div>


      </div>


    </div>

  );

};


export default Agents;