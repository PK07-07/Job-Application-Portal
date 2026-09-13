"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import EmployerView from "./components/EmployerView";
import SeekerView from "./components/SeekerView";
import JobModal from "./components/JobModal";
import SeekerApplications from "./components/SeekerApplications"; 
import ProfileModal from "./components/ProfileModal"; 

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("seeker");
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // ── New State for the Discovery Engine ──
  const [searchFilters, setSearchFilters] = useState({
    search: "", locationType: "", jobType: ""
  });
  
  const [currentTab, setCurrentTab] = useState("browse"); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [editingJobId, setEditingJobId] = useState(null);

  const [newJob, setNewJob] = useState({
    title: "", description: "", location: "Bengaluru", locationType: "onsite",
    jobType: "full-time", experienceLevel: "mid", salaryMin: "", salaryMax: "", requiredSkills: ""
  });

  // Wrapped in useCallback so it's safe to use inside useEffect
  const fetchDashboardContent = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("userRole") || "seeker"; 
      setUserRole(role);

      if (!token) { 
        window.location.replace("/login"); 
        return; 
      }

      let endpoint = role === "employer" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/jobs/me` 
        : `${process.env.NEXT_PUBLIC_API_URL}/jobs`;    

      if (role === "seeker") {
        const params = new URLSearchParams();
        if (searchFilters.search) params.append("search", searchFilters.search);
        if (searchFilters.locationType) params.append("locationType", searchFilters.locationType);
        if (searchFilters.jobType) params.append("jobType", searchFilters.jobType);
        
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }
      }

      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Session expired");
      const data = await res.json();
      
      const jobsList = Array.isArray(data) ? data : (data.jobs || []);

      setJobs(jobsList);
      if (jobsList.length > 0) setSelectedJob(jobsList[0]);
      else setSelectedJob(null);
      
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("accessToken");
      window.location.replace("/login");
    }
  }, [searchFilters]);

  useEffect(() => { 
    // 1. Initial Fetch
    fetchDashboardContent(); 

    // 2. BFCache Guard: Forces a re-check if the user navigates via browser arrows
    const handlePageShow = (event) => {
      if (event.persisted) {
        fetchDashboardContent();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [fetchDashboardContent]);

  const handleEditJob = (job) => {
    setNewJob({
      title: job.title,
      description: job.description,
      location: job.location,
      locationType: job.locationType,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      requiredSkills: job.requiredSkills ? job.requiredSkills.join(", ") : ""
    });
    setEditingJobId(job._id); 
    setIsModalOpen(true);     
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this position? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) await fetchDashboardContent();
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setIsSubmitting(true);
    const token = localStorage.getItem("accessToken");

    try {
      const url = editingJobId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/jobs/${editingJobId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/jobs`;
      
      const method = editingJobId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newJob, salaryMin: Number(newJob.salaryMin), salaryMax: Number(newJob.salaryMax) })
      });

      if (!res.ok) { 
  const d = await res.json(); 
  const errorMessage = d.errors ? d.errors.join(", ") : d.message;
  throw new Error(errorMessage || "Error saving job"); 
}

      setIsModalOpen(false);
      setEditingJobId(null);
      setNewJob({ title: "", description: "", location: "Bengaluru", locationType: "onsite", jobType: "full-time", experienceLevel: "mid", salaryMin: "", salaryMax: "", requiredSkills: "" });
      await fetchDashboardContent();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSalary = (val) => val ? `₹${(val / 100000).toFixed(1)} LPA` : "Not specified";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-neutral-900 flex flex-col relative">
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">JP</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            JobPortal<span className="text-neutral-400">.</span> 
            <span className="text-xs font-mono ml-2 text-neutral-400 uppercase tracking-widest border border-neutral-200 px-1.5 py-0.5 rounded">
              {userRole}
            </span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {userRole === "seeker" && (
            <button 
              onClick={() => setIsProfileModalOpen(true)} 
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Profile Settings
            </button>
          )}
          <button 
            onClick={() => { localStorage.clear(); window.location.replace("/login"); }} 
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {userRole === "employer" ? (
        <EmployerView 
          jobs={jobs} 
          onOpenModal={() => {
            setEditingJobId(null);
            setNewJob({ title: "", description: "", location: "Bengaluru", locationType: "onsite", jobType: "full-time", experienceLevel: "mid", salaryMin: "", salaryMax: "", requiredSkills: "" });
            setIsModalOpen(true);
          }} 
          formatSalary={formatSalary} 
          onEditJob={handleEditJob}
          onDeleteJob={handleDeleteJob}
        />
      ) : (
        <div className="flex-1 flex flex-col w-full">
          <div className="max-w-7xl w-full mx-auto px-6 mt-6 mb-2 flex space-x-2">
            <button
              onClick={() => setCurrentTab("browse")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                currentTab === 'browse' 
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              Browse Jobs
            </button>
            <button
              onClick={() => setCurrentTab("history")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                currentTab === 'history' 
                  ? 'bg-neutral-900 text-white shadow-sm' 
                  : 'bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              My Applications
            </button>
          </div>

          {currentTab === "browse" ? (
            <SeekerView 
              jobs={jobs} 
              selectedJob={selectedJob} 
              onSelectJob={setSelectedJob} 
              formatSalary={formatSalary} 
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              onSearch={fetchDashboardContent}
            />
          ) : (
            <SeekerApplications />
          )}
        </div>
      )}

      <JobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handlePostJobSubmit}
        newJob={newJob} 
        onChange={(e) => setNewJob({ ...newJob, [e.target.name]: e.target.value })}
        error={modalError} 
        isSubmitting={isSubmitting}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </div>
  );
}