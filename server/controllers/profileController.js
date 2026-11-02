import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Availability } from '../models/Availability.js';

/**
 * Calculates profile completion percentage and identifies missing fields
 */
export const calculateCompletion = (user, profile) => {
  const missing = [];
  let score = 0;

  if (user.role === 'Freelancer') {
    // 1. Full name
    if (user.name && user.name.trim().length >= 2) score += 10;
    else missing.push('Full Name');

    // 2. Profile Photo
    if (user.avatar && user.avatar.trim().length > 0) score += 10;
    else missing.push('Profile Photo');

    // 3. Headline / Role
    if (profile?.headline || profile?.primaryRole) score += 10;
    else missing.push('Professional Headline / Primary Role');

    // 4. Phone Number
    if (user.phone && user.phone.trim().length >= 8) score += 10;
    else missing.push('Contact Phone Number');

    // 5. Location / City
    if (profile?.location || profile?.city || user.city) score += 10;
    else missing.push('City / Location');

    // 6. Skills (at least one)
    if (Array.isArray(profile?.skills) && profile.skills.length > 0) score += 15;
    else missing.push('Skills (at least 1)');

    // 7. Experience / Events
    if (profile?.experienceYears > 0 || profile?.completedEvents > 0) score += 10;
    else missing.push('Years of Experience');

    // 8. Event Fee / Rate
    if (profile?.pricePerEvent > 0) score += 10;
    else missing.push('Event Rate / Fee');

    // 9. Bio
    if (profile?.bio && profile.bio.trim().length >= 20) score += 10;
    else missing.push('Professional Bio (min 20 chars)');

    // 10. Portfolio or Certifications
    if (
      profile?.portfolioUrl || 
      (Array.isArray(profile?.certificates) && profile.certificates.length > 0) || 
      (Array.isArray(profile?.certifications) && profile.certifications.length > 0)
    ) score += 5;
    else missing.push('Portfolio or Certifications');
  } else {
    // Organizer Profile Criteria
    if (user.name && user.name.trim().length >= 2) score += 20;
    else missing.push('Full Name');

    if (user.email && user.email.includes('@')) score += 20;
    else missing.push('Official Email Address');

    if (user.phone && user.phone.trim().length >= 8) score += 15;
    else missing.push('Contact Phone Number');

    if (user.organizationName && user.organizationName.trim().length >= 2) score += 15;
    else missing.push('Organization / Production House Name');

    if (user.city && user.city.trim().length >= 2) score += 15;
    else missing.push('City');

    if (user.organizationDescription && user.organizationDescription.trim().length >= 15) score += 15;
    else missing.push('Organization Description');
  }

  return {
    completionPercentage: Math.min(100, score),
    missingFields: missing,
  };
};

// @desc    Get currently logged-in user's profile with completion stats
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }

    let profile = null;
    let availability = null;

    if (user.role === 'Freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
      if (!profile) {
        // Auto-initialize profile if missing
        profile = await FreelancerProfile.create({
          userId: user._id,
          primaryRole: 'Event Specialist',
          skills: ['Event Operations'],
          pricePerEvent: 4000,
          experienceYears: 1,
          location: user.city ? `${user.city}, Maharashtra` : 'Pune, Maharashtra',
        });
      }
      availability = await Availability.findOne({ freelancerId: user._id });
    }

    const { completionPercentage, missingFields } = calculateCompletion(user, profile);

    return res.status(200).json({
      success: true,
      user,
      profile,
      availability,
      completionPercentage,
      missingFields,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch profile',
    });
  }
};

// @desc    Update currently logged-in user's profile
// @route   PUT /api/profile/me
// @access  Private
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }

    const {
      // User common fields
      name,
      phone,
      avatar,
      city,
      organizationName,
      organizationDescription,
      headline,
      // Freelancer-specific fields
      primaryRole,
      skills,
      experienceYears,
      previousEventExperience,
      certifications,
      certificates,
      pricePerEvent,
      rateType,
      location,
      languages,
      portfolioUrl,
      availabilityDates,
      availabilityNote,
      bio,
    } = req.body;

    // 1. Update User Document
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar) user.avatar = avatar.trim();
    if (city !== undefined) user.city = city.trim();
    if (organizationName !== undefined) user.organizationName = organizationName.trim();
    if (organizationDescription !== undefined) user.organizationDescription = organizationDescription.trim();
    if (headline !== undefined) user.headline = headline.trim();

    await user.save();

    // 2. If Freelancer, update FreelancerProfile
    let profile = null;
    let availability = null;

    if (user.role === 'Freelancer') {
      profile = await FreelancerProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new FreelancerProfile({ userId: user._id, primaryRole: 'Event Specialist', pricePerEvent: 4000 });
      }

      if (primaryRole) profile.primaryRole = primaryRole.trim();
      if (headline !== undefined) profile.headline = headline.trim();
      if (Array.isArray(skills)) profile.skills = skills;
      if (experienceYears !== undefined) profile.experienceYears = Math.max(0, Number(experienceYears));
      if (previousEventExperience !== undefined) profile.previousEventExperience = previousEventExperience;
      if (Array.isArray(certificates)) {
        profile.certificates = certificates.map(c => ({
          name: (c.name || '').trim(),
          issuingOrganization: (c.issuingOrganization || '').trim(),
          issueDate: (c.issueDate || '').trim(),
          credentialUrl: (c.credentialUrl || '').trim(),
          fileData: c.fileData || '',
          fileName: (c.fileName || '').trim(),
        })).filter(c => c.name && c.issuingOrganization);
        // Also keep string certifications in sync
        profile.certifications = profile.certificates.map(c => `${c.name} (${c.issuingOrganization})`);
      } else if (Array.isArray(certifications)) {
        profile.certifications = certifications;
      }
      if (pricePerEvent !== undefined) profile.pricePerEvent = Math.max(0, Number(pricePerEvent));
      if (rateType) profile.rateType = rateType;
      if (city) profile.city = city.trim();
      if (location) profile.location = location.trim();
      if (Array.isArray(languages)) profile.languages = languages;
      if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl.trim();
      if (Array.isArray(availabilityDates)) profile.availabilityDates = availabilityDates;
      if (availabilityNote !== undefined) profile.availabilityNote = availabilityNote.trim();
      if (bio !== undefined) profile.bio = bio.trim();

      await profile.save();

      // Sync availability dates with Availability collection
      if (Array.isArray(availabilityDates)) {
        availability = await Availability.findOneAndUpdate(
          { freelancerId: user._id },
          { availableDates: availabilityDates, note: availabilityNote || '' },
          { new: true, upsert: true }
        );
      }
    }

    const { completionPercentage, missingFields } = calculateCompletion(user, profile);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        organizationName: user.organizationName,
        organizationDescription: user.organizationDescription,
        headline: user.headline,
      },
      profile,
      availability,
      completionPercentage,
      missingFields,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Update profile photo
