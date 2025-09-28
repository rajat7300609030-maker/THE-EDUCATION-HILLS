import React, { useState, useMemo } from 'react';
import PageWrapper from '../ui/PageWrapper';
import { Page, InquiryRecord } from '../../types';
// Fix: Corrected the import path for useNotification.
import { useNotification } from '../../contexts/NavigationContext';
import useLocalStorage from '../../hooks/useLocalStorage';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useNavigation } from '../../contexts/NavigationContext';

const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

const InquiryPage: React.FC = () => {
  const [inquiries, setInquiries] = useLocalStorage<InquiryRecord[]>('inquiries', []);
  const { addNotification } = useNotification();
  const { currentPage } = useNavigation();
  
  const [view, setView] = useState<'form' | 'list'>(currentPage.data === 'list' ? 'list' : 'form');
  const [role, setRole] = useState<'Admin' | 'Employee' | 'Student'>('Admin');
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<InquiryRecord | null>(null);

  // State for editing inquiries
  const [editingInquiryId, setEditingInquiryId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<InquiryRecord | null>(null);

  const sortedInquiries = useMemo(() => {
      return [...inquiries].filter(inq => !inq.isDeleted).sort((a, b) => b.timestamp - a.timestamp);
  }, [inquiries]);

  const handleInquirySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInquiry: InquiryRecord = {
        id: `inq-${Date.now()}`,
        role: formData.get('role') as InquiryRecord['role'],
        name: formData.get('name') as string,
        contact: formData.get('contact') as string,
        email: formData.get('email') as string | undefined,
        employeeId: formData.get('employeeId') as string | undefined,
        admissionClass: formData.get('admissionClass') as string | undefined,
        message: formData.get('message') as string,
        timestamp: Date.now(),
    };

    setInquiries(prev => [newInquiry, ...prev]);
    addNotification(`Your inquiry has been submitted successfully.`, 'success');
    e.currentTarget.reset();
    setRole('Admin');
    setView('list');
  };
  
  const handleDeleteClick = (inquiry: InquiryRecord) => {
      setInquiryToDelete(inquiry);
      setDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
      if (!inquiryToDelete) return;
      setInquiries(prev => prev.map(inq => 
        inq.id === inquiryToDelete.id ? { ...inq, isDeleted: true } : inq
      ));
      addNotification('Inquiry moved to Recycle Bin.', 'info');
      setDeleteModalOpen(false);
      setInquiryToDelete(null);
  };

  const handleEditClick = (inquiry: InquiryRecord) => {
    setEditingInquiryId(inquiry.id);
    setEditFormData(inquiry);
  };

  const handleCancelEdit = () => {
    setEditingInquiryId(null);
    setEditFormData(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editFormData) return;
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveEdit = () => {
    if (!editFormData) return;
    setInquiries(prev => prev.map(inq => inq.id === editFormData.id ? editFormData : inq));
    addNotification('Inquiry updated successfully!', 'success');
    handleCancelEdit();
  };

  const renderInquiryForm = () => (
      <div className="neo-container rounded-3xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleInquirySubmit} className="space-y-6">
              {/* Role Selector */}
              <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center relative">
                      <div className="neo-container rounded-full p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                      </div>
                      <select name="role" value={role} onChange={(e) => setRole(e.target.value as InquiryRecord['role'])} className="w-full bg-transparent p-2 text-gray-700 focus:outline-none focus:ring-0 appearance-none" required>
                          <option value="Admin">Inquiry for Admin</option>
                          <option value="Employee">Inquiry for Employee</option>
                          <option value="Student">Inquiry for Student</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                  </div>
              </div>
              {/* Full Name */}
              <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center">
                      <div className="neo-container rounded-full p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                      </div>
                      <input type="text" name="name" placeholder="Your Full Name" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" required />
                  </div>
              </div>
              {/* Contact Number */}
              <div>
                  <div className="neo-button w-full rounded-full p-2 flex items-center">
                      <div className="neo-container rounded-full p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                           </svg>
                      </div>
                      <input type="tel" name="contact" placeholder="Contact Number" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" required />
                  </div>
              </div>
              {/* Role-specific fields */}
              {role === 'Admin' && (
                  <div>
                      <div className="neo-button w-full rounded-full p-2 flex items-center">
                          <div className="neo-container rounded-full p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                          </div>
                          <input type="email" name="email" placeholder="Email Address" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" required />
                      </div>
                  </div>
              )}
              {role === 'Employee' && (
                  <div>
                      <div className="neo-button w-full rounded-full p-2 flex items-center">
                          <div className="neo-container rounded-full p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
                              </svg>
                          </div>
                          <input type="text" name="employeeId" placeholder="Employee ID (Optional)" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" />
                      </div>
                  </div>
              )}
              {role === 'Student' && (
                  <div>
                      <div className="neo-button w-full rounded-full p-2 flex items-center">
                          <div className="neo-container rounded-full p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>
                          </div>
                          <input type="text" name="admissionClass" placeholder="Seeking Admission in Class" className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" required />
                      </div>
                  </div>
              )}
              {/* Textarea */}
              <div>
                  <div className="neo-button w-full rounded-2xl p-2 flex items-start">
                      <div className="neo-container rounded-full p-2 mt-1">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                      </div>
                      <textarea name="message" placeholder="Your Message or Inquiry..." rows={4} className="w-full bg-transparent p-2 text-gray-700 focus:outline-none" required></textarea>
                  </div>
              </div>
              <button type="submit" className="neo-button-primary w-full rounded-full p-3 font-semibold text-lg">Submit Inquiry</button>
          </form>
      </div>
  );

  const renderInquiryList = () => (
      <div className="space-y-6">
          {sortedInquiries.length > 0 ? (
              sortedInquiries.map(inquiry => (
                  <div key={inquiry.id} className="neo-container rounded-2xl p-5">
                      {editingInquiryId === inquiry.id && editFormData ? (
                          // EDITING VIEW
                          <div className="space-y-4">
                              <p className="font-bold text-lg text-gray-800">Editing Inquiry from a {inquiry.role}</p>
                              <div><label className="text-sm font-semibold">Name:</label><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="neo-button w-full p-2 rounded-md" /></div>
                              <div><label className="text-sm font-semibold">Contact:</label><input type="text" name="contact" value={editFormData.contact} onChange={handleEditFormChange} className="neo-button w-full p-2 rounded-md" /></div>
                              {inquiry.role === 'Admin' && <div><label className="text-sm font-semibold">Email:</label><input type="email" name="email" value={editFormData.email || ''} onChange={handleEditFormChange} className="neo-button w-full p-2 rounded-md" /></div>}
                              {inquiry.role === 'Employee' && <div><label className="text-sm font-semibold">Employee ID:</label><input type="text" name="employeeId" value={editFormData.employeeId || ''} onChange={handleEditFormChange} className="neo-button w-full p-2 rounded-md" /></div>}
                              {inquiry.role === 'Student' && <div><label className="text-sm font-semibold">Admission Class:</label><input type="text" name="admissionClass" value={editFormData.admissionClass || ''} onChange={handleEditFormChange} className="neo-button w-full p-2 rounded-md" /></div>}
                              <div><label className="text-sm font-semibold">Message:</label><textarea name="message" value={editFormData.message} onChange={handleEditFormChange} rows={3} className="neo-button w-full p-2 rounded-md"></textarea></div>
                              <div className="flex justify-end space-x-2 pt-2">
                                  <button onClick={handleCancelEdit} className="neo-button rounded-xl px-4 py-2 text-sm font-semibold">Cancel</button>
                                  <button onClick={handleSaveEdit} className="neo-button-success rounded-xl px-4 py-2 text-sm font-semibold">Save</button>
                              </div>
                          </div>
                      ) : (
                          // STATIC VIEW
                          <>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">Inquiry from a {inquiry.role}</p>
                                    <p className="text-xs text-gray-500">{formatTimeAgo(inquiry.timestamp)}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditClick(inquiry)} className="neo-button rounded-full p-2 text-blue-500 hover:text-blue-700" title="Edit Inquiry">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteClick(inquiry)} className="neo-button rounded-full p-2 text-red-500 hover:text-red-700" title="Delete Inquiry">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="border-t border-gray-300 pt-3 mt-3">
                                <div className="space-y-3 text-sm">
                                    <p><strong className="font-semibold text-gray-600">Name:</strong> {inquiry.name}</p>
                                    <p><strong className="font-semibold text-gray-600">Contact:</strong> {inquiry.contact}</p>
                                    {inquiry.email && <p><strong className="font-semibold text-gray-600">Email:</strong> {inquiry.email}</p>}
                                    {inquiry.employeeId && <p><strong className="font-semibold text-gray-600">Employee ID:</strong> {inquiry.employeeId}</p>}
                                    {inquiry.admissionClass && <p><strong className="font-semibold text-gray-600">Admission Class:</strong> {inquiry.admissionClass}</p>}
                                    <div className="neo-button rounded-lg p-3 bg-white mt-2">
                                        <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                                    </div>
                                </div>
                            </div>
                          </>
                      )}
                  </div>
              ))
          ) : (
              <div className="neo-container rounded-xl p-8 text-center text-gray-500">
                  <p>No inquiries submitted yet.</p>
              </div>
          )}
      </div>
  );
  
  return (
    <PageWrapper page={Page.Inquiry}>
        <div className="mb-6">
            <div className="flex justify-center items-center neo-container rounded-full p-1 max-w-sm mx-auto">
                <button onClick={() => setView('form')} className={`w-1/2 rounded-full p-2 text-sm font-semibold transition-all duration-200 ${view === 'form' ? 'neo-button active text-blue-600' : 'text-gray-600'}`}>
                    New Inquiry
                </button>
                <button onClick={() => setView('list')} className={`w-1/2 rounded-full p-2 text-sm font-semibold transition-all duration-200 ${view === 'list' ? 'neo-button active text-blue-600' : 'text-gray-600'}`}>
                    View Submissions ({sortedInquiries.length})
                </button>
            </div>
        </div>

        {view === 'form' ? renderInquiryForm() : renderInquiryList()}

        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Inquiry"
            message={<>Are you sure you want to move this inquiry to the Recycle Bin?</>}
            confirmText="Delete"
            variant="danger"
        />

    </PageWrapper>
  );
};

export default InquiryPage;