import React, { useState, useEffect, useRef } from "react";
import { MdTrendingUp, MdCheckCircle, MdCancel, MdPlayArrow, MdSend } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { saveSimulation } from "../../../utils/storage";

const scenarioIdMap = {
  "Vendor Pricing Negotiation": "vendor_pricing",
  "Job Offer Negotiation": "job_offer",
  "Project Budget Allocation": "budget_allocation"
};

const strategyIdMap = {
  "Collaborative (Win-Win)": "Balanced",
  "Assertive (Win-Lose)": "Aggressive",
  "Compromising": "Balanced",
  "Accommodating": "Conservative"
};

const Arena = () => {
  const location = useLocation();
  const mode = location.state?.mode || "Simulation";
  const config = location.state?.config;
  const currentScenario = location.state?.scenario || "Vendor Pricing Negotiation";

  const [messages, setMessages] = useState([]);
  const [script, setScript] = useState([]);
  const [isInitializing, setIsInitializing] = useState(mode === "Simulation");
  const [isTyping, setIsTyping] = useState(false);
  const [typingAgent, setTypingAgent] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [humanInput, setHumanInput] = useState("");
  const [humanValue, setHumanValue] = useState("");
  const [practiceHistory, setPracticeHistory] = useState([]);

  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const calculateSentiment = () => {
      // If the simulation is finished and they walked away, the sentiment is definitely negative!
      const finalMsg = messages[messages.length - 1];
      if (isFinished && finalMsg && finalMsg.text.includes("Walk Away")) {
          return 15;
      }
      if (isFinished && finalMsg && finalMsg.text.includes("Deal Reached")) {
          return 90;
      }

      let score = 50; // Neutral start
      
      // LLMs are extremely polite even when rejecting, so we heavily weight negative/stubborn words
      const positiveWords = ["agree", "deal", "accept", "aligned", "yes", "fair", "reasonable"]; // Kept strictly positive words
      const politeWords = ["appreciate", "good", "great", "forward", "partnership", "value", "happy", "pleased", "collaborate", "benefit", "understand"]; // Lower weight
      
      const negativeWords = ["unacceptable", "reject", "no", "cannot", "below", "refuse", "impossible", "unfortunately", "disagree", "unrealistic", "hard", "tough", "problem", "issue", "decline", "exceeds", "strict", "unable", "insufficient"];
      const stubbornWords = ["but", "however", "must", "require", "firm", "strictly", "only", "bottom line"];
      
      const realMessages = messages.filter(m => m.type !== 'system');
      if (realMessages.length === 0) return 50;
      
      realMessages.forEach(msg => {
          const text = msg.text.toLowerCase();
          const words = text.split(/\W+/);
          
          words.forEach(word => {
              if (positiveWords.includes(word)) score += 4;
              if (politeWords.includes(word)) score += 1;
              if (negativeWords.includes(word)) score -= 5;
              if (stubbornWords.includes(word)) score -= 2;
          });
      });
      
      return Math.max(5, Math.min(95, score)); // Keep it within 5-95% for UI limits
  };

  const sentimentScore = calculateSentiment();
  const sentimentText = sentimentScore >= 60 ? "Positive" : sentimentScore <= 40 ? "Negative" : "Neutral";
  const sentimentColor = sentimentScore >= 60 ? "text-green-500" : sentimentScore <= 40 ? "text-red-500" : "text-brand-500";
  const strokeDashoffset = 351 - (351 * (sentimentScore / 100));

  // Initial fetch from backend if in Simulation mode
  useEffect(() => {
    const initSystemMessage = { 
      sender: "System", 
      text: `Negotiation started between ${config?.agent1?.role || 'Buyer'} and ${config?.agent2?.role || 'Supplier'}.`, 
      type: "system" 
    };

    if (mode === "Practice") {
      setMessages([initSystemMessage]);
      setScript([]);
      return;
    }

    if (!config) {
        setIsInitializing(false);
        return;
    }

    const runBackend = async () => {
      try {
        const payload = {
          scenario: scenarioIdMap[currentScenario] || "vendor_pricing",
          buyer_agent_id: config.agent1.role,
          seller_agent_id: config.agent2.role,
          negotiation_subject: currentScenario,
          initial_offer: Number(config.agent1.target), 
          minimum_acceptable_offer: Number(config.agent1.limit),
          target_offer: Number(config.agent2.target),
          max_rounds: 15,
          buyer_strategy: strategyIdMap[config.agent1.strategy] || "Balanced",
          seller_strategy: strategyIdMap[config.agent2.strategy] || "Balanced"
        };

        const res = await fetch("http://localhost:8000/negotiations/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.success && data.history) {
           let newScript = [];
           data.history.forEach((round) => {
               if (round.buyer_message) {
                 newScript.push({
                     sender: config.agent1.role,
                     text: round.buyer_message,
                     delay: Math.max(1500, Math.min(6000, round.buyer_message.length * 20))
                 });
               }
               if (round.seller_message) {
                 newScript.push({
                     sender: config.agent2.role,
                     text: round.seller_message,
                     delay: Math.max(1500, Math.min(6000, round.seller_message.length * 20))
                 });
               }
           });

           newScript.push({
              sender: "System",
              text: data.status === "success" ? `Deal Reached! Final Price: ${data.final_offer}.` : `Walk Away. No deal reached.`,
              type: "system",
              delay: 800
           });

           setMessages([initSystemMessage]);
           setScript(newScript);
        } else {
           throw new Error("Backend response unsuccessful");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setMessages([initSystemMessage, { sender: "System", text: `⚠️ BACKEND ERROR: ${err.message}. Displaying a fake fallback script. This run will NOT be saved.`, type: "system" }]);
        setScript([
          { sender: config.agent1.role, text: `We propose ${config.agent1.target}.`, delay: 1500 },
          { sender: config.agent2.role, text: `That is unacceptable. We want ${config.agent2.target}.`, delay: 2000 },
          { sender: config.agent1.role, text: `Let's agree at ${(Number(config.agent1.target) + Number(config.agent2.target))/2}.`, delay: 1800 },
          { sender: "System", text: `Deal Reached! Final Price: ${(Number(config.agent1.target) + Number(config.agent2.target))/2}.`, type: "system", delay: 800 }
        ]);
      } finally {
        setIsInitializing(false);
      }
    };

    runBackend();
  }, [mode, config, currentScenario]);

  // Removed local storage save - now handled by backend

  // Simulation Logic (Playback)
  useEffect(() => {
    if (isPaused || isFinished || isInitializing || script.length === 0) return;

    const currentTurnIndex = messages.length - 1; // Offset by initial system message
    
    if (currentTurnIndex < script.length) {
      const nextMessage = script[currentTurnIndex];
      
      // If Practice mode and it's Agent 1's turn, wait for human input
      if (mode === "Practice" && nextMessage.sender === config?.agent1?.role) {
          setIsTyping(false);
          return;
      }

      if (nextMessage.type !== "system") {
         setTypingAgent(nextMessage.sender);
         setIsTyping(true);
      }

      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { ...nextMessage, time: new Date() }]);
        if (nextMessage.type === "system") {
            setIsFinished(true);
        }
      }, Math.min(nextMessage.delay, 3000));

      return () => clearTimeout(timer);
    }
  }, [messages, isPaused, isFinished, mode, isInitializing, script, config]);

  const handlePauseToggle = () => {
      setIsPaused(prev => !prev);
  };

  const handleForceAgreement = () => {
      setIsPaused(true);
      setIsTyping(false);
      setIsFinished(true);
      setMessages(prev => [...prev, { sender: "System", text: "Simulation forcibly terminated. Agents forced to agree at current midpoint.", type: "system" }]);
  };

  const finishPractice = async (status, msg, finalOffer, currentHist) => {
      setIsFinished(true);
      setMessages(prev => [...prev, { 
          sender: "System", 
          text: status === "success" ? `Deal Reached! Final Price: ${finalOffer}. (${msg})` : `Walk Away. No deal reached. (${msg})`, 
          type: "system" 
      }]);
      
      const payload = {
              scenario: scenarioIdMap[currentScenario] || "vendor_pricing",
              buyer_agent_id: config.agent1.role,
              seller_agent_id: config.agent2.role,
              negotiation_subject: currentScenario,
              initial_offer: Number(config.agent1.target),
              target_offer: Number(config.agent2.target),
              status: status,
              final_offer: finalOffer,
              message: msg,
              history: currentHist,
              strategies: {
                  buyer: strategyIdMap[config.agent1.strategy] || "Balanced",
                  seller: strategyIdMap[config.agent2.strategy] || "Balanced"
              }
      };
      
      try {
          await fetch("http://localhost:8000/negotiations/save-practice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });
      } catch (e) {
          console.error("Save practice failed");
      }
  };

  const triggerPracticeTurn = async (humanText, currentMessages, humanVal, currentHist) => {
      setIsTyping(true);
      setTypingAgent(config.agent2.role);
      
      try {
          const historyData = currentMessages.filter(m => m.type !== 'system').map(m => ({
              sender: m.sender === config.agent1.role ? "Human" : "AI",
              text: m.text
          }));
          
          const payload = {
              scenario: scenarioIdMap[currentScenario] || "vendor_pricing",
              buyer_agent_id: config.agent1.role,
              seller_agent_id: config.agent2.role,
              negotiation_subject: currentScenario,
              initial_offer: Number(config.agent1.target), 
              minimum_acceptable_offer: Number(config.agent1.limit),
              target_offer: Number(config.agent2.target),
              ai_limit: Number(config.agent2.limit),
              ai_strategy: strategyIdMap[config.agent2.strategy] || "Balanced",
              max_rounds: 15,
              history_data: historyData,
              human_message: humanText
          };
          
          const res = await fetch("http://localhost:8000/negotiations/practice-turn", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
          });
          
          if (!res.ok) {
              const errBody = await res.text();
              throw new Error(`Practice API failed: ${res.status} - ${errBody}`);
          }
          const data = await res.json();
          
          const newAiMsg = { sender: config.agent2.role, text: data.ai_message, type: "agent", time: new Date() };
          
          const newHist = [...currentHist, {
              round_number: Math.floor(currentMessages.length/2) + 1,
              buyer_offer: humanVal,
              seller_counter_offer: data.value,
              status: "pending",
              buyer_message: humanText,
              seller_message: data.ai_message
          }];
          setPracticeHistory(newHist);
          setMessages(prev => [...prev, newAiMsg]);
          setIsTyping(false);
          
          if (data.action_type === "ACCEPT") {
              finishPractice("success", "AI accepted the deal", data.value, newHist);
          } else if (data.action_type === "WALK_AWAY") {
              finishPractice("failed", "AI walked away", data.value, newHist);
          }
          
      } catch (err) {
          console.error(err);
          setMessages(prev => [...prev, { sender: "System", text: `⚠️ BACKEND ERROR: ${err.message}`, type: "system" }]);
          setIsTyping(false);
      }
  };

  const handleHumanSend = async (e) => {
      e.preventDefault();
      if (!humanInput.trim() || !humanValue || !config || isTyping) return;
      
      const valNum = Number(humanValue);
      const newHumanMsg = { sender: config.agent1.role, text: humanInput, type: "agent", time: new Date() };
      const currentMsgs = [...messages, newHumanMsg];
      
      setMessages(currentMsgs);
      setHumanInput("");
      
      await triggerPracticeTurn(humanInput, currentMsgs, valNum, practiceHistory);
  };

  const handleAction = async (action) => {
      if (isTyping) return;
      const actionText = action === "ACCEPT" ? "I accept the deal." : "I am walking away from this negotiation.";
      const newHumanMsg = { sender: config.agent1.role, text: actionText, type: "agent", time: new Date() };
      setMessages(prev => [...prev, newHumanMsg]);
      
      const finalVal = practiceHistory[practiceHistory.length - 1]?.seller_counter_offer || 0;
      if (action === "ACCEPT") {
          finishPractice("success", "Human accepted the deal", finalVal, practiceHistory);
      } else {
          finishPractice("failed", "Human walked away", finalVal, practiceHistory);
      }
  };

  return (
    <div className="mt-8 grid h-full grid-cols-1 gap-6 xl:grid-cols-4 relative z-10 pb-10">
      
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none dark:bg-brand-400/5"></div>

      {/* Left Column - Agents Status & Sentiment */}
      <div className="col-span-1 flex flex-col gap-6 w-full h-full">
        <div className="w-full rounded-[24px] bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10 dark:shadow-none">
          <div className="mb-6 w-full">
            <h4 className="text-xl font-extrabold text-navy-700 dark:text-white flex items-center gap-2">
               Agents Live Status
            </h4>
          </div>
          
          <div className="mb-6 flex flex-col gap-3 relative">
            <div className={`absolute -left-2 top-0 bottom-0 w-1 ${isTyping && typingAgent === config?.agent1?.role ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-gray-300'} rounded-r-lg transition-all`}></div>
            <div className="flex items-center justify-between pl-2">
              <div>
                <h5 className="text-lg font-bold text-navy-700 dark:text-white">{config?.agent1?.role || 'Buyer'} AI</h5>
                <p className="text-xs font-medium text-gray-500">{config?.agent1?.strategy || 'Collaborative'} Strategy</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isTyping && typingAgent === config?.agent1?.role ? (
                  <span className="animate-pulse rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-600 dark:bg-green-500/20 dark:text-green-400">THINKING</span>
                ) : isFinished ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">IDLE</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">WAITING</span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-navy-900 mt-2 pl-2">
              <div className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)] transition-all duration-1000" style={{width: isFinished ? '100%' : '72%'}}></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 text-right">Goal Progress</p>
          </div>

          <div className={`flex flex-col gap-3 pl-2 transition-opacity ${isTyping && typingAgent === config?.agent2?.role ? 'opacity-100' : 'opacity-60'} relative`}>
            <div className={`absolute -left-4 top-0 bottom-0 w-1 ${isTyping && typingAgent === config?.agent2?.role ? 'bg-brand-500 shadow-[0_0_10px_rgba(66,42,251,0.6)]' : 'bg-transparent'} rounded-r-lg transition-all`}></div>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-lg font-bold text-navy-700 dark:text-white">{config?.agent2?.role || 'Supplier'} AI</h5>
                <p className="text-xs font-medium text-gray-500">{config?.agent2?.strategy || 'Assertive'} Strategy</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {isTyping && typingAgent === config?.agent2?.role ? (
                  <span className="animate-pulse rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">THINKING</span>
                ) : isFinished ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">IDLE</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">WAITING</span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-navy-900 mt-2">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000" style={{width: isFinished ? '100%' : '64%'}}></div>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 text-right">Goal Progress</p>
          </div>
        </div>

        {/* Sentiment Analysis Radial Chart */}
        <div className="w-full rounded-[24px] bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/50 dark:bg-navy-800/60 dark:border-white/10 dark:shadow-none flex-grow">
             <h4 className="text-xl font-extrabold text-navy-700 dark:text-white flex items-center gap-2 mb-2">
               <MdTrendingUp className="text-brand-500 dark:text-brand-400" /> Live Sentiment
             </h4>
             <p className="text-xs font-medium text-gray-500 mb-4">Overall tone of the negotiation</p>
             <div className="h-[180px] w-full flex items-center justify-center relative mt-2">
                <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351" strokeDashoffset={strokeDashoffset} className={`${sentimentColor} transition-all duration-1000`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center transition-all">
                        <span className="text-3xl font-extrabold text-navy-700 dark:text-white">{sentimentScore}%</span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${sentimentColor}`}>{sentimentText}</span>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* Middle Column - Transcript */}
      <div className="col-span-1 h-full w-full xl:col-span-3">
        <div className="w-full h-[700px] rounded-[24px] bg-white/70 p-6 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/60 dark:bg-navy-900/70 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden">
          
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/10">
            <div>
                <h4 className="text-2xl font-extrabold text-navy-700 dark:text-white flex items-center gap-2">
                Arena Transcript
                </h4>
                <p className="text-sm font-medium text-gray-500 mt-1">{currentScenario}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-400 bg-gray-100 dark:bg-navy-800 px-3 py-1 rounded-lg">Round {Math.floor(messages.filter(m => m.type !== 'system').length / 2) + 1} of 15</span>
                
                {isInitializing ? (
                    <span className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-extrabold text-brand-500 dark:text-brand-400 shadow-sm border border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20" title="The AI agents are actively simulating the negotiation.">
                        <div className="h-4 w-4 border-2 border-brand-500 dark:border-brand-400 border-t-transparent rounded-full animate-spin"></div> SIMULATING...
                    </span>
                ) : isPaused ? (
                    <span className="flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-sm font-extrabold text-yellow-600 shadow-sm border border-yellow-100 dark:bg-yellow-500/10 dark:border-yellow-500/20">
                        PAUSED
                    </span>
                ) : isFinished ? (
                    <span className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm font-extrabold text-gray-500 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        FINISHED
                    </span>
                ) : (
                    <span className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-extrabold text-red-500 shadow-sm border border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-ping"></div> LIVE
                    </span>
                )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-6 custom-scrollbar">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full transition-all duration-300 animate-fade-in ${msg.type === 'system' ? 'justify-center' : msg.sender === config?.agent1?.role ? 'justify-start' : 'justify-end'}`}>
                    {msg.type === 'system' ? (
                        <div className="my-4 flex items-center gap-4 w-full">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold bg-white/50 px-3 py-1 rounded-full dark:bg-navy-800 text-center">{msg.text}</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
                        </div>
                    ) : (
                        <div className={`flex flex-col ${msg.sender === config?.agent1?.role ? 'items-start' : 'items-end'} max-w-[85%]`}>
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                {msg.sender !== config?.agent1?.role && <span className="text-xs font-bold text-gray-400">{msg.time ? msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>}
                                <span className={`text-sm font-extrabold ${msg.sender === config?.agent1?.role ? 'text-green-500' : 'text-brand-500 dark:text-brand-400'}`}>{msg.sender}</span>
                                {msg.sender === config?.agent1?.role && <span className="text-xs font-bold text-gray-400">{msg.time ? msg.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>}
                            </div>
                            <div className={`relative rounded-[20px] px-6 py-4 text-[15px] leading-relaxed shadow-sm ${msg.sender === config?.agent1?.role ? 'bg-white text-navy-700 border border-gray-100 rounded-tl-sm dark:!bg-navy-800 dark:text-white dark:border-white/5' : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(66,42,251,0.2)]'}`}>
                                {msg.text}
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            {isTyping && !isPaused && !isInitializing && (
                <div className={`flex w-full mt-4 mb-2 pl-2 transition-all duration-300 ${typingAgent === config?.agent1?.role ? 'justify-start' : 'justify-end pr-2'}`}>
                     <div className="flex items-center gap-2 bg-white/80 dark:bg-navy-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${typingAgent === config?.agent1?.role ? 'bg-green-500' : 'bg-brand-500'}`} style={{animationDelay: '0ms'}}></div>
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${typingAgent === config?.agent1?.role ? 'bg-green-500' : 'bg-brand-500'}`} style={{animationDelay: '150ms'}}></div>
                            <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${typingAgent === config?.agent1?.role ? 'bg-green-500' : 'bg-brand-500'}`} style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 ml-1 tracking-wide">{typingAgent} AI is formulating a response...</span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Human Input Area for Practice Mode */}
          {mode === "Practice" && !isFinished && (
            <div className="mt-2 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-3">
              <form onSubmit={handleHumanSend} className="flex gap-4 items-center">
                  <input 
                      type="number"
                      value={humanValue}
                      onChange={(e) => setHumanValue(e.target.value)}
                      placeholder="Offer Amt"
                      className="w-32 rounded-xl border-none bg-gray-100 px-4 py-3 text-sm font-medium text-navy-700 outline-none focus:ring-2 focus:ring-green-500 dark:bg-navy-800 dark:text-white"
                  />
                  <input 
                      type="text" 
                      value={humanInput}
                      onChange={(e) => setHumanInput(e.target.value)}
                      placeholder="Type your message here..." 
                      className="flex-1 rounded-full border-none bg-gray-100 px-6 py-3 text-sm font-medium text-navy-700 outline-none focus:ring-2 focus:ring-green-500 dark:bg-navy-800 dark:text-white"
                  />
                  <button 
                      type="submit"
                      disabled={!humanInput.trim() || !humanValue || isTyping}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-sm hover:bg-green-600 disabled:opacity-50 transition-all shrink-0"
                  >
                      <MdSend className="h-5 w-5" />
                  </button>
              </form>
              <div className="flex gap-4">
                  <button onClick={() => handleAction("ACCEPT")} disabled={isTyping || practiceHistory.length === 0} className="px-6 py-2 bg-brand-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors shadow-sm">Accept Deal</button>
                  <button onClick={() => handleAction("WALK_AWAY")} disabled={isTyping} className="px-6 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-red-600 transition-colors shadow-sm">Walk Away</button>
              </div>
            </div>
          )}

          {/* Action Area */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
             <button 
                onClick={handlePauseToggle}
                disabled={isFinished || isInitializing}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isFinished || isInitializing ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-500'}`}
             >
                {isPaused ? <><MdPlayArrow className="h-5 w-5" /> Resume Simulation</> : <><MdCancel className="h-5 w-5" /> Pause Simulation</>}
             </button>
             <button 
                onClick={handleForceAgreement}
                disabled={isFinished || isInitializing}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all ${isFinished || isInitializing ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-green-500 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:bg-green-600 hover:shadow-[0_6px_16px_rgba(34,197,94,0.4)]'}`}
             >
                <MdCheckCircle className="h-5 w-5" /> Force Agreement
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};
export default Arena;
