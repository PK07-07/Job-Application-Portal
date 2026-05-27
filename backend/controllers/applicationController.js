import Application from '../models/Application.js';
import Job from '../models/Job.js';

// ── POST /api/applications/:jobId (Seeker applies to a job) ──
// ── POST /api/applications/:jobId (Seeker applies to a job) ──
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // NEW: Profile Completion Gatekeeper 
    // We check if the user has attached a resume and at least one skill.
    const hasResume = req.body.resumeUrl || req.user.resume;
    const hasSkills = req.user.skills && req.user.skills.length > 0;
    
    if (!hasResume || !hasSkills) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action required: Please update your Profile Settings with a resume and skills before applying.' 
      });
    }

    // 2. Check if user already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // 3. Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || '',
      resumeUrl: hasResume, // Safely use the resume we validated above
    });

    // 4. Update job application count
    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error('Apply error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job.' });
    }
    
    res.status(500).json({ success: false, message: 'Server error while applying' });
  }
};

// ── GET /api/applications/me (Seeker views their own applications) ──
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      // Nested populate: Get the job, then get the employer who posted it to find the company name!
      .populate({
        path: 'job',
        select: 'title location locationType',
        populate: {
          path: 'postedBy',
          select: 'companyName'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    console.error('Fetch user applications error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching your applications' });
  }
};

// ── GET /api/applications/job/:jobId (Employer views applicants) ──
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    // 1. Verify the job belongs to the logged-in employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
    }

    // 2. Fetch applications and bring in the applicant's profile data
    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email skills resume bio') // Added bio just in case!
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    console.error('Fetch job applicants error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching applicants' });
  }
};
// ── PATCH /api/applications/:id/status (Employer updates status) ──
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // The Application ID
    const { status, employerNote } = req.body;

    // 1. Ensure the status provided is part of our allowed schema Enum values
    const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status type parameters.' });
    }

    // 2. Find the application and populate the associated job to check authorization
    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application document not found.' });
    }

    // 3. Verify that the logged-in user is actually the employer who posted this job
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this pipeline.' });
    }

    // 4. Update the fields safely
    if (status) application.status = status;
    if (employerNote !== undefined) application.employerNote = employerNote;

    // Saving will trigger your pre-save hook automatically to update statusUpdatedAt!
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully.`,
      application
    });

  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ success: false, message: 'Server error altering application parameters.' });
  }
};

// ── DELETE /api/applications/:id (Seeker withdraws their application) ──
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // 1. Ensure the logged-in user actually owns this application!
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
    }

    // 2. Decrement the application count on the Job model
    const job = await Job.findById(application.job);
    if (job && job.applicationCount > 0) {
      job.applicationCount -= 1;
      await job.save();
    }

    // 3. Delete the application document
    await application.deleteOne();

    res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) {
    console.error('Delete application error:', err);
    res.status(500).json({ success: false, message: 'Server error withdrawing application' });
  }
};