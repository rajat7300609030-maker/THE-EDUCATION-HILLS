import React, { useState, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student, Class } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import ToggleSwitch from '../../ui/ToggleSwitch';
import FormField from '../../ui/FormField';
import { setImage } from '../../../utils/db';
import StudentPhoto from '../../ui/StudentPhoto';
import { getInitialClasses, getInitialStudents } from '../../../utils/seedData';

const EditStudentForm: React.FC = () => {
  const { currentPage, goBack } = useNavigation();
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const [classes] = useLocalStorage<Class[]>('classes', getInitialClasses);
  
  // Fix: Changed currentPage.dataId to currentPage.data to match NavigationState interface
  const studentId = currentPage.data as string;
  const studentToEdit = students.find(s => s.id === studentId);

  const [formState, setFormState] = useState<Omit<Student, 'id' | 'hasPhoto' | 'feesPaid' | 'paymentHistory'>>({
    name: '', fatherName: '', motherName: '', class: '', dob: '', gender: '', religion: '', category: '', cast: '', type: '', totalFees: 0, transportNeeded: false, transportDetails: '', contactNumber: '',
  });
  
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreviewUrl, setNewPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      const { id, hasPhoto, feesPaid, paymentHistory, ...rest } = studentToEdit;
      setFormState(rest);
    }
  }, [studentToEdit]);

  useEffect(() => {
    // Cleanup object URL on component unmount
    return () => {
      if (newPhotoPreviewUrl) {
        URL.revokeObjectURL(newPhotoPreviewUrl);
      }
    };
  }, [newPhotoPreviewUrl]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, transportNeeded: e.target.checked }));
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhotoFile(file);
      if (newPhotoPreviewUrl) {
        URL.revokeObjectURL(newPhotoPreviewUrl);
      }
      setNewPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToEdit) return;

    try {
      let hasPhoto = studentToEdit.hasPhoto;
      if (newPhotoFile) {
        await setImage(studentToEdit.id, newPhotoFile);
        hasPhoto = true;
      }

      const updatedStudent: Student = {
          ...formState,
          id: studentToEdit.id,
          hasPhoto: hasPhoto,
          feesPaid: studentToEdit.feesPaid || 0,
          paymentHistory: studentToEdit.paymentHistory || [],
          totalFees: Number(formState.totalFees)
      };
      
      const updatedStudents = students.map(s => s.id === studentToEdit.id ? updatedStudent : s);
      setStudents(updatedStudents);
      alert('Student updated successfully!');
      goBack();

    } catch (error) {
      console.error("Failed to update student data:", error);
      alert("An error occurred while updating the student. Please try again.");
    }
  };
  
  if (!studentToEdit) {
    return <PageWrapper page={Page.EditStudent}><p>Student not found.</p></PageWrapper>;
  }

  return (
    <PageWrapper page={Page.EditStudent}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="neo-container rounded-xl p-4 space-y-4">
          <h4 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Personal Information</h4>
          <FormField label="Student Photo" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
            <input type="file" name="student-photo" accept="image/*" onChange={handlePhotoChange} className="neo-button w-full rounded-xl p-3 text-gray-700" />
             <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current Photo:</p>
                 {newPhotoPreviewUrl ? (
                    <img src={newPhotoPreviewUrl} alt="New Preview" className="neo-container rounded-full w-20 h-20 object-cover" />
                 ) : (
                    <StudentPhoto 
                        studentId={studentToEdit.id}
                        hasPhoto={studentToEdit.hasPhoto}
                        alt="Current"
                        className="neo-container rounded-full w-20 h-20 object-cover"
                    />
                 )}
            </div>
          </FormField>
          <FormField label="Student ID" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>}>
            <div className="neo-container w-full rounded-xl p-3 block text-center text-gray-700 font-semibold">{studentToEdit.id}</div>
          </FormField>
          <FormField label="Student Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input type="text" name="name" value={formState.name} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" required />
          </FormField>
           <FormField label="Father's Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
             <input type="text" name="fatherName" value={formState.fatherName} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" />
          </FormField>
          <FormField label="Mother's Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
             <input type="text" name="motherName" value={formState.motherName} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" />
          </FormField>
          <FormField label="Date of Birth" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
            <input type="date" name="dob" value={formState.dob} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" required />
          </FormField>
          <FormField label="Gender" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            <select name="gender" value={formState.gender} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" required>
              <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Religion" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3M4.28 9.322a9.027 9.027 0 010 5.356m15.44-5.356a9.027 9.027 0 010 5.356M5.1 5.1a9.05 9.05 0 0113.8 0M18.9 18.9a9.05 9.05 0 01-13.8 0" /></svg>}>
            <select name="religion" value={formState.religion || ''} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700">
              <option value="">Select Religion</option>
              <option value="Hinduism">Hinduism</option>
              <option value="Islam">Islam</option>
              <option value="Christianity">Christianity</option>
              <option value="Sikhism">Sikhism</option>
              <option value="Buddhism">Buddhism</option>
              <option value="Jainism">Jainism</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Category" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
            <select name="category" value={formState.category || ''} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700">
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Cast" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            <input type="text" name="cast" value={formState.cast || ''} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" />
          </FormField>
        </div>

        <div className="neo-container rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Academic & Enrollment</h4>
            <FormField label="Class" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>}>
              <select name="class" value={formState.class} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" required>
                  <option value="">Select Class</option>
                  {classes.filter(c => !c.isDeleted).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Student Type" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V7a4 4 0 014-4z" /></svg>}>
              <select name="type" value={formState.type} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" required>
                  <option value="">Select Type</option><option value="New Student">New Student</option><option value="Old Student">Old Student</option><option value="Free">Free</option>
              </select>
            </FormField>
            <FormField label="Total Fees" icon={<span className="h-5 w-5 text-red-500 font-bold text-lg flex items-center justify-center">₹</span>}>
              <input type="number" name="totalFees" value={formState.totalFees} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" min="0" />
            </FormField>
        </div>
        <div className="neo-container rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-4">Contact & Transport</h4>
             <FormField label="Contact Number" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
                <input type="text" name="contactNumber" value={formState.contactNumber} onChange={handleChange} className="neo-button w-full rounded-xl p-3 text-gray-700" />
            </FormField>
            <div className="flex items-center justify-between mt-4 mb-2">
                <label className="flex items-center space-x-3 text-sm font-medium text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" /></svg>
                  <span>Transport Needed?</span>
                </label>
                <ToggleSwitch id="transport" checked={formState.transportNeeded} onChange={handleToggle} />
            </div>
            {formState.transportNeeded && (
              <FormField label="Transport Details" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}>
                <textarea name="transportDetails" value={formState.transportDetails} onChange={handleChange} rows={3} className="neo-button w-full rounded-xl p-3 text-gray-700"></textarea>
              </FormField>
            )}
        </div>
        <div className="flex items-center space-x-4 mt-6">
          <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Update Student</button>
          <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default EditStudentForm;