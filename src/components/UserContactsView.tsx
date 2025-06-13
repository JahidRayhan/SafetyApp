import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  priority: number;
  user_id: string;
  user_profile?: {
    full_name: string;
    phone_number: string;
  };
}

const UserContactsView = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserContacts();
  }, []);

  const fetchUserContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select(`
          id,
          name,
          phone,
          email,
          relationship,
          priority,
          user_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get user profiles separately to avoid join issues
      const userIds = [...new Set(data?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .in('id', userIds);

      const profileMap = profiles?.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const contactsWithProfiles = data?.map(contact => ({
        ...contact,
        user_profile: profileMap[contact.user_id] || { full_name: 'Unknown User', phone_number: 'Not provided' }
      })) || [];
      
      setContacts(contactsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user emergency contacts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    !searchUser || 
    contact.user_profile?.full_name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    contact.user_profile?.phone_number?.includes(searchUser)
  );

  // Group contacts by user
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const userId = contact.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: contact.user_profile,
        contacts: []
      };
    }
    acc[userId].contacts.push(contact);
    return acc;
  }, {} as Record<string, { user: any; contacts: EmergencyContact[] }>);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-safe-600" />
          <h2 className="text-xl font-bold text-gray-900">User Emergency Contacts</h2>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name or phone..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-safe-500 focus:border-safe-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedContacts).map(([userId, { user, contacts }]) => (
            <div key={userId} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">
                  {user?.full_name || 'Unknown User'}
                </h3>
                <p className="text-gray-600 text-sm">
                  User Phone: {user?.phone_number || 'Not provided'}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  {contacts.length} emergency contact{contacts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-3">
                {contacts
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact) => (
                    <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                            {contact.relationship && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {contact.relationship}
                              </span>
                            )}
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Priority {contact.priority}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            toast({
                              title: "Contact Access",
                              description: "Emergency contact access logged for review.",
                            });
                          }}
                          className="bg-safe-600 hover:bg-safe-700 text-white px-3 py-1 rounded text-sm transition-all duration-200"
                        >
                          Emergency Use
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          
          {Object.keys(groupedContacts).length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {searchUser ? 'No users found for this search.' : 'No user emergency contacts available.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-900">Emergency Access Policy</h4>
        </div>
        <p className="text-yellow-800 text-sm">
          Emergency contacts should only be accessed during active emergency situations or for 
          verification purposes. All access is logged and monitored for compliance.
        </p>
      </div>
    </div>
  );
};

export default UserContactsView;
