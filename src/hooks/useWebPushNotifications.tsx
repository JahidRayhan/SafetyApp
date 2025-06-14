import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useActivityLogger } from '@/components/ActivityLog';

export const useWebPushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        setIsSubscribed(true);
        await logActivity('notification', 'Web push notifications enabled', {});
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive instant emergency alerts.",
        });
        return true;
      } else {
        toast({
          title: "Notifications Denied",
          description: "Please enable notifications in your browser settings for emergency alerts.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported, toast, logActivity]);

  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('Notifications not available or not permitted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
        ...options
      });

      // Auto-close after 10 seconds unless it requires interaction
      if (!options?.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      await logActivity('notification', 'Web push notification sent', {
        title,
        options
      });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [isSupported, permission, logActivity]);

  const sendEmergencyNotification = useCallback(async (userName: string, location?: string) => {
    const title = "🚨 Emergency Alert Sent!";
    const body = `Emergency contacts have been notified that ${userName} needs assistance.${location ? ` Location: ${location}` : ''}`;
    
    await sendNotification(title, {
      body,
      tag: 'emergency',
      requireInteraction: true
    });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    sendNotification,
    sendEmergencyNotification
  };
};
