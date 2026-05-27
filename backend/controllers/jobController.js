import Job from '../models/Job.js';
import { validationResult } from 'express-validator';

// ── POST /api/jobs ─────────────────────────────────────
export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    // Combine the request body with the ID of the logged-in user
    const jobData = { 
      ...req.body, 
      postedBy: req.user._id 
    };

    const job = await Job.create(jobData);
    res.status(201).json({ success: true, job });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, errors: messages });
    }
    console.error('Create job error:', err);
    res.status(500).json({ success: false, message: 'Server error creating job' });
  }
};

// ── GET /api/jobs (Global Feed for Seekers) ────────────
// ── GET /api/jobs (Global Feed with Search & Filters) ────────────
export const getJobs = async (req, res) => {
  try {
    // 1. Extract query parameters from the request URL
    const { search, locationType, jobType, experienceLevel } = req.query;
    
    // 2. Base query: Only show open jobs
    let query = { isOpen: true };

    // 3. Text Search: If 'search' exists, look inside the title OR description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // 'i' makes it case-insensitive
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Exact Match Filters
    if (locationType) query.locationType = locationType;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    // 5. Execute the query
    const jobs = await Job.find(query)
      .populate('postedBy', 'name companyName companyWebsite')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error('Fetch jobs error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching jobs' });
  }
};

// ── PUT /api/jobs/:id (Employer updates their job) ──
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Ensure the logged-in user actually owns this job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job' });
    }

    // Convert comma-separated skills back into an array if they were edited
    if (req.body.requiredSkills && typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills.split(',').map(s => s.trim()).filter(s => s !== "");
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });

    res.status(200).json({ success: true, job: updatedJob });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ success: false, message: 'Server error updating job' });
  }
};

// ── DELETE /api/jobs/:id (Employer deletes their job) ──
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Ensure ownership
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    // Delete the job document
    await job.deleteOne();

    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting job' });
  }
};

// ── GET /api/jobs/me (Dashboard Feed for Employers) ────
export const getMyJobs = async (req, res) => {
  try {
    // Fetch ONLY jobs posted by the logged-in user ID
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error('Fetch employer jobs error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching your jobs' });
  }
};