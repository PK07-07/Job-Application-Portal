import { useState, useEffect } from "react";

export default function ProfileModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: "", bio: "", skills: "", resume: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch the user's current data when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      setIsLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setFormData({
            name: data.user.name || "",
            bio: data.user.bio || "",
            skills: data.user.skills ? data.user.skills.join(", ") : "",
            resume: data.user.resume || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => { onClose(); }, 1500); // Close automatically after success
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/80 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50 rounded-t-2xl">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900">Candidate Profile</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Manage your professional identity metrics.</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 font-bold w-8 h-8 rounded-md hover:bg-neutral-200/50">✕</button>
        </div>

        <div className="p-6">
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
               <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {message.text && (
                <div className={`p-3 rounded-lg text-xs font-medium border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Professional Bio</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Briefly describe your background..." className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Skills (Comma Separated)</label>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python..." className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Resume URL</label>
                <input type="url" name="resume" value={formData.resume} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:bg-white focus:border-neutral-900 outline-none" />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50">
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}