import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import PageWrapper from "../components/PageWrapper";


const Agents = () => {


  const [agents, setAgents] = useState<any[]>([]);


  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer");
  const [goal, setGoal] = useState("");
  const [strategy, setStrategy] = useState("Balanced");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/agents/");
      setAgents(response.data);
    } catch(error){

      console.log(error);

    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {

    fetchAgents();

  },[]);




  const createAgent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };




  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center tracking-tight">
          AI Agents
        </h1>

        {/* Create Agent Form */}
        <form
          onSubmit={createAgent}
          className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto w-full"
        >
          <h2 className="text-2xl font-bold mb-6 text-white text-center">
            Deploy New Agent
          </h2>

          <div className="flex flex-col gap-4">
            <input
              className="glass-input"
              placeholder="Agent Name (e.g., Sarah)"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              required
            />

            <select
              className="glass-input"
              value={role}
              onChange={(e)=>setRole(e.target.value)}
            >
              <option value="buyer" className="bg-slate-800">Buyer</option>
              <option value="seller" className="bg-slate-800">Seller</option>
            </select>

            <input
              className="glass-input"
              placeholder="Primary Goal"
              value={goal}
              onChange={(e)=>setGoal(e.target.value)}
              required
            />

            <select
              className="glass-input"
              value={strategy}
              onChange={(e)=>setStrategy(e.target.value)}
            >
              <option className="bg-slate-800">Aggressive</option>
              <option className="bg-slate-800">Balanced</option>
              <option className="bg-slate-800">Conservative</option>
            </select>

            <button
              className="btn-primary mt-2 flex justify-center items-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Deploying...</> : "Create Agent"}
            </button>
          </div>
        </form>

        {/* Agent List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={48} />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center text-slate-400 py-10">
            No agents found. Create one to get started.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {agents.map((agent)=>(
            <div
              key={agent._id}
              className="glass-panel rounded-3xl p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300"
            >
              <h2 className="text-xl font-bold text-cyan-300">
                {agent.name}
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Role:</span>
                <span className="bg-white/10 px-2 py-1 rounded text-xs font-medium uppercase tracking-wider text-purple-300">
                  {agent.role}
                </span>
              </div>
              
              <p className="text-slate-300 text-sm">
                <span className="text-slate-400 block mb-1">Goal:</span>
                {agent.goal}
              </p>
              
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-slate-400 text-sm">Strategy</span>
                <span className="text-white font-medium">{agent.strategy}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </PageWrapper>
  );

};


export default Agents;