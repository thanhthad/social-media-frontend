import axiosClient from '../api/axiosClient';

const DATING_API_PREFIX = '/dating';

export const datingService = {
  // ==========================================
  // PROFILE APIS
  // ==========================================
  
  // Get my dating profile
  getMe: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/me`);
    return response.data;
  },

  // Get public dating profile of another user
  getPublicProfile: async (userId) => {
    if (!userId) return null;
    const response = await axiosClient.get(`${DATING_API_PREFIX}/users/${userId}`);
    return response.data;
  },

  // Update GPS coordinates - flexible argument handling (supports both (lat, lng) and ({latitude, longitude}))
  updateCoordinates: async (arg1, arg2) => {
    let latitude;
    let longitude;

    if (typeof arg1 === 'object' && arg1 !== null) {
      latitude = arg1.latitude ?? arg1.lat;
      longitude = arg1.longitude ?? arg1.lng ?? arg1.lon;
    } else {
      latitude = arg1;
      longitude = arg2;
    }

    if (latitude === undefined || longitude === undefined) {
      throw new Error('Latitude and Longitude are required');
    }

    const payload = {
      latitude: Number(Number(latitude).toFixed(6)),
      longitude: Number(Number(longitude).toFixed(6)),
    };

    const response = await axiosClient.put(`${DATING_API_PREFIX}/profile/coordinates`, payload);
    return response.data;
  },

  // Update basic info
  updateBasicInfo: async (data) => {
    const payload = {
      displayName: data.displayName ? String(data.displayName).trim() : undefined,
      gender: data.gender || undefined,
      birthday: data.birthday ? String(data.birthday).substring(0, 10) : undefined,
      height: data.height ? Number(data.height) : undefined,
    };
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/profile/basic`, payload);
    return response.data;
  },

  // Update career
  updateCareer: async (data) => {
    const payload = {
      occupation: data.occupation !== undefined ? String(data.occupation).trim() : undefined,
      education: data.education !== undefined ? String(data.education).trim() : undefined,
    };
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/profile/career`, payload);
    return response.data;
  },

  // Update location string
  updateLocation: async (data) => {
    const payload = {
      country: data.country !== undefined ? String(data.country).trim() : undefined,
      city: data.city !== undefined ? String(data.city).trim() : undefined,
      district: data.district !== undefined ? String(data.district).trim() : undefined,
    };
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/profile/location`, payload);
    return response.data;
  },

  // Update bio
  updateBio: async (bio) => {
    const bioText = typeof bio === 'object' && bio !== null ? bio.bio : bio;
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/profile/bio`, {
      bio: bioText !== undefined ? String(bioText).trim() : '',
    });
    return response.data;
  },

  // Update visibility (PUBLIC or PRIVATE)
  updateVisibility: async (visibilitySettings) => {
    const visibility =
      typeof visibilitySettings === 'string'
        ? visibilitySettings
        : visibilitySettings?.visibility ||
          (visibilitySettings?.isVisible === false ? 'PRIVATE' : 'PUBLIC');
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/profile/visibility`, {
      visibility,
    });
    return response.data;
  },

  // Update active status
  updateStatus: async (status) => {
    const active = typeof status === 'object' && status !== null ? status.active : Boolean(status);
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/status`, { active });
    return response.data;
  },

  // Delete dating profile completely
  deleteProfile: async () => {
    const response = await axiosClient.delete(`${DATING_API_PREFIX}/me`);
    return response.data;
  },

  // ==========================================
  // DISCOVERY APIS
  // ==========================================
  
  // Get users for discovery swipe stack
  getDiscovery: async (params = { page: 0, size: 20 }) => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/discovery`, { params });
    return response.data;
  },

  // ==========================================
  // SWIPE APIS
  // ==========================================
  
  // Create a swipe (action: LIKE, DISLIKE, SUPER_LIKE)
  swipe: async (targetUserId, swipeAction) => {
    const response = await axiosClient.post(`${DATING_API_PREFIX}/swipes`, {
      targetUserId: Number(targetUserId),
      action: swipeAction,
    });
    return response.data;
  },

  // Get my swipe history
  getMySwipes: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/swipes/me`);
    return response.data;
  },

  // Get users who liked me
  getUsersWhoLikedMe: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/swipes/me/likes`);
    return response.data;
  },

  // Delete/undo a swipe
  undoSwipe: async (targetUserId) => {
    const response = await axiosClient.delete(`${DATING_API_PREFIX}/swipes/${targetUserId}`);
    return response.data;
  },

  // ==========================================
  // PREFERENCE APIS
  // ==========================================
  
  // Create preferences (initial)
  createPreference: async (preferencesData) => {
    const payload = {
      minAge: Number(preferencesData.minAge) || 18,
      maxAge: Number(preferencesData.maxAge) || 35,
      genderPreference:
        preferencesData.genderPreference ||
        (Array.isArray(preferencesData.preferredGenders) && preferencesData.preferredGenders[0]) ||
        'FEMALE',
      maxDistance: Number(preferencesData.maxDistance) || 50,
    };
    const response = await axiosClient.post(`${DATING_API_PREFIX}/me/preferences`, payload);
    return response.data;
  },

  // Get my preferences
  getMyPreference: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/me/preferences`);
    return response.data;
  },

  // Update preferences
  updatePreference: async (preferencesData) => {
    const payload = {
      minAge: Number(preferencesData.minAge) || 18,
      maxAge: Number(preferencesData.maxAge) || 35,
      genderPreference:
        preferencesData.genderPreference ||
        (Array.isArray(preferencesData.preferredGenders) && preferencesData.preferredGenders[0]) ||
        'FEMALE',
      maxDistance: Number(preferencesData.maxDistance) || 50,
    };
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/preferences`, payload);
    return response.data;
  },

  // ==========================================
  // INTERESTS APIS
  // ==========================================
  
  // Get all available master interests
  getAllInterests: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/interests`);
    return response.data;
  },

  // Get my selected interests
  getMyInterests: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/me/interests`);
    return response.data;
  },

  // Update my interests (pass array of interest IDs)
  updateMyInterests: async (interestIds) => {
    const ids = Array.isArray(interestIds) ? interestIds.map(Number) : [];
    const response = await axiosClient.put(`${DATING_API_PREFIX}/me/interests`, { interestIds: ids });
    return response.data;
  },

  // ==========================================
  // PHOTOS APIS
  // ==========================================
  
  // Upload a new photo
  uploadPhoto: async (file, isPrimary = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary);
    
    const response = await axiosClient.post(`${DATING_API_PREFIX}/me/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Set photo as primary
  setPrimaryPhoto: async (photoId) => {
    const response = await axiosClient.patch(`${DATING_API_PREFIX}/me/photos/${photoId}/primary`);
    return response.data;
  },

  // Delete a photo
  deletePhoto: async (photoId) => {
    const response = await axiosClient.delete(`${DATING_API_PREFIX}/me/photos/${photoId}`);
    return response.data;
  },

  // ==========================================
  // MATCHES APIS
  // ==========================================
  
  // Get all active matches
  getMyMatches: async () => {
    const response = await axiosClient.get(`${DATING_API_PREFIX}/matches`);
    return response.data;
  },

  // Unmatch a match
  unmatch: async (matchId) => {
    const response = await axiosClient.delete(`${DATING_API_PREFIX}/matches/${matchId}`);
    return response.data;
  },

  // Report a user
  reportUser: async (targetUserId, reasonId, description) => {
    const response = await axiosClient.post(`${DATING_API_PREFIX}/reports`, {
      targetUserId: Number(targetUserId),
      reasonId: Number(reasonId),
      description: description ? String(description).trim() : '',
    });
    return response.data;
  },
};

export default datingService;
