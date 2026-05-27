import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must reference a job'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must reference an applicant'],
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
      default: '',
    },
    resumeUrl: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Resume must be a valid URL',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'],
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    employerNote: {
      type: String,
      maxlength: [500, 'Employer note cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Pre-save hook: Track when the status specifically changes ──
applicationSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusUpdatedAt = Date.now();
  }
  // No next() needed here anymore!
});

// ── Prevent duplicate applications ────────────────────
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// ── Index for employer lookups ─────────────────────────
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ applicant: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;