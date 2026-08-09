import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import toast from "react-hot-toast";
import PageWrapper from "../components/PageWrapper";
import { Send, Bot, User, Play, ChevronRight, Loader2 } from "lucide-react";

type Mode = "setup" | "simulation" | "interactive";

const Negotiation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isReportView = !!location.state?.report;

  const [mode, setMode] = useState<Mode>("setup");
  const [negotiationType, setNegotiationType] = useState<"simulation" | "interactive">("simulation");
  
  const [agents, setAgents] = useState<any[]>([]);
  const [scenario, setScenario] = useState(location.state?.scenario || location.state?.report?.scenario || "job_offer");
  const [buyerAgent, setBuyerAgent] = useState("");
  const [sellerAgent, setSellerAgent] = useState("");
  const [subject, setSubject] = useState(location.state?.report?.product || "");
  const [initialOffer, setInitialOffer] = useState("");
  const [minimumOffer, setMinimumOffer] = useState("");
  const [targetOffer, setTargetOffer] = useState("");
  const [maxRounds, setMaxRounds] = useState("5");

  const [history, setHistory] = useState<any[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For interactive mode
  const [chatInput, setChatInput] = useState("");
  const [interactiveRound, setInteractiveRound] = useState(1);
  const [lastSellerOffer, setLastSellerOffer] = useState<number | null>(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/agents/");
      setAgents(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages, isTyping]);

  // Simulate typing effect for simulation mode
  useEffect(() => {
    // If a report was passed in, immediately show the full conversation
    if (location.state?.report && mode === "setup") {
      const reportHistory = location.state.report.history || [];
      setResult(location.state.report);
      setHistory(reportHistory);
      
      const flatMessages: any[] = [];
      reportHistory.forEach((round: any) => {
        if (round.buyer_message || round.buyer_rationale) {
          flatMessages.push({ role: "buyer", content: round.buyer_message || round.buyer_rationale, offer: round.buyer_offer });
        }
        if (round.seller_message || round.seller_rationale) {
          flatMessages.push({ role: "seller", content: round.seller_message || round.seller_rationale, offer: round.seller_counter_offer });
        }
      });
      
      setVisibleMessages(flatMessages);
      setIsSimulationComplete(true);
      setMode("simulation");
      return; 
    }

    if (mode === "simulation" && history.length > 0 && visibleMessages.length === 0) {
      let currentIndex = 0;
      let isCancelled = false;
      setIsSimulationComplete(false);
      
      const flatMessages: any[] = [];
      history.forEach((round: any) => {
        if (round.buyer_message || round.buyer_rationale) {
          flatMessages.push({ role: "buyer", content: round.buyer_message || round.buyer_rationale, offer: round.buyer_offer });
        }
        if (round.seller_message || round.seller_rationale) {
          flatMessages.push({ role: "seller", content: round.seller_message || round.seller_rationale, offer: round.seller_counter_offer });
        }
      });
      
      const revealNextMessage = () => {
        if (isCancelled) return;
        
        if (currentIndex < flatMessages.length) {
          setIsTyping(true);
          
          setTimeout(() => {
            if (isCancelled) return;
            setIsTyping(false);
            
            setVisibleMessages(prev => {
              if (prev.length > currentIndex) return prev;
              return [...prev, flatMessages[currentIndex]];
            });
            
            currentIndex++;
            
            if (currentIndex >= flatMessages.length) {
              setIsSimulationComplete(true);
            } else {
              setTimeout(revealNextMessage, Math.random() * 2000 + 1000);
            }
          }, 1500);
        } else {
            setIsSimulationComplete(true);
        }
      };
      
      revealNextMessage();
      
      return () => {
        isCancelled = true;
      };
    }
  }, [mode, history, location.state]);

  const startNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (negotiationType === "interactive") {
      setMode("interactive");
      setInteractiveRound(1);
      setLastSellerOffer(null);
      setResult(null);
      setIsSimulationComplete(false);
      setVisibleMessages([{
        role: "system",
        content: `Starting interactive negotiation for ${subject}. You are playing the Buyer. You are negotiating with ${agents.find(a => a._id === sellerAgent)?.name || 'Agent'}. Make your first offer!`
      }]);
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Starting simulation...", { id: "sim" });
      const response = await API.post("/negotiations/start", {
        scenario,
        buyer_agent_id: buyerAgent,
        seller_agent_id: sellerAgent,
        negotiation_subject: subject,
        initial_offer: Number(initialOffer),
        minimum_acceptable_offer: Number(minimumOffer),
        target_offer: Number(targetOffer),
        max_rounds: Number(maxRounds),
        buyer_strategy: "Balanced",
        seller_strategy: "Balanced"
      });

      toast.success("Simulation complete! Replaying conversation...", { id: "sim" });
      setResult(response.data);
      setHistory(response.data.history || []);
      setMode("simulation");
      setVisibleMessages([]);
      setIsSimulationComplete(false);

    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Negotiation failed", { id: "sim" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInteractiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Extract numbers from chat input
    const numericalOfferStr = chatInput.replace(/[^0-9.]/g, '');
    const userOfferAmount = numericalOfferStr ? Number(numericalOfferStr) : (lastSellerOffer || Number(initialOffer));

    // Add user message
    const userMsg = { role: "buyer", content: chatInput, offer: userOfferAmount };
    setVisibleMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await API.post("/negotiations/interactive-round", {
        scenario,
        subject,
        seller_strategy: "Balanced",
        buyer_offer: userOfferAmount,
        seller_current_offer: lastSellerOffer || Number(targetOffer), // initial seller position is targetOffer
        initial_offer: Number(initialOffer),
        target_offer: Number(targetOffer),
        minimum_acceptable_offer: Number(minimumOffer),
        round_number: interactiveRound,
        max_rounds: Number(maxRounds)
      });

      const data = response.data;
      
      setVisibleMessages(prev => [...prev, {
        role: "seller",
        content: data.seller_message,
        offer: data.seller_offer
      }]);

      setLastSellerOffer(data.seller_offer);
      setInteractiveRound(prev => prev + 1);

      if (data.status === "Accepted" || data.status === "Failed") {
        setResult({
          status: data.status,
          final_offer: data.seller_offer
        });
        setIsSimulationComplete(true);

        // Save the interactive session to the backend
        try {
          // Construct history array matching NegotiationRoundResponse
          const history = [];
          let currentRound = 1;
          for (let i = 1; i < visibleMessages.length; i += 2) {
             const bMsg = visibleMessages[i]; // user message
             const sMsg = visibleMessages[i+1] || { role: "seller", content: data.seller_message, offer: data.seller_offer };
             history.push({
               round_number: currentRound++,
               buyer_offer: bMsg.offer || 0,
               seller_counter_offer: sMsg.offer || 0,
               buyer_message: bMsg.content,
               seller_message: sMsg.content,
               status: (i + 1 >= visibleMessages.length) ? data.status : "pending"
             });
          }

          await API.post("/negotiations/interactive-save", {
            scenario,
            buyer_agent_id: "user", // Default interactive user ID
            seller_agent_id: sellerAgent,
            negotiation_subject: subject,
            initial_offer: Number(initialOffer),
            minimum_acceptable_offer: Number(minimumOffer),
            target_offer: Number(targetOffer),
            max_rounds: Number(maxRounds),
            buyer_strategy: "Balanced",
            seller_strategy: "Balanced",
            status: data.status,
            final_offer: data.seller_offer,
            history: history
          });
        } catch (saveError) {
          console.error("Failed to save interactive session", saveError);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Interactive negotiation failed");
    } finally {
      setIsTyping(false);
    }
  };

  const renderSetupForm = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-cyan-400" size={48} />
        </div>
      ) : (
      <>
        <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 tracking-tight">
          New Session
        </h1>
        <p className="text-slate-400 text-lg">Configure your negotiation scenario and deploy agents.</p>
      </div>

      <div className="flex gap-4 mb-8 justify-center">
        <button 
          onClick={() => setNegotiationType("simulation")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${negotiationType === "simulation" ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
        >
          <Bot className="inline-block mr-2" size={20} />
          Simulation Mode
        </button>
        <button 
          onClick={() => setNegotiationType("interactive")}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${negotiationType === "interactive" ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'}`}
        >
          <User className="inline-block mr-2" size={20} />
          Interactive Mode
        </button>
      </div>

      <form onSubmit={startNegotiation} className="glass-panel p-8 rounded-3xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-300">Scenario Type</label>
            <select className="glass-input" value={scenario} onChange={(e) => setScenario(e.target.value)}>
              <option value="job_offer" className="bg-slate-800">Job Offer</option>
              <option value="vendor_pricing" className="bg-slate-800">Vendor Pricing</option>
              <option value="budget_allocation" className="bg-slate-800">Budget Allocation</option>
            </select>
            
            <label className="text-sm font-medium text-slate-300">Negotiation Subject</label>
            <input className="glass-input" placeholder="e.g. Senior Developer Salary" value={subject} onChange={(e) => setSubject(e.target.value)} required />

            <label className="text-sm font-medium text-slate-300">Buyer Agent</label>
            <select className="glass-input" value={buyerAgent} onChange={(e) => setBuyerAgent(e.target.value)} required>
              <option value="" className="bg-slate-800">Select Buyer Agent</option>
              {agents.filter(a => a.role === "buyer").map(agent => (
                <option key={agent._id} value={agent._id} className="bg-slate-800">{agent.name}</option>
              ))}
            </select>
            
            <label className="text-sm font-medium text-slate-300">Max Rounds</label>
            <select className="glass-input" value={maxRounds} onChange={(e) => setMaxRounds(e.target.value)}>
              <option value="3" className="bg-slate-800">3 Rounds (Quick)</option>
              <option value="5" className="bg-slate-800">5 Rounds (Standard)</option>
              <option value="7" className="bg-slate-800">7 Rounds (Extended)</option>
              <option value="10" className="bg-slate-800">10 Rounds (Thorough)</option>
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-300">Seller Agent</label>
            <select className="glass-input" value={sellerAgent} onChange={(e) => setSellerAgent(e.target.value)} required>
              <option value="" className="bg-slate-800">Select Seller Agent</option>
              {agents.filter(a => a.role === "seller").map(agent => (
                <option key={agent._id} value={agent._id} className="bg-slate-800">{agent.name}</option>
              ))}
            </select>

            <label className="text-sm font-medium text-slate-300">Financial Bounds</label>
            <div className="grid grid-cols-2 gap-3">
              <input className="glass-input text-sm" placeholder="Initial Offer" type="number" value={initialOffer} onChange={(e) => setInitialOffer(e.target.value)} required />
              <input className="glass-input text-sm" placeholder="Target Offer" type="number" value={targetOffer} onChange={(e) => setTargetOffer(e.target.value)} required />
            </div>
            <input className="glass-input text-sm" placeholder="Minimum Acceptable Offer" type="number" value={minimumOffer} onChange={(e) => setMinimumOffer(e.target.value)} required />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full mt-8 flex justify-center items-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Initializing Agent Communications...</> : <><Play size={20} /> {negotiationType === "simulation" ? "Start Simulation" : "Start Interactive Session"}</>}
        </button>
      </form>
      </>
      )}
    </motion.div>
  );

  const renderChatInterface = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-[80vh] flex flex-col"
    >
      <div className="glass-panel rounded-t-3xl p-4 flex justify-between items-center border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="text-cyan-400" /> 
            {subject || "Negotiation Session"}
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            {negotiationType === "simulation" ? "Live Simulation Broadcast" : "Interactive Mock Session"}
          </p>
        </div>
        
        <button onClick={() => {
          if (isReportView) {
            navigate('/reports');
          } else {
            setMode("setup");
            setVisibleMessages([]);
            setHistory([]);
            setIsSimulationComplete(false);
            window.history.replaceState({}, document.title);
          }
        }} className="btn-secondary text-sm py-2">
          {isReportView ? "Close" : "End Session"}
        </button>
      </div>

      <div className="glass-panel rounded-none flex-1 overflow-y-auto p-6 space-y-6">
        {visibleMessages.map((msg, idx) => {
          if (!msg) return null;
          const isBuyer = msg.role === "buyer" || msg.agent_id === buyerAgent;
          const isSystem = msg.role === "system";

          if (isSystem) {
            return (
              <div key={idx} className="flex justify-center my-4">
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs text-slate-400 text-center">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={idx} 
              className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
            >
              <span className="text-xs text-slate-400 mb-1 px-2">{isBuyer ? 'Buyer' : 'Seller'}</span>
              <div className={isBuyer ? 'chat-bubble-user' : 'chat-bubble-agent'}>
                <p className="text-sm leading-relaxed">{msg.content || msg.rationale}</p>
                {msg.offer && (
                  <div className={`mt-3 pt-3 border-t ${isBuyer ? 'border-cyan-400/30' : 'border-slate-700'} flex justify-between items-center font-mono text-sm`}>
                    <span>Offer:</span>
                    <span className="font-bold">₹{msg.offer}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
            <span className="text-xs text-slate-400 mb-1 px-2">Agent is typing...</span>
            <div className="chat-bubble-agent flex gap-1 items-center px-4 py-3">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {negotiationType === "interactive" && !isSimulationComplete && (
        <form onSubmit={handleInteractiveSubmit} className="glass-panel rounded-b-3xl p-4 flex gap-3 border-t border-white/10">
          <input
            className="glass-input flex-1"
            placeholder="Type your offer or argument..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="btn-primary py-2 px-4 rounded-xl flex items-center justify-center" disabled={isTyping || !chatInput.trim()}>
            <Send size={20} />
          </button>
        </form>
      )}
      
      {isSimulationComplete && result && (
        <div className="glass-panel rounded-b-3xl p-4 flex justify-between items-center border-t border-white/10 bg-green-500/10">
          <div>
            <h3 className="font-bold text-green-400">Negotiation Concluded</h3>
            <p className="text-sm text-slate-300">Status: {result.status} | Final Offer: ₹{result.final_offer}</p>
          </div>
          {!isReportView && (
            <button onClick={() => {
              setMode("setup");
              setVisibleMessages([]);
              setHistory([]);
              setIsSimulationComplete(false);
              window.history.replaceState({}, document.title) // clear location state
            }} className="btn-primary py-2 text-sm">
              Start New
            </button>
          )}
        </div>
      )}
    </motion.div>
  );

  return (
    <PageWrapper className="pt-8">
      {mode === "setup" ? renderSetupForm() : renderChatInterface()}
    </PageWrapper>
  );
};

export default Negotiation;