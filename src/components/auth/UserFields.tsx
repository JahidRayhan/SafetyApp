
import React from 'react';

interface UserFieldsProps {
  fullName: string;
  setFullName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
}

const UserFields = ({ fullName, setFullName, phoneNumber, setPhoneNumber }: UserFieldsProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </>
  );
};

export default UserFields;
