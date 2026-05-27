import mongoose from 'mongoose';


const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 15,
        message: 'Cannot list more than 15 requirements',
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 15,
        message: 'Cannot list more than 15 skills',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    locationType: {
      type: String,
      enum: {
        values: ['remote', 'onsite', 'hybrid'],
        message: 'Location type must be remote, onsite, or hybrid',
      },
      required: [true, 'Location type is required'],
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        message: 'Invalid job type',
      },
      required: [true, 'Job type is required'],
    },
    
    experienceLevel: {
      type: String,
      enum: {
        values: ['entry', 'mid', 'senior', 'lead', 'executive'],
        message: 'Invalid experience level',
      },
      required: [true, 'Experience level is required'],
    },
    salaryMin: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
      default: null,
    },
    salaryMax: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative'],
      default: null,
      validate: {
        validator: function (v) {
          if (!v || !this.salaryMin) return true;
          return v >= this.salaryMin;
        },
        message: 'Maximum salary must be greater than minimum salary',
      },
    },
    salaryCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: [3, 'Currency code must be 3 characters'],
    },
    applicationDeadline: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v > new Date();
        },
        message: 'Application deadline must be in the future',
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must have a poster'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    applicationCount: {
      type: Number,
      default: 0,
      min: [0, 'Application count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes for common queries ─────────────────────────
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isOpen: 1, createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' }); // full-text search

// ── Virtual: salary display string ────────────────────
jobSchema.virtual('salaryRange').get(function () {
  if (!this.salaryMin && !this.salaryMax) return 'Not disclosed';
  if (this.salaryMin && !this.salaryMax) return `From ${this.salaryCurrency} ${this.salaryMin.toLocaleString()}`;
  if (!this.salaryMin && this.salaryMax) return `Up to ${this.salaryCurrency} ${this.salaryMax.toLocaleString()}`;
  return `${this.salaryCurrency} ${this.salaryMin.toLocaleString()} – ${this.salaryMax.toLocaleString()}`;
});

const Job = mongoose.model('Job', jobSchema);
export default Job;