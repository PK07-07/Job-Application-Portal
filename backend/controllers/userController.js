import User from '../models/User.js';

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // req.user._id comes from your protect middleware
    const user = await User.findById(req.user._id).select('-password'); 
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, resume } = req.body;

    // Convert comma-separated skills string back into an array cleanly
    let parsedSkills = [];
    if (typeof skills === 'string') {
      parsedSkills = skills.split(',').map(skill => skill.trim()).filter(skill => skill !== "");
    } else if (Array.isArray(skills)) {
      parsedSkills = skills;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name, 
        bio, 
        skills: parsedSkills, 
        resume 
      },
      { new: true, runValidators: true } // Return the updated document, and check validation rules
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};