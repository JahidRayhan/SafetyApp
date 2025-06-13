
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import AuthHeader from './AuthHeader';
import UserFields from './UserFields';
import RoleSelector from './RoleSelector';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'govt_admin'>('user');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        onAuthSuccess();
      } else {
        // Check if admin/govt_admin signup needs approval
        if (selectedRole !== 'user') {
          // For admin/govt_admin, create approval request
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone_number: phoneNumber,
                requested_role: selectedRole,
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Create approval request using RPC to avoid type issues
            const { error: approvalError } = await supabase.rpc('create_admin_approval_request' as any, {
              user_id: data.user.id,
              requested_role_input: selectedRole,
              requested_by_email_input: email
            });

            if (approvalError) {
              console.error('Error creating approval request:', approvalError);
            }

            // Create profile with pending status
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
                phone_number: phoneNumber,
                role: 'user', // Set as user until approved
              });
            
            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }
          
          toast({
            title: "Account created - Pending Approval",
            description: `Your ${selectedRole} account has been created and is pending admin approval.`,
          });
          
          // Sign out the user since they need approval
          await supabase.auth.signOut();
          return;
        } else {
          // Regular user signup
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone_number: phoneNumber,
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                full_name: fullName,
                phone_number: phoneNumber,
                role: 'user',
              });
            
            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }
          
          toast({
            title: "Account created!",
            description: "Your SafeGuard account has been created successfully.",
          });
          onAuthSuccess();
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <AuthHeader isLogin={isLogin} />

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <>
              <UserFields 
                fullName={fullName}
                setFullName={setFullName}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
              />
              
              <RoleSelector 
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
              />
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-emergency-500 focus:border-emergency-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emergency-600 hover:text-emergency-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
