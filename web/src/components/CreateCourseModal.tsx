import React from 'react';
import { X, Plus, Calendar, Clock, Users, MapPin, BookOpen, Save } from 'lucide-react';

interface Schedule {
  days: string[];
  startTime: string;
  endTime: string;
  room: string;
}

interface CourseFormData {
  name: string;
  code: string;
  description: string;
  instructorId: string;
  department: string;
  credits: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  schedule: Schedule;
  prerequisites: string[];
  objectives: string[];
  isActive: boolean;
}

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
  instructors: any[];
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit, instructors }: CreateCourseModalProps) {
  const [formData, setFormData] = React.useState<CourseFormData>({
    name: '',
    code: '',
    description: '',
    instructorId: '',
    department: '',
    credits: 3,
    maxStudents: 30,
    startDate: '',
    endDate: '',
    schedule: {
      days: [] as string[],
      startTime: '09:00',
      endTime: '10:30',
      room: ''
    },
    prerequisites: [] as string[],
    objectives: [] as string[],
    isActive: true
  });

  const [currentObjective, setCurrentObjective] = React.useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = React.useState('');

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Engineering',
    'Business',
    'Psychology',
    'Biology'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      instructorId: '',
      department: '',
      credits: 3,
      maxStudents: 30,
      startDate: '',
      endDate: '',
      schedule: {
        days: [] as string[],
        startTime: '09:00',
        endTime: '10:30',
        room: ''
      },
      prerequisites: [] as string[],
      objectives: [] as string[],
      isActive: true
    });
    setCurrentObjective('');
    setCurrentPrerequisite('');
  };

  const addObjective = () => {
    if (currentObjective.trim()) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, currentObjective.trim()]
      }));
      setCurrentObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (currentPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, currentPrerequisite.trim()]
      }));
      setCurrentPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CS101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                <select
                  required
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.firstName} {instructor.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Course description and overview..."
              />
            </div>
          </div>

          {/* Schedule Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule & Duration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Days</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.schedule.days.includes(day.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startTime: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endTime: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <input
                  type="text"
                  value={formData.schedule.room}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, room: e.target.value }
                  })}
                  placeholder="e.g., A101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Prerequisites</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={currentPrerequisite}
                onChange={(e) => setCurrentPrerequisite(e.target.value)}
                placeholder="Add prerequisite course..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <button
                type="button"
                onClick={addPrerequisite}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prereq, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {prereq}
                  <button
                    type="button"
                    onClick={() => removePrerequisite(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Objectives</h3>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={currentObjective}
                onChange={(e) => setCurrentObjective(e.target.value)}
                placeholder="Add learning objective..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
              />
              <button
                type="button"
                onClick={addObjective}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-800">{objective}</span>
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
