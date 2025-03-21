import { db } from './database';

export type ActivityType = 'login' | 'signup' | 'transaction' | 'view_page' | 'logout' | 'other';

export interface UserActivity {
  id: string;
  userId: string;
  activityType: ActivityType;
  description: string;
  timestamp: string;
}

interface DBUserActivity extends UserActivity {
  id: string;
}

// Log a new user activity
export const logUserActivity = async (
  userId: string | null,
  activityType: ActivityType,
  description: string
): Promise<boolean> => {
  try {
    const activity: DBUserActivity = {
      id: crypto.randomUUID(),
      userId: userId || 'anonymous',
      activityType,
      description,
      timestamp: new Date().toISOString()
    };

    await db.saveActivity(activity);
    console.log(`User activity logged: ${activityType} - ${description}`);
    return true;
  } catch (error) {
    console.error("Failed to log user activity:", error);
    return false;
  }
};

// Get all activities for a specific user
export const getUserActivities = async (userId: string): Promise<UserActivity[]> => {
  try {
    const activities = await db.getActivities(userId);
    return activities as UserActivity[]; // Safe type cast since they have the same structure
  } catch (error) {
    console.error("Failed to get user activities:", error);
    return [];
  }
};

// Get recent activities for all users (admin function)
export const getRecentActivities = async (limit: number = 50): Promise<UserActivity[]> => {
  try {
    const activities = await db.getAllActivities(limit);
    return activities as UserActivity[]; // Safe type cast since they have the same structure
  } catch (error) {
    console.error("Failed to get recent activities:", error);
    return [];
  }
};
