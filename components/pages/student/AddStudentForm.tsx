import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../../ui/PageWrapper';
import { Page, Student, Class, FeeStructure, UserProfile } from '../../../types';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useNavigation } from '../../../contexts/NavigationContext';
import { useNotification } from '../../../contexts/NavigationContext';
import ToggleSwitch from '../../ui/ToggleSwitch';
import FormField from '../../ui/FormField';
import { setImage } from '../../../utils/db';
import { getInitialClasses, getInitialStudents } from '../../../utils/seedData';
import useUsers from '../../../hooks/useUsers';
import PasswordField from '../../ui/PasswordField';

const InfoRow: React.FC<{ label: string, value?: string | number }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-gray-800">{value || 'N/A'}</p>
    </div>
);


const AddStudentForm: React.FC = () => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', getInitialStudents);
  const [, setUsers] = useUsers();
  const [classes] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [feeStructure] = useLocalStorage<FeeStructure>('feeStructure', {});
  const { goBack } = useNavigation();
  const { addNotification } = useNotification();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [formState, setFormState] = useState<Omit<Student, 'id' | 'hasPhoto' | 'feesPaid' | 'paymentHistory'>>({
    name: '', fatherName: '', motherName: '', class: '', dob: '', gender: '', religion: '', category: '', cast: '', type: '', totalFees: 0, transportNeeded: false, transportDetails: '', contactNumber: '',
  });
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const newStudentId = useMemo(() => {
    let maxIdNum = 0;
    students.forEach(student => {
      if (student.id && student.id.startsWith('ST')) {
        const num = parseInt(student.id.substring(2));
        if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
      }
    });
    return 'ST' + String(maxIdNum + 1).padStart(3, '0');
  }, [students]);

  useEffect(() => {
    if (formState.class && feeStructure[formState.class]) {
      setFormState(prev => ({ ...prev, totalFees: feeStructure[formState.class] }));
    }
  }, [formState.class, feeStructure]);
  
  useEffect(() => {
    if (studentPhoto) {
      const url = URL.createObjectURL(studentPhoto);
      setPhotoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [studentPhoto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, transportNeeded: e.target.checked }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentPhoto(e.target.files[0]);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!password.trim()) {
        addNotification('A password is required to create a student login.', 'danger');
        return;
    }
    setIsPreviewing(true);
  };
  
  const handleFinalSave = async () => {
    try {
      if (studentPhoto) {
        await setImage(newStudentId, studentPhoto);
      }
      
      const newStudent: Student = {
          ...formState, id: newStudentId, hasPhoto: !!studentPhoto, totalFees: Number(formState.totalFees), feesPaid: 0, paymentHistory: [],
      };

      const newStudentUser: UserProfile = {
          userId: newStudentId, name: formState.name, email: '', phone: formState.contactNumber, role: 'Student', hasPhoto: !!studentPhoto, dob: formState.dob, address: '', password: password,
          notificationSettings: { email: false, sms: true, feeReminders: true, assignmentUpdates: true, examAlerts: true, generalAnnouncements: true, attendanceAlerts: true },
      };

      setStudents(prev => [...prev, newStudent]);
      setUsers(prev => [...prev, newStudentUser]);
      addNotification(`Student "${newStudent.name}" and their login account added successfully.`, 'success');
      goBack();

    } catch (error) {
      console.error("Failed to save student or photo:", error);
      alert("There was an error saving the student's photo. Please try again.");
    }
  };
  
  if (isPreviewing) {
    return (
        <PageWrapper page={Page.AddStudentForm}>
            <div className="neo-container rounded-xl p-6">
                 <h3 className="text-2xl font-bold border-b pb-3 mb-6 text-center">Confirm New Student Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 text-center">
                        {photoPreviewUrl ? (
                            <img src={photoPreviewUrl} alt="Student Preview" className="neo-container rounded-lg w-40 h-48 object-cover mx-auto" />
                        ) : (
                            <div className="neo-container rounded-lg w-40 h-48 mx-auto flex items-center justify-center text-gray-500">No Photo</div>
                        )}
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <InfoRow label="Student ID" value={newStudentId} />
                        <InfoRow label="Student Name" value={formState.name} />
                        <InfoRow label="Father's Name" value={formState.fatherName} />
                        <InfoRow label="Mother's Name" value={formState.motherName} />
                        <InfoRow label="Date of Birth" value={formState.dob} />
                        <InfoRow label="Gender" value={formState.gender} />
                        <InfoRow label="Religion" value={formState.religion} />
                        <InfoRow label="Category" value={formState.category} />
                        <InfoRow label="Cast" value={formState.cast} />
                        <InfoRow label="Class" value={formState.class} />
                        <InfoRow label="Student Type" value={formState.type} />
                        <InfoRow label="Total Fees" value={`₹${formState.totalFees}`} />
                        <InfoRow label="Contact Number" value={formState.contactNumber} />
                        <InfoRow label="Transport" value={formState.transportNeeded ? `Yes (${formState.transportDetails || 'Details N/A'})` : 'No'} />
                        <InfoRow label="Login Password" value="••••••••" />
                    </div>
                 </div>
                 <div className="flex items-center space-x-4 pt-6 mt-6 border-t">
                    <button type="button" onClick={handleFinalSave} className="neo-button-success flex-grow rounded-xl p-3 text-lg font-semibold">Confirm & Save</button>
                    <button type="button" onClick={() => setIsPreviewing(false)} className="neo-button flex-grow rounded-xl p-3 text-lg font-semibold">Go Back & Edit</button>
                </div>
            </div>
        </PageWrapper>
    );
  }

  return (
    <PageWrapper page={Page.AddStudentForm}>
      <form onSubmit={handlePreviewSubmit} className="space-y-6">
        <div className="neo-container rounded-xl p-4 space-y-4">
          <h4 className="text-lg font-bold border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">Personal Information</h4>
          <FormField label="Student Photo" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
            <input type="file" name="student-photo" accept="image/*" onChange={handlePhotoChange} className="neo-button w-full rounded-xl p-3" />
          </FormField>
          <FormField label="Student ID" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>}>
            <div className="neo-container w-full rounded-xl p-3 block text-center font-semibold">{newStudentId}</div>
          </FormField>
          <FormField label="Student Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="e.g., Jane Doe" className="neo-button w-full rounded-xl p-3" required />
          </FormField>
          <FormField label="Father's Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
             <input type="text" name="fatherName" value={formState.fatherName} onChange={handleChange} placeholder="e.g., John Doe" className="neo-button w-full rounded-xl p-3" />
          </FormField>
          <FormField label="Mother's Name" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            <input type="text" name="motherName" value={formState.motherName} onChange={handleChange} placeholder="e.g., Mary Doe" className="neo-button w-full rounded-xl p-3" />
          </FormField>
           <FormField label="Date of Birth" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
            <input type="date" name="dob" value={formState.dob} onChange={handleChange} className="neo-button w-full rounded-xl p-3" required />
          </FormField>
          <FormField label="Gender" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            <select name="gender" value={formState.gender} onChange={handleChange} className="neo-button w-full rounded-xl p-3" required>
              <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Religion" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V3M4.28 9.322a9.027 9.027 0 010 5.356m15.44-5.356a9.027 9.027 0 010 5.356M5.1 5.1a9.05 9.05 0 0113.8 0M18.9 18.9a9.05 9.05 0 01-13.8 0" /></svg>}>
            <select name="religion" value={formState.religion} onChange={handleChange} className="neo-button w-full rounded-xl p-3">
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
            <select name="category" value={formState.category} onChange={handleChange} className="neo-button w-full rounded-xl p-3">
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          <FormField label="Cast" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            <input type="text" name="cast" value={formState.cast} onChange={handleChange} placeholder="e.g., Brahmin" className="neo-button w-full rounded-xl p-3" />
          </FormField>
        </div>

        <div className="neo-container rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-bold border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">Academic & Enrollment</h4>
            <FormField label="Class" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.14M12 14v10" /><path d="M6 16.5V12M18 16.5V12" /></svg>}>
              <select name="class" value={formState.class} onChange={handleChange} className="neo-button w-full rounded-xl p-3" required>
                  <option value="">Select Class</option>
                  {classes.filter(c => !c.isDeleted).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Student Type" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V7a4 4 0 014-4z" /></svg>}>
              <select name="type" value={formState.type} onChange={handleChange} className="neo-button w-full rounded-xl p-3" required>
                  <option value="">Select Type</option><option value="New Student">New Student</option><option value="Old Student">Old Student</option><option value="Free">Free</option>
              </select>
            </FormField>
            <FormField label="Total Fees" icon={<span className="h-5 w-5 text-red-500 font-bold text-lg flex items-center justify-center">₹</span>}>
              <input type="number" name="totalFees" value={formState.totalFees} onChange={handleChange} placeholder="e.g., 5000" className="neo-button w-full rounded-xl p-3" min="0" />
            </FormField>
        </div>

        <div className="neo-container rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-bold border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">Login Credentials</h4>
            <PasswordField
                label="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password for student login"
                required
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />
        </div>

        <div className="neo-container rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-bold border-b border-gray-300 dark:border-gray-700 pb-2 mb-4">Contact & Transport</h4>
            <FormField label="Contact Number" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}>
              <input type="text" name="contactNumber" value={formState.contactNumber} onChange={handleChange} placeholder="e.g., +1234567890" className="neo-button w-full rounded-xl p-3" />
            </FormField>
            <div className="flex items-center justify-between mt-4 mb-2">
                <label className="flex items-center space-x-3 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" /></svg>
                  <span>Transport Needed?</span>
                </label>
                <ToggleSwitch id="transport" checked={formState.transportNeeded} onChange={handleToggle} />
            </div>
            {formState.transportNeeded && (
                <FormField label="Transport Details" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}>
                  <textarea name="transportDetails" value={formState.transportDetails} onChange={handleChange} placeholder="e.g., Bus Route 3, Stop A" rows={3} className="neo-button w-full rounded-xl p-3"></textarea>
                </FormField>
            )}
        </div>
        
        <div className="flex items-center space-x-4 mt-6">
          <button type="submit" className="neo-button-primary flex-grow rounded-xl p-3 text-lg font-semibold">Preview Details</button>
          <button type="button" onClick={goBack} className="neo-button-danger flex-grow rounded-xl p-3 text-lg font-semibold">Cancel</button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default AddStudentForm;