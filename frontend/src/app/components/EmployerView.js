import { useState } from "react";
import ApplicantsModal from "./ApplicantsModal";

export default function EmployerView({ jobs, onOpenModal, formatSalary, onEditJob, onDeleteJob }) {
  const [viewingJob, setViewingJob] = useState(null);

  // ── Dynamic Pipeline Health Logic ──
  const getPipelineHealth = () => {
    if (!jobs || jobs.length === 0) return { text: "No Data", color: "text-neutral-400" };
    
    const totalApps = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);
    const avgApps = totalApps / jobs.length;

    if (avgApps >= 5) return { text: "Excellent", color: "text-green-600" };
    if (avgApps >= 2) return { text: "Stable", color: "text-blue-600" };
    return { text: "Needs Attention", color: "text-orange-500" };
  };

  const health = getPipelineHealth();
  const totalResumes = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto p-6 mt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recruitment Console</h2>
          <p className="text-xs text-neutral-400 mt-1">Manage active vacancies and screen pending applications.</p>
        </div>
        <button onClick={onOpenModal} className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-neutral-800 transition-all shadow-sm">
          + Post a Position
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Your Active Openings</h3>
          <p className="text-3xl font-bold mt-1 tracking-tight">{jobs.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Resumes Received</h3>
          <p className="text-3xl font-bold mt-1 tracking-tight">{totalResumes}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200/60 shadow-sm">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pipeline Health</h3>
          <p className={`text-3xl font-bold mt-1 tracking-tight ${health.color}`}>
            {health.text}
          </p>
        </div>
      </div>

      {/* ── Active Jobs Pipeline Table ── */}
      <div className="bg-white rounded-xl border border-neutral-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Active Pipelines</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-sm text-neutral-400">No jobs posted yet.</div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{job.title}</h4>
                  <div className="text-xs text-neutral-400 mt-1 flex items-center space-x-2">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="capitalize">{job.locationType}</span>
                    <span>•</span>
                    <span>{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm font-bold text-neutral-900">{job.applicationCount || 0}</span>
                    <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">Applicants</p>
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => onEditJob(job)} 
                      className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDeleteJob(job._id)} 
                      className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                    
                    {/* Visual Divider */}
                    <div className="h-4 w-px bg-neutral-200 hidden sm:block"></div>
                    
                    <button 
                      onClick={() => setViewingJob(job)} 
                      className="text-xs font-medium border border-neutral-200 px-3 py-1.5 rounded-md bg-white hover:border-neutral-900 transition-colors shadow-sm"
                    >
                      View Candidates
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── THE APPLICANTS MODAL ── */}
      <ApplicantsModal 
        isOpen={!!viewingJob} 
        onClose={() => setViewingJob(null)} 
        jobId={viewingJob?._id} 
        jobTitle={viewingJob?.title} 
      />

    </main>
  );
}