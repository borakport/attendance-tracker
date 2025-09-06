'use client';

import Link from 'next/link';
import { ArrowLeft, Save, User, Bell, Shield, Database, MapPin, Key, Edit3, Check, X, Mail, Phone, AlertCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [changePassword, setChangePassword] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState('');
  const [location, setLocation] = useState('');
  
  // Email states
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('admin@smartattendance.com');
  const [newEmailValue, setNewEmailValue] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [emailVerificationPending, setEmailVerificationPending] = useState(false);
  const [showNewEmailInput, setShowNewEmailInput] = useState(false);
  
  // Phone states
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState('+1 (555) 123-4567');
  const [newPhoneValue, setNewPhoneValue] = useState('');
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [phoneVerificationPending, setPhoneVerificationPending] = useState(false);

  useEffect(() => {
    // Auto-detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedTimezone(timezone);

    // Try to get location (simplified)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation('Auto-detected location');
        },
        () => {
          setLocation('Location access denied');
        }
      );
    }
  }, []);

  // Email confirmation flow
  const handleEmailEdit = () => {
    setShowEmailConfirmation(true);
  };

  const sendEmailVerification = async () => {
    setEmailVerificationPending(true);
    // Call local email service
    try {
      // await emailService.sendVerification(emailValue);
      console.log('Sending verification email to:', emailValue);
      // Simulate API call
      setTimeout(() => {
        setEmailVerificationPending(false);
      }, 2000);
    } catch (error) {
      console.error('Email verification failed:', error);
      setEmailVerificationPending(false);
    }
  };

  const handleEmailVerificationComplete = () => {
    setShowEmailConfirmation(false);
    setShowNewEmailInput(true);
  };

  const handleNewEmailSave = async () => {
    // Send verification to new email
    try {
      // await emailService.sendVerification(newEmailValue);
      console.log('Sending verification to new email:', newEmailValue);
      setEmailValue(newEmailValue);
      setShowNewEmailInput(false);
      setEditingEmail(false);
      setNewEmailValue('');
    } catch (error) {
      console.error('New email verification failed:', error);
    }
  };

  // Phone OTP flow
  const handlePhoneEdit = () => {
    setNewPhoneValue(phoneValue);
    setEditingPhone(true);
  };

  const sendPhoneOTP = async () => {
    setPhoneVerificationPending(true);
    setShowPhoneOTP(true);
    // Call local SMS service
    try {
      // await smsService.sendOTP(newPhoneValue);
      console.log('Sending OTP to:', newPhoneValue);
      setTimeout(() => {
        setPhoneVerificationPending(false);
      }, 2000);
    } catch (error) {
      console.error('OTP sending failed:', error);
      setPhoneVerificationPending(false);
    }
  };

  const verifyOTP = async () => {
    try {
      // await smsService.verifyOTP(newPhoneValue, otpValue);
      console.log('Verifying OTP:', otpValue, 'for phone:', newPhoneValue);
      if (otpValue === '123456') { // Mock verification
        setPhoneValue(newPhoneValue);
        setShowPhoneOTP(false);
        setEditingPhone(false);
        setOtpValue('');
        setNewPhoneValue('');
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Save size={20} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Email with Edit Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    <span className="text-gray-700">{emailValue}</span>
                    <button
                      onClick={handleEmailEdit}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Phone with Edit Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                    <span className="text-gray-700">{phoneValue}</span>
                    <button
                      onClick={handlePhoneEdit}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Role as Plain Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="w-full px-3 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-md">
                    System Administrator
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location & Timezone
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Auto-detected:</strong> {detectedTimezone}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {location || 'Detecting location...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive attendance alerts via email</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Daily Reports</h3>
                    <p className="text-sm text-gray-500">Receive daily attendance summaries</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Password Change Section */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Password Management
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Update your account password</p>
                    </div>
                    <button
                      onClick={() => setChangePassword(!changePassword)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        changePassword
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {changePassword ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>
                </div>

                {/* Password Fields - Only show when changePassword is true */}
                {changePassword && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and numbers</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Update Password
                      </button>
                      <button 
                        onClick={() => setChangePassword(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Two-Factor Authentication */}
                <div className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Login Activity */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Login Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Current session - Chrome on Windows</span>
                      <span className="text-xs text-green-600">Active now</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Previous session - Chrome on Windows</span>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <div className="space-y-2">
                    <select 
                      value={detectedTimezone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={detectedTimezone}>{detectedTimezone} (Auto-detected)</option>
                      <option value="America/New_York">America/New_York (Eastern Time)</option>
                      <option value="America/Chicago">America/Chicago (Central Time)</option>
                      <option value="America/Denver">America/Denver (Mountain Time)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                    <p className="text-xs text-gray-500">Automatically detected based on your location</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>MM/DD/YYYY (US Format)</option>
                    <option>DD/MM/YYYY (European Format)</option>
                    <option>YYYY-MM-DD (ISO Format)</option>
                    <option>DD MMM YYYY (Verbose)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Backup</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Every 6 hours</option>
                    <option>Daily at 2 AM</option>
                    <option>Weekly on Sunday</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                    <option>Auto (System)</option>
                  </select>
                </div>
              </div>
              
              {/* Advanced System Settings */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Temporarily disable system access for maintenance</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Debug Logging</h4>
                      <p className="text-sm text-gray-500">Enable detailed system logging for troubleshooting</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Email Confirmation Modal */}
      {showEmailConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Verify Current Email</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  To change your email address, we need to verify your current email first.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Current Email:</strong> {emailValue}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={sendEmailVerification}
                  disabled={emailVerificationPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {emailVerificationPending ? (
                    <>
                      <Clock className="animate-spin h-4 w-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </button>
                <button
                  onClick={() => setShowEmailConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  Already verified your email? Click below to proceed:
                </p>
                <button
                  onClick={handleEmailVerificationComplete}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  I've verified my email, proceed to new email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Email Input Modal */}
      {showNewEmailInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Enter New Email</h3>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={newEmailValue}
                  onChange={(e) => setNewEmailValue(e.target.value)}
                  placeholder="Enter your new email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A verification email will be sent to this new address.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleNewEmailSave}
                  disabled={!newEmailValue}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Send Verification to New Email
                </button>
                <button
                  onClick={() => {
                    setShowNewEmailInput(false);
                    setNewEmailValue('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Edit Modal */}
      {editingPhone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Change Phone Number</h3>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhoneValue}
                  onChange={(e) => setNewPhoneValue(e.target.value)}
                  placeholder="Enter your new phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  An OTP will be sent to this number for verification.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={sendPhoneOTP}
                  disabled={!newPhoneValue || phoneVerificationPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {phoneVerificationPending ? (
                    <>
                      <Clock className="animate-spin h-4 w-4 mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingPhone(false);
                    setNewPhoneValue('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone OTP Verification Modal */}
      {showPhoneOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Enter OTP</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a 6-digit verification code to:
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>{newPhoneValue}</strong>
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For testing: Use code <strong>123456</strong>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={verifyOTP}
                  disabled={otpValue.length !== 6}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Verify & Save
                </button>
                <button
                  onClick={() => {
                    setShowPhoneOTP(false);
                    setOtpValue('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={sendPhoneOTP}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
