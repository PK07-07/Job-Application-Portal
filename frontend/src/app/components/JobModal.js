export default function JobModal({ isOpen, onClose, onSubmit, newJob, onChange, error, isSubmitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-700">Publish Open Position</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 font-bold">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs">{error}</div>}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Job Title</label>
            <input type="text" name="title" value={newJob.title} onChange={onChange} required placeholder="e.g. Senior Backend Engineer" className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Location Hub</label>
              <select name="location" value={newJob.location} onChange={onChange} className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none">
                {['Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad', 'Pune', 'Chennai', 'Noida'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Work Environment</label>
              <select name="locationType" value={newJob.locationType} onChange={onChange} className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none">
                <option value="onsite">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Min Salary (INR)</label>
              <input type="number" name="salaryMin" value={newJob.salaryMin} onChange={onChange} required className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Max Salary (INR)</label>
              <input type="number" name="salaryMax" value={newJob.salaryMax} onChange={onChange} required className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Description</label>
            <textarea name="description" rows="4" value={newJob.description} onChange={onChange} required className="w-full px-3 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg text-sm focus:bg-white outline-none resize-none"></textarea>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end space-x-3 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-medium">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
              {isSubmitting ? "Publishing..." : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}