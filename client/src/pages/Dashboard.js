import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [recentMarks, setRecentMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, marksRes] = await Promise.all([
          axios.get('/api/attendance/summary'),
          axios.get('/api/marks/student')
        ]);
        
        setAttendanceSummary(attendanceRes.data);
        setRecentMarks(marksRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {/* Welcome card */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.name}!</h2>
            <p className="mt-1 text-sm text-gray-600">
              Roll No: {user.rollNo} | Department: {user.department} | Year: {user.year} | Semester: {user.semester}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
              <div className="space-y-4">
                {attendanceSummary.map((subject) => (
                  <div key={subject.subjectCode} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{subject.subjectName}</p>
                      <p className="text-xs text-gray-500">{subject.attendedClasses}/{subject.totalClasses} classes</p>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        parseFloat(subject.attendancePercentage) >= 75 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.attendancePercentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recent marks */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Marks</h3>
              {recentMarks.length > 0 ? (
                <div className="space-y-4">
                  {recentMarks.map((mark) => (
                    <div key={mark._id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{mark.subject.subjectName}</p>
                      </div>
                      <div className="ml-4">
                        <span className="text-sm font-medium text-gray-900">
                          Total: {mark.total ? mark.total.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No marks available yet.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">View Attendance</h3>
              <p className="mt-2 text-sm text-gray-500">Check your attendance records for all subjects.</p>
              <div className="mt-4">
                <a
                  href="/attendance"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Attendance
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Check Marks</h3>
              <p className="mt-2 text-sm text-gray-500">View your internal assessment marks.</p>
              <div className="mt-4">
                <a
                  href="/marks"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Marks
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Study Materials</h3>
              <p className="mt-2 text-sm text-gray-500">Access notes, PYQs, and other study materials.</p>
              <div className="mt-4">
                <a
                  href="/materials"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Access Materials
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;