import { useState } from "react";

export default function SeekerView({ 
  jobs, 
  selectedJob, 
  onSelectJob, 
  formatSalary,
  searchFilters,
  setSearchFilters,
  onSearch
}) {
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFilterChange = (e) => {
    setSearchFilters({ ...searchFilters, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${selectedJob._id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          coverLetter: coverLetter 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to route system application token.");
      }

      setMessage({ type: "success", text: "Application submitted successfully!" });
      setCoverLetter("");
      
      setTimeout(() => {
        setIsApplying(false);
        setMessage({ type: "", text: "" });
        selectedJob.applicationCount = (selectedJob.applicationCount || 0) + 1;
      }, 1500);

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 overflow-hidden">
      
      {/* ── THE DISCOVERY ENGINE (Search & Filters) ── */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-sm flex flex-col md:flex-row gap-3 flex-shrink-0">
        
        <div className="flex-1">
          <input 
            type="text" 
            name="search"
            value={searchFilters?.search || ""}
            onChange={handleFilterChange}
            onKeyDown={handleKeyDown}
            placeholder="Search by job title or keyword..." 
            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none transition-colors"
          />
        </div>

        <div className="w-full md:w-48">
          <select 
            name="locationType"
            value={searchFilters?.locationType || ""}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none cursor-pointer"
          >
            <option value="">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="onsite">On-Site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <select 
            name="jobType"
            value={searchFilters?.jobType || ""}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none cursor-pointer"
          >
            <option value="">All Job Types</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <button 
          onClick={onSearch}
          className="px-6 py-2 bg-neutral-900 text-white font-semibold text-sm rounded-lg hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* ── JOB BOARD LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        
        {/* ── Left Column Feed List ── */}
        <div className="w-full lg:w-[45%] flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
          <div className="mb-2">
            <h2 className="text-xl font-bold tracking-tight">Open Openings</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Showing live vacancies matched to your profile attributes.</p>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 shadow-sm mt-4">
              No jobs found matching your criteria. Try adjusting your filters!
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => {
                  onSelectJob(job);
                  setIsApplying(false);
                  setMessage({ type: "", text: "" });
                }}
                className={`p-5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedJob?._id === job._id 
                    ? "bg-white border-neutral-900 shadow-sm ring-1 ring-neutral-900" 
                    : "bg-white border-neutral-200/60 hover:border-neutral-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{job.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md flex-shrink-0">
                    {job.locationType}
                  </span>
                </div>
                {/* INJECTED COMPANY NAME (Left Column) */}
                <p className="text-xs font-semibold text-neutral-600 mt-0.5 line-clamp-1">
                  {job.postedBy?.companyName || "Confidential Employer"}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{job.location} • India</p>
                
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                  <span>{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</span>
                  <span className="capitalize bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200/40">{job.experienceLevel}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right Column Focus Panel ── */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-200/60 shadow-sm overflow-y-auto max-h-[calc(100vh-220px)] sticky top-24 flex flex-col">
          {selectedJob ? (
            <div className="p-8 flex flex-col h-full justify-between min-h-[400px]">
              
              {!isApplying ? (
                <div>
                  <div className="border-b border-neutral-100 pb-6">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-1 rounded-md mb-3">
                      Active Listing
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-neutral-900">{selectedJob.title}</h2>
                    
                    {/* INJECTED COMPANY NAME BADGE (Right Column) */}
                    <div className="flex items-center text-sm font-medium text-neutral-600 mt-2 mb-4">
                      <svg className="w-4 h-4 mr-2 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{selectedJob.postedBy?.companyName || "Confidential Employer"}</span>
                    </div>

                    <div className="mt-3 text-xs text-neutral-500 font-medium">
                      <span className="text-neutral-900 font-semibold">{selectedJob.location}</span>
                      <span className="mx-2 text-neutral-300">•</span>
                      <span className="capitalize">{selectedJob.jobType}</span>
                      <span className="mx-2 text-neutral-300">•</span>
                      <span>{formatSalary(selectedJob.salaryMin)} - {formatSalary(selectedJob.salaryMax)} / Year</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Role Overview</h4>
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap font-normal opacity-95">
                      {selectedJob.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full">
                  <div className="border-b border-neutral-100 pb-4 mb-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900">Application Pipeline</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">Applying for {selectedJob.title} at {selectedJob.postedBy?.companyName || "Confidential Employer"}</p>
                    </div>
                    <button 
                      onClick={() => setIsApplying(false)}
                      className="text-xs font-medium text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      ← Back to spec
                    </button>
                  </div>

                  <form onSubmit={handleApplicationSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {message.text && (
                        <div className={`p-3 rounded-lg text-xs font-medium mb-4 border ${
                          message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
                        }`}>
                          {message.text}
                        </div>
                      )}
                      
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                        Cover Letter / Note to Recruiter
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        required
                        rows="6"
                        placeholder="Briefly state your proficiency matching parameters, platform experiences, and availability metrics..."
                        className="w-full px-3 py-2.5 bg-neutral-50/50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder-neutral-400 resize-none leading-relaxed"
                      ></textarea>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex justify-end space-x-3 bg-white mt-6">
                      <button
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-medium hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!isApplying && (
                <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between bg-white">
                  <div className="text-xs text-neutral-400 font-medium">
                    Applications received: <span className="text-neutral-900 font-bold">{selectedJob.applicationCount || 0}</span>
                  </div>
                  <button
                    onClick={() => setIsApplying(true)}
                    className="bg-neutral-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-sm"
                  >
                    Apply to Position
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-neutral-400 h-full">
              Select a position to view profile metrics.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}