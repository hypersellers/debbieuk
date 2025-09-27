// This service simulates a backend by using localStorage to persist user data.
// In a production application, this would be replaced with API calls to a real database.

export interface UserProfile {
    email: string;
    assessments: string[];
}

const getProfileKey = (email: string) => `hyperseller_profile_${email}`;

/**
 * Retrieves a user's profile from localStorage.
 * @param email The user's email, used as a unique identifier.
 * @returns A promise that resolves to the UserProfile object.
 */
export const getUserProfile = (email: string): Promise<UserProfile> => {
    return new Promise((resolve) => {
        try {
            const profileKey = getProfileKey(email);
            const savedProfile = localStorage.getItem(profileKey);
            if (savedProfile) {
                resolve(JSON.parse(savedProfile));
            } else {
                // Return a default profile for a new user
                resolve({
                    email,
                    assessments: [],
                });
            }
        } catch (error) {
            console.error("Failed to retrieve user profile:", error);
            // On error, return a default profile to ensure the app doesn't crash
            resolve({ email, assessments: [] });
        }
    });
};

/**
 * Saves a new assessment to a user's profile.
 * @param email The user's email.
 * @param newAssessmentText The full text of the newly generated assessment.
 * @returns A promise that resolves when the profile has been saved.
 */
export const saveAssessment = async (email: string, newAssessmentText: string): Promise<void> => {
    return new Promise(async (resolve) => {
        try {
            const profile = await getUserProfile(email);
            // Add the new assessment to the beginning of the list
            profile.assessments.unshift(newAssessmentText);
            
            // To keep localStorage size manageable, only keep the last 5 assessments.
            if (profile.assessments.length > 5) {
                profile.assessments = profile.assessments.slice(0, 5);
            }
            
            const profileKey = getProfileKey(email);
            localStorage.setItem(profileKey, JSON.stringify(profile));

        } catch (error) {
            console.error("Failed to save assessment:", error);
        } finally {
            resolve();
        }
    });
};
