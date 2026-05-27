import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['seeker', 'employer'],
        message: 'Role must be either seeker or employer',
      },
      required: [true, 'Role is required'],
    },

    // Seeker-specific fields
    resume: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Resume must be a valid URL',
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Cannot list more than 20 skills',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // Employer-specific fields
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyWebsite: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Company website must be a valid URL',
      },
    },
    companySize: {
      type: String,
      enum: {
        values: ['1-10', '11-50', '51-200', '201-500', '500+', ''],
        message: 'Invalid company size option',
      },
      default: '',
    },
    

    // Token management
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────

userSchema.index({ role: 1 });

// ── Pre-save hook: hash password ───────────────────────
// ── Pre-save hook: hash password ───────────────────────
userSchema.pre('save', async function () {
  // If password isn't modified, just return and let Mongoose continue
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Cross-field validation: employer must have companyName ─
userSchema.pre('save', function () {
  if (this.role === 'employer' && !this.companyName) {
    // Instead of next(error), we just throw the error directly
    throw new Error('Employers must provide a company name');
  }
});

// ── Instance method: compare password ─────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ── Virtual: public profile ────────────────────────────
userSchema.virtual('profile').get(function () {
  const base = { id: this._id, name: this.name, email: this.email, role: this.role };
  if (this.role === 'seeker') {
    return { ...base, bio: this.bio, skills: this.skills, resume: this.resume };
  }
  return { ...base, companyName: this.companyName, companyWebsite: this.companyWebsite, companySize: this.companySize };
});

const User = mongoose.model('User', userSchema);
export default User;