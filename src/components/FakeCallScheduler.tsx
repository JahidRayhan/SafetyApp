
import React, { useState } from 'react';
import { Phone, Calendar, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fakeCallService } from '@/features/fake-call/services/fakeCallService';

const FakeCallScheduler = () => {
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isInstant, setIsInstant] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const triggerFakeCall = () => {
    // Simulate a fake call interface
    const audio = new Audio();
    audio.play().catch(() => {}); // Trigger audio context for mobile
    
    // Create a fake call overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // SECURITY: Build DOM with safe APIs (textContent) instead of innerHTML
    // to prevent XSS via user-controlled contactName / contactNumber.
    const container = document.createElement('div');
    container.style.cssText = 'text-align: center; animation: fadeIn 0.3s ease-in;';

    const avatar = document.createElement('div');
    avatar.style.cssText = 'width: 120px; height: 120px; border-radius: 50%; background: #4CAF50; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;';
    // SVG is static markup with no user input, safe to use innerHTML here
    avatar.innerHTML = `<svg width="60" height="60" fill="white" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;
    container.appendChild(avatar);

    const nameEl = document.createElement('h2');
    nameEl.style.cssText = 'font-size: 24px; margin: 0 0 8px 0;';
    nameEl.textContent = contactName || 'Emergency Contact';
    container.appendChild(nameEl);

    const numberEl = document.createElement('p');
    numberEl.style.cssText = 'font-size: 18px; margin: 0 0 40px 0; opacity: 0.8;';
    numberEl.textContent = contactNumber || '+1 (555) 123-4567';
    container.appendChild(numberEl);

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 20px;';

    const declineBtn = document.createElement('button');
    declineBtn.id = 'decline-call';
    declineBtn.style.cssText = 'width: 70px; height: 70px; border-radius: 50%; background: #f44336; border: none; color: white; font-size: 24px; cursor: pointer;';
    declineBtn.textContent = '✕';
    buttonRow.appendChild(declineBtn);

    const acceptBtn = document.createElement('button');
    acceptBtn.id = 'accept-call';
    acceptBtn.style.cssText = 'width: 70px; height: 70px; border-radius: 50%; background: #4CAF50; border: none; color: white; font-size: 24px; cursor: pointer;';
    acceptBtn.textContent = '✓';
    buttonRow.appendChild(acceptBtn);

    container.appendChild(buttonRow);
    overlay.appendChild(container);

    document.body.appendChild(overlay);

    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    overlay.querySelector('#decline-call')?.addEventListener('click', cleanup);
    overlay.querySelector('#accept-call')?.addEventListener('click', () => {
      cleanup();
      toast({
        title: "Fake call ended",
        description: "The fake call has been successfully completed.",
      });
    });

    // Auto-dismiss after 30 seconds
    setTimeout(cleanup, 30000);
  };

  const scheduleFakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isInstant) {
        triggerFakeCall();
        toast({
          title: "Fake call triggered!",
          description: "Your fake call is now active.",
        });
      } else {
        await fakeCallService.schedule({
          contactName,
          contactNumber,
          scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
          isInstant: false,
        });

        toast({
          title: "Fake call scheduled!",
          description: `Your fake call has been scheduled for ${new Date(scheduledTime).toLocaleString()}.`,
        });

        setContactName('');
        setContactNumber('');
        setScheduledTime('');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Phone className="w-6 h-6 text-safe-600" />
        <h2 className="text-xl font-bold text-gray-900">Fake Call Feature</h2>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How Fake Calls Help</h4>
        <p className="text-blue-800 text-sm">
          Fake calls can help you escape uncomfortable or dangerous situations by providing a believable excuse to leave.
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => {
            setIsInstant(true);
            triggerFakeCall();
          }}
          className="flex-1 bg-safe-600 hover:bg-safe-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Phone className="w-4 h-4" />
          <span>Instant Fake Call</span>
        </button>
      </div>

      <form onSubmit={scheduleFakeCall} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name (for display)
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
            placeholder="Mom, Boss, Friend..."
            required={!isInstant}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (for display)
          </label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
            placeholder="+1 (555) 123-4567"
            required={!isInstant}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Time (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-safe-600 hover:bg-safe-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Calendar className="w-4 h-4" />
          <span>{loading ? 'Scheduling...' : 'Schedule Fake Call'}</span>
        </button>
      </form>
    </div>
  );
};

export default FakeCallScheduler;