// @route   POST /api/profile/photo
// @access  Private
export const updateProfilePhoto = async (req, res) => {
  try {
    const { photoUrl, avatar } = req.body;
    const finalAvatar = photoUrl || avatar;

    if (!finalAvatar) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide a valid image URL or avatar string.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: finalAvatar },
      { new: true }
    ).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update profile photo',
    });
  }
};

// @desc    Get public profile of a user/freelancer by ID
// @route   GET /api/profile/:id
// @access  Public
export const getProfileById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('name email phone avatar role city organizationName organizationDescription headline');
    if (!targetUser) {
      return res.status(404).json({ error: 'NotFound', message: 'Profile not found' });
    }

    let profile = null;
    if (targetUser.role === 'Freelancer') {
      profile = await FreelancerProfile.findOne({ userId: targetUser._id });
    }

    return res.status(200).json({
      success: true,
      user: targetUser,
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to fetch profile',
    });
  }
};

// @desc    Add a certificate to logged-in freelancer profile
// @route   POST /api/profile/certificates
// @access  Private (Freelancer)
export const addCertificate = async (req, res) => {
  try {
    const { name, issuingOrganization, issueDate, credentialUrl, fileData, fileName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Certificate name is required.',
      });
    }

    if (!issuingOrganization || !issuingOrganization.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Issuing organization is required.',
      });
    }

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new FreelancerProfile({
        userId: req.user._id,
        primaryRole: 'Event Specialist',
        pricePerEvent: 4000,
      });
    }

    const newCert = {
      name: name.trim(),
      issuingOrganization: issuingOrganization.trim(),
      issueDate: (issueDate || '').trim(),
      credentialUrl: (credentialUrl || '').trim(),
      fileData: fileData || '',
      fileName: (fileName || '').trim(),
    };

    profile.certificates.push(newCert);
    // Keep string array in sync
    profile.certifications = profile.certificates.map(c => `${c.name} (${c.issuingOrganization})`);

    await profile.save();

    const createdCert = profile.certificates[profile.certificates.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Certificate added successfully',
      certificate: createdCert,
      certificates: profile.certificates,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to add certificate',
    });
  }
};

// @desc    Update an existing certificate
// @route   PUT /api/profile/certificates/:certId
// @access  Private (Freelancer)
export const updateCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    const { name, issuingOrganization, issueDate, credentialUrl, fileData, fileName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Certificate name is required.',
      });
    }

    if (!issuingOrganization || !issuingOrganization.trim()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Issuing organization is required.',
      });
    }

    const profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Freelancer profile not found.',
      });
    }

    const cert = profile.certificates.id(certId);
    if (!cert) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Certificate not found.',
      });
    }

    cert.name = name.trim();
    cert.issuingOrganization = issuingOrganization.trim();
    if (issueDate !== undefined) cert.issueDate = issueDate.trim();
    if (credentialUrl !== undefined) cert.credentialUrl = credentialUrl.trim();
    if (fileData !== undefined) cert.fileData = fileData;
    if (fileName !== undefined) cert.fileName = fileName.trim();

    // Sync string certifications
    profile.certifications = profile.certificates.map(c => `${c.name} (${c.issuingOrganization})`);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      certificate: cert,
      certificates: profile.certificates,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to update certificate',
    });
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/profile/certificates/:certId
// @access  Private (Freelancer)
export const deleteCertificate = async (req, res) => {
  try {
    const { certId } = req.params;

    const profile = await FreelancerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Freelancer profile not found.',
      });
    }

    const certIndex = profile.certificates.findIndex(c => c._id.toString() === certId);
    if (certIndex === -1) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Certificate not found.',
      });
    }

    profile.certificates.splice(certIndex, 1);
    // Sync string certifications
    profile.certifications = profile.certificates.map(c => `${c.name} (${c.issuingOrganization})`);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
      certificates: profile.certificates,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Failed to delete certificate',
    });
  }
};

