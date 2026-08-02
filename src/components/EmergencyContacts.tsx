
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Plus, Trash2, Edit3, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { panelBase, panelHeader, rowBetween, stackLoose } from '@/shared/ui/styles';
import { mergeClasses } from '@/shared/lib/styles';
import { contactService } from '@/features/emergency-contacts/services/contactService';
import { sosService } from '@/features/sos/services/sosService';
import type {
  ContactDirectoryEntry,
  ContactDirectoryDraft,
  ContactPriority,
  ContactRelationship,
} from '@/features/emergency-contacts/domain/types';

type Contact = ContactDirectoryEntry;

const EMPTY_DRAFT: ContactDirectoryDraft = {
  name: '',
  phone: '',
  email: '',
  relationship: null,
  priority: 1,
};

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<ContactDirectoryDraft>(EMPTY_DRAFT);

  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const list = await contactService.list();
      setContacts(list);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load emergency contacts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the name and phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await contactService.create(newContact);
      const addedName = newContact.name;
      setNewContact(EMPTY_DRAFT);
      setIsAddingContact(false);
      fetchContacts();
      toast({
        title: "Contact Added",
        description: `${addedName} has been added to your emergency contacts.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeContact = async (id: string) => {
    try {
      const contact = contacts.find((c) => c.id === id);
      await contactService.remove(id);
      fetchContacts();
      toast({
        title: "Contact Removed",
        description: `${contact?.name ?? 'Contact'} has been removed from your emergency contacts.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const callContact = (phone: string, name: string) => {
    toast({
      title: "Calling...",
      description: `Initiating call to ${name}`,
    });
    window.open(`tel:${phone}`);
  };

  const sendEmergencyAlert = async () => {
    try {
      const incident = await sosService.createIncident();
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          void sosService.updateIncidentLocation(incident.id, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        });
      }
      toast({
        title: "Emergency Alert Sent!",
        description: "All emergency contacts have been notified.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={stackLoose}>
      <div className={panelBase}>
        <div className={mergeClasses(rowBetween, "mb-6")}>
          <h2 className={panelHeader}>Emergency Contacts</h2>
          <button
            onClick={() => setIsAddingContact(!isAddingContact)}
            className="bg-emergency-600 hover:bg-emergency-700 text-white p-2 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {isAddingContact && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <h3 className="font-medium text-gray-900">Add New Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newContact.name}
                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              />
              <select
                value={newContact.relationship ?? ''}
                onChange={(e) => setNewContact({...newContact, relationship: (e.target.value || null) as ContactRelationship | null})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              >
                <option value="">Select Relationship</option>
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Colleague">Colleague</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Emergency Service">Emergency Service</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addContact}
                className="bg-safe-600 hover:bg-safe-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Add Contact
              </button>
              <button
                onClick={() => setIsAddingContact(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-bold text-gray-900">{contact.name}</h3>
                    {contact.relationship && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => callContact(contact.phone, contact.name)}
                    className="bg-safe-600 hover:bg-safe-700 text-white p-2 rounded-lg transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeContact(contact.id)}
                    className="bg-emergency-600 hover:bg-emergency-700 text-white p-2 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {contacts.length === 0 && (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No emergency contacts added yet.</p>
              <p className="text-sm text-gray-500 mt-1">Add contacts who should be notified during emergencies.</p>
            </div>
          )}
        </div>

        {contacts.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={sendEmergencyAlert}
              className="w-full bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Send Emergency Alert to All Contacts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyContacts;
