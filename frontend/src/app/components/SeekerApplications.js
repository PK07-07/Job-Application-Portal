import { useState, useEffect } from "react";

export default function SeekerApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null); // Tracks which button is spinning

  const fetchMyApps = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApps();
  }, []);

  //  The new Withdraw Logic
  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This cannot be undone.")) return;
    
    setIsDeleting(applicationId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // Instantly remove it from the screen without refreshing the page
        setApplications(prev => prev.filter(app => app._id !== applicationId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to withdraw application.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-neutral-400">Loading your journey...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 w-full">
      <h2 className="text-2xl font-bold mb-6 tracking-tight">My Applications</h2>
      
      {applications.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-300 rounded-2xl p-12 text-center">
          <p className="text-neutral-500 text-sm">You haven't applied to any positions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative">
              
              <div>
                <h3 className="font-bold text-neutral-900">{app.job?.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {app.job?.postedBy?.companyName} • {app.job?.location}
                </p>
                <p className="text-[10px] text-neutral-400 mt-2 uppercase font-bold tracking-widest">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Status Badge */}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  app.status === 'accepted' ? "bg-green-50 border-green-200 text-green-600" :
                  app.status === 'rejected' ? "bg-red-50 border-red-200 text-red-600" :
                  app.status === 'shortlisted' ? "bg-blue-50 border-blue-200 text-blue-600" :
                  "bg-neutral-50 border-neutral-200 text-neutral-500"
                }`}>
                  {app.status}
                </span>

                {/* Vertical Divider */}
                <div className="w-px h-6 bg-neutral-200 hidden sm:block"></div>

                {/* Withdraw Button */}
                <button 
                  onClick={() => handleWithdraw(app._id)}
                  disabled={isDeleting === app._id}
                  className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {isDeleting === app._id ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}