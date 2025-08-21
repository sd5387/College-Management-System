import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    fileType: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedSubject, selectedType]);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/api/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`/api/subjects/${user.department}/${user.year}/${user.semester}`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;
    
    if (selectedSubject) {
      filtered = filtered.filter(material => material.subject._id === selectedSubject);
    }
    
    if (selectedType) {
      filtered = filtered.filter(material => material.fileType === selectedType);
    }
    
    setFilteredMaterials(filtered);
  };

  const handleUploadChange = (e) => {
    setUploadForm({
      ...uploadForm,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('subjectId', uploadForm.subjectId);
      formData.append('fileType', uploadForm.fileType);
      formData.append('file', selectedFile);
      
      await axios.post('/api/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset form and refresh materials
      setUploadForm({
        title: '',
        description: '',
        subjectId: '',
        fileType: ''
      });
      setSelectedFile(null);
      setShowUploadForm(false);
      fetchMaterials();
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (materialId, fileName) => {
    try {
      const response = await axios.get(`/api/materials/download/${materialId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const deleteFile = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/materials/${materialId}`);
      fetchMaterials();
      alert('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showUploadForm ? 'Cancel Upload' : 'Upload Material'}
          </button>
        </div>
        
        {/* Upload form */}
        {showUploadForm && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Study Material</h3>
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={uploadForm.title}
                      onChange={handleUploadChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      name="subjectId"
                      id="subjectId"
                      value={uploadForm.subjectId}
                      onChange={handleUploadChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={uploadForm.description}
                    onChange={handleUploadChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">
                      File Type
                    </label>
                    <select
                      name="fileType"
                      id="fileType"
                      value={uploadForm.fileType}
                      onChange={handleUploadChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Type</option>
                      <option value="Notes">Notes</option>
                      <option value="PYQ">Previous Year Questions</option>
                      <option value="Syllabus">Syllabus</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                      File (PDF only, max 10MB)
                    </label>
                    <input
                      type="file"
                      name="file"
                      id="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      required
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Materials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="filterSubject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  id="filterSubject"
                  name="filterSubject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">
                  File Type
                </label>
                <select
                  id="filterType"
                  name="filterType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Notes">Notes</option>
                  <option value="PYQ">Previous Year Questions</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedType('');
                  }}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Materials list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Materials</h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredMaterials.length > 0 ? (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div key={material._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{material.title}</h4>
                        <p className="text-sm text-gray-500">{material.subject.subjectName} ({material.subject.subjectCode})</p>
                        <p className="text-sm text-gray-500">{material.fileType}</p>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Uploaded by {material.uploadedBy.name} on {new Date(material.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => downloadFile(material._id, material.title)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Download
                        </button>
                        
                        {material.uploadedBy._id === user.id && (
                          <button
                            onClick={() => deleteFile(material._id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No study materials found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;