import React, { useState, useEffect, useRef } from 'react';
import { Student, Class } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import { getInitialClasses } from '../../utils/seedData';
import { setImage } from '../../utils/db';
import FormField from './FormField';
import ToggleSwitch from './ToggleSwitch';
import StudentPhoto from './StudentPhoto';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  student: Student;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, onSave, student }) => {
  const [classes] = useLocalStorage<Class[]>('classes', getInitialClasses);
  const [formState, setFormState] = useState<Omit<Student, 'id' | 'hasPhoto' | 'feesPaid' | 'paymentHistory'>>({
      name: '', fatherName: '', motherName: '', class: '', dob: '', gender: '', religion: '', category: '', cast: '', type: '', totalFees: 0, transportNeeded: false, transportDetails: '', contactNumber: '',
  });
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreviewUrl, setNewPhotoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
      const { id, hasPhoto, feesPaid, paymentHistory, ...rest } = student;
      setFormState(rest);
      setNewPhotoFile(null);
      setNewPhotoPreviewUrl(null);
  }, [student, isOpen]);
  
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
      if (newPhotoPreviewUrl) URL.revokeObjectURL(newPhotoPreviewUrl);
      setNewPhotoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let hasPhoto = student.hasPhoto;
      if (newPhotoFile) {
        await setImage(student.id, newPhotoFile);
        hasPhoto = true;
      }

      const updatedStudent: Student = {
        ...student,
        ...formState,
        hasPhoto: hasPhoto,
        totalFees: Number(formState.totalFees)
      };
      
      onSave(updatedStudent);
    } catch (error) {
      console.error("Failed to update student data:", error);
      alert("An error occurred while updating the student.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container neo-container max-w-3xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-5 border-b">
            <h3 className="text-xl font-semibold">Edit {student.name}'s Profile</h3>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <FormField label="Student Photo" icon={<div/>}>
                  <input type="file" name="student-photo" accept="image/*" onChange={handlePhotoChange} className="neo-button w-full rounded-xl p-3" />
                  <div className="mt-2 flex items-center space-x-4">
                      <p className="text-xs">Current: <StudentPhoto studentId={student.id} hasPhoto={student.hasPhoto} alt="Current" className="neo-container rounded-full w-16 h-16 object-cover" /></p>
                      {newPhotoPreviewUrl && <p className="text-xs">New: <img src={newPhotoPreviewUrl} alt="New Preview" className="neo-container rounded-full w-16 h-16 object-cover" /></p>}
                  </div>
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Student Name" icon={<div/>}><input type="text" name="name" value={formState.name} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required /></FormField>
                <FormField label="Father's Name" icon={<div/>}><input type="text" name="fatherName" value={formState.fatherName} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <FormField label="Mother's Name" icon={<div/>}><input type="text" name="motherName" value={formState.motherName} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <FormField label="Date of Birth" icon={<div/>}><input type="date" name="dob" value={formState.dob} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required /></FormField>
                <FormField label="Gender" icon={<div/>}><select name="gender" value={formState.gender} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></FormField>
                <FormField label="Religion" icon={<div/>}><input type="text" name="religion" value={formState.religion || ''} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <FormField label="Category" icon={<div/>}><select name="category" value={formState.category || ''} onChange={handleChange} className="neo-button w-full p-2 rounded-md"><option value="">Select Category</option><option value="General">General</option><option value="OBC">OBC</option><option value="SC">SC</option><option value="ST">ST</option><option value="Other">Other</option></select></FormField>
                <FormField label="Cast" icon={<div/>}><input type="text" name="cast" value={formState.cast || ''} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <FormField label="Class" icon={<div/>}><select name="class" value={formState.class} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required><option value="">Select</option>{classes.filter(c=>!c.isDeleted).map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></FormField>
                <FormField label="Student Type" icon={<div/>}><select name="type" value={formState.type} onChange={handleChange} className="neo-button w-full p-2 rounded-md" required><option value="New Student">New Student</option><option value="Old Student">Old Student</option><option value="Free">Free</option></select></FormField>
                <FormField label="Total Fees" icon={<div/>}><input type="number" name="totalFees" value={formState.totalFees} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <FormField label="Contact Number" icon={<div/>}><input type="text" name="contactNumber" value={formState.contactNumber} onChange={handleChange} className="neo-button w-full p-2 rounded-md" /></FormField>
                <div className="flex items-center justify-between"><label>Transport Needed?</label><ToggleSwitch id="transport" checked={formState.transportNeeded} onChange={handleToggle} /></div>
                {formState.transportNeeded && <div className="md:col-span-2"><FormField label="Transport Details" icon={<div/>}><textarea name="transportDetails" value={formState.transportDetails} onChange={handleChange} rows={2} className="neo-button w-full p-2 rounded-md"></textarea></FormField></div>}
              </div>
          </div>
          <div className="flex items-center justify-end p-6 space-x-2 border-t">
            <button onClick={onClose} type="button" className="neo-button rounded-xl px-5 py-2.5">Cancel</button>
            <button type="submit" className="neo-button-success rounded-xl px-5 py-2.5">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;