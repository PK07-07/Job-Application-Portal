import { useState, useEffect } from "react";

export default function ApplicantsModal({ isOpen, onClose, jobId, jobTitle }) {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // Tracks active button spinners

  const fetchApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/job/${jobId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplicants(data.applications || []);
      } else {
        setError(data.message || "Failed to load candidates.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && jobId) fetchApplicants();
  }, [isOpen, jobId]);

  // Handle live status changes on selection dropdown dispatch
  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update candidate status.");
      } else {
        // Refresh local indices smoothly on successful update return loops
        await fetchApplicants();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900">Applicant Pipeline</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Reviewing candidates for: <span className="font-semibold text-neutral-900">{jobTitle}</span></p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 font-bold w-8 h-8 rounded-md hover:bg-neutral-200/50">✕</button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center p-12 bg-red-50 rounded-xl border border-red-200 text-red-600 font-medium text-sm">{error}</div>
          ) : applicants.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-neutral-200/60 shadow-sm text-sm text-neutral-500 font-medium">
              No applications have been submitted for this position yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div key={app._id} className="bg-white p-6 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col gap-4 relative">
                  
                  {/* Row 1: Candidate Profile metadata metrics */}
                  <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                    <div>
                      <h4 className="text-base font-bold text-neutral-900">{app.applicant?.name || "Unknown Candidate"}</h4>
                      <p className="text-xs text-neutral-500 font-medium mt-1">{app.applicant?.email}</p>
                      {app.applicant?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.applicant.skills.map(skill => (
                            <span key={skill} className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold border border-neutral-200 px-3 py-2 rounded-lg bg-white hover:border-neutral-900 transition-all text-neutral-700">
                          Resume ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Cover letter message core block */}
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Cover Letter</h5>
                    <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{app.coverLetter || "No cover letter provided."}</div>
                  </div>

                  {/* Row 3: Live Pipeline Status Mutator Controls */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center space-x-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pipeline Status:</label>
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border outline-none bg-white transition-all cursor-pointer ${
                          app.status === 'shortlisted' ? "text-blue-600 border-blue-200 bg-blue-50/20" :
                          app.status === 'accepted' ? "text-green-600 border-green-200 bg-green-50/20" :
                          app.status === 'rejected' ? "text-red-500 border-red-200 bg-red-50/20" :
                          "text-neutral-700 border-neutral-200"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}