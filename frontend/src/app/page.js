"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SeekerView from "./components/SeekerView";
import EmployerView from "./components/EmployerView";
import JobModal from "./components/JobModal";
import ProfileModal from "./components/ProfileModal";

export default function Home() {
  const [role, setRole] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State (Seeker)
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  // Post/Edit Job Modal State (Employer)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    location: "",
    locationType: "onsite",
    jobType: "full-time",
    experienceLevel: "entry",
    salaryMin: "",
    salaryMax: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ── 1. Fetch Content Dynamically based on Role ───────────
  const fetchDashboardContent = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("accessToken");
    const storedRole = localStorage.getItem("userRole");

    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      if (locationType) queryParams.append("locationType", locationType);
      if (jobType) queryParams.append("jobType", jobType);
      if (experienceLevel) queryParams.append("experienceLevel", experienceLevel);

      const endpoint = storedRole === "employer" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/jobs/me` 
        : `${process.env.NEXT_PUBLIC_API_URL}/jobs?${queryParams.toString()}`;

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        headers,
        cache: "no-store",
      });

      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard resources:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, locationType, jobType, experienceLevel]);

  // ── 2. Lifecycle Initialization ─────────────────────────
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);

    fetchDashboardContent(); 

    const handleStorageChange = () => {
      const activeRole = localStorage.getItem("userRole");
      setRole(activeRole);
      fetchDashboardContent();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [fetchDashboardContent]);

  // ── 3. Action Handlers (Employer) ───────────────────────
  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setJobFormData({
      title: "",
      description: "",
      location: "",
      locationType: "onsite",
      jobType: "full-time",
      experienceLevel: "entry",
      salaryMin: "",
      salaryMax: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJobId(job._id);
    setJobFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      locationType: job.locationType,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
    });
    setModalError("");
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
      const data = await res.json();

      if (!res.ok) {
        alert(`Access Denied (${res.status}): ${data.message || 'Unauthorized action'}`);
        return;
      }

      await fetchDashboardContent();
    } catch (err) {
      console.error("Failed to delete job", err);
      alert(`Network error: ${err.message}`);
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
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(jobFormData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message) throw new Error(data.message);
        if (data.errors && data.errors.length > 0) throw new Error(data.errors[0].msg);
        throw new Error("Failed to process job publication");
      }

      setIsModalOpen(false);
      await fetchDashboardContent();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSalary = (val) => {
    if (!val) return "Negotiable";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
      
      {/* ── Minimalist Top Navigation ── */}
      <Header onOpenProfile={() => setIsProfileOpen(true)} />

      {/* ── Role Context Switcher View ── */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {role === "employer" ? (
          <EmployerView 
            jobs={jobs}
            onOpenModal={handleOpenCreateModal}
            formatSalary={formatSalary}
            onEditJob={handleOpenEditModal}
            onDeleteJob={handleDeleteJob}
          />
        ) : (
          <SeekerView 
            jobs={jobs}
            search={search}
            setSearch={setSearch}
            locationType={locationType}
            setLocationType={setLocationType}
            jobType={jobType}
            setJobType={setJobType}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            formatSalary={formatSalary}
            onSearch={fetchDashboardContent}
          />
        )}
      </main>

      {/* ── Footer Architecture ── */}
      <footer className="border-t border-neutral-200/60 bg-white/50 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 text-center sm:flex sm:justify-between sm:items-center text-xs text-neutral-400">
          <p>© 2026 Recruitment Platform. Engineered for Performance & Trust.</p>
          <div className="mt-2 sm:mt-0 space-x-4">
            <span className="hover:text-neutral-600 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-neutral-600 transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-neutral-600 transition-colors">System Status</span>
          </div>
        </div>
      </footer>

      {/* ── Global Modals ── */}
      <JobModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingJobId={editingJobId}
        formData={jobFormData}
        setFormData={setJobFormData}
        onSubmit={handlePostJobSubmit}
        isSubmitting={isSubmitting}
        error={modalError}
      />

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

    </div>
  );
}
