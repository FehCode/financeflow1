
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserActivities, UserActivity } from "@/services/userActivity";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const UserActions = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // For demo purposes, we'll fetch activities for user ID 1
    // In a real app, you would get the current user ID from authentication
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Add a small delay to ensure database is initialized
        setTimeout(async () => {
          try {
            const userActivities = await getUserActivities(1);
            setActivities(userActivities);
            setIsLoading(false);
          } catch (error) {
            console.error("Failed to fetch user activities:", error);
            setError("Unable to load activities. Please try again later.");
            setIsLoading(false);
          }
        }, 1000); // 1 second delay to allow database initialization
      } catch (error) {
        console.error("Failed to fetch user activities:", error);
        setError("Unable to load activities. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'login':
        return 'Login';
      case 'signup':
        return 'Sign Up';
      case 'transaction':
        return 'Transaction';
      case 'view_page':
        return 'Page View';
      case 'logout':
        return 'Logout';
      default:
        return 'Other Activity';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity History</h1>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500">{error}</p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" className="ml-2" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : activities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {activities.map((activity) => (
            <Card key={activity.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{getActivityTypeLabel(activity.activity_type)}</CardTitle>
                <CardDescription>{formatDate(activity.timestamp || '')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No activity recorded yet.</p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserActions;
