
import React from 'react';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellRing, AlertTriangle } from 'lucide-react';

const NotificationSettings = () => {
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    requestPermission,
    sendNotification 
  } = useWebPushNotifications();

  const handleTestNotification = async () => {
    await sendNotification('Test Notification', {
      body: 'This is a test notification from SafeGuard.',
      tag: 'test'
    });
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Emergency alerts will still work through other methods.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? (
            <BellRing className="h-5 w-5 text-green-500" />
          ) : (
            <Bell className="h-5 w-5 text-gray-500" />
          )}
          Browser Notifications
        </CardTitle>
        <CardDescription>
          Enable instant browser notifications for emergency alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Browser notifications are not enabled. Click below to enable instant emergency alerts.
            </p>
            <Button onClick={requestPermission} className="w-full">
              Enable Notifications
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Notifications are blocked. Please enable them in your browser settings for emergency alerts.
            </p>
            <Button onClick={requestPermission} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-2">
            <p className="text-sm text-green-600">
              ✅ Notifications are enabled! You'll receive instant emergency alerts.
            </p>
            <Button onClick={handleTestNotification} variant="outline" className="w-full">
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
