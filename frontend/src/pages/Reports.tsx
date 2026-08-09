import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import API from "../services/api";
import PageWrapper from "../components/PageWrapper";


const Reports = () => {
  const navigate = useNavigate();

  console.log("REPORT PAGE LOADED");




  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReports = async()=>{
    setIsLoading(true);
    try{


      const response = await API.get(
  "/negotiations/"
);

console.log(response.data);

const sortedReports = response.data.data.reverse(); // Assuming oldest first from DB
setReports(sortedReports);


    }
    catch(error){
      console.log(error);
    } finally {
      setIsLoading(false);
    }

  };



  useEffect(()=>{
    fetchReports();
  },[]);

  // Pagination calculations
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = reports.slice(startIndex, startIndex + itemsPerPage);





  return (
    <PageWrapper>
      <div className="flex flex-col gap-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-center tracking-tight">
          Negotiation Reports
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-cyan-400" size={48} />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center text-slate-400 py-10">
            No reports found.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid md:grid-cols-2 gap-8">
              {currentReports.map((report, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/negotiation', { state: { report } })}
                  className="glass-panel rounded-3xl p-6 shadow-lg flex flex-col gap-3 cursor-pointer hover:shadow-cyan-500/20 transition-all hover:-translate-y-1"
                >
                  <h2 className="text-2xl font-bold mb-2 text-cyan-300">
                    {report.product}
                  </h2>

                  <p className="text-slate-300"><span className="text-slate-500 font-medium mr-2">Scenario:</span>{report.scenario}</p>
                  <p className="text-slate-300"><span className="text-slate-500 font-medium mr-2">Final Offer:</span><span className="font-bold text-white">₹{report.final_offer}</span></p>
                  <p className="text-slate-300"><span className="text-slate-500 font-medium mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${
                      ['Accepted', 'Approved', 'success', 'Success'].includes(report.status) 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {report.status}
                    </span>
                  </p>
                  <p className="text-slate-300"><span className="text-slate-500 font-medium mr-2">Message:</span>{report.message}</p>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Rounds: {report.history?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="btn-secondary py-2 px-4 rounded-xl disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="btn-secondary py-2 px-4 rounded-xl disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );


};


export default Reports;