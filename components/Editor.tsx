import React, { useState } from 'react';
import { CVData, Experience, Education } from '../types';
import { generateSummary, improveDescription } from '../services/geminiService';
import { Plus, Trash2, Sparkles, ChevronDown, ChevronUp, MagicWand, Copy } from 'lucide-react';

interface EditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const updateSummary = (value: string) => {
    onChange({ ...data, summary: value });
  };

  const handleGenerateSummary = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    const summary = await generateSummary(data.personal.jobTitle, data.skills);
    updateSummary(summary);
    setLoading(prev => ({ ...prev, summary: false }));
  };

  // Skills
  const updateSkills = (value: string) => {
    onChange({ ...data, skills: value.split(',').map(s => s.trim()) });
  };

  // Experience Handling
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: '',
      company: '',
      location: '',
      dates: '',
      description: ''
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const duplicateExperience = (id: string) => {
    const exp = data.experience.find(e => e.id === id);
    if (exp) {
      const newExp = { ...exp, id: Date.now().toString() + Math.random().toString().slice(2, 6) };
      const index = data.experience.findIndex(e => e.id === id);
      const newExperience = [...data.experience];
      newExperience.splice(index + 1, 0, newExp);
      onChange({ ...data, experience: newExperience });
    }
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
  };

  const handleImproveExp = async (id: string, text: string, role: string) => {
    setLoading(prev => ({ ...prev, [`exp-${id}`]: true }));
    const improved = await improveDescription(text, role);
    updateExperience(id, 'description', improved);
    setLoading(prev => ({ ...prev, [`exp-${id}`]: false }));
  };

  // Education Handling
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      dates: '',
      details: ''
    };
    onChange({ ...data, education: [newEdu, ...data.education] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const duplicateEducation = (id: string) => {
    const edu = data.education.find(e => e.id === id);
    if (edu) {
      const newEdu = { ...edu, id: Date.now().toString() + Math.random().toString().slice(2, 6) };
      const index = data.education.findIndex(e => e.id === id);
      const newEducation = [...data.education];
      newEducation.splice(index + 1, 0, newEdu);
      onChange({ ...data, education: newEducation });
    }
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(edu => edu.id !== id) });
  };

  return (
    <div className="space-y-4">
      
      {/* Personal Info */}
      <Section title="Personal Information" isOpen={activeSection === 'personal'} onToggle={() => toggleSection('personal')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={data.personal.fullName} onChange={(v) => updatePersonal('fullName', v)} />
          <Input label="Job Title" value={data.personal.jobTitle} onChange={(v) => updatePersonal('jobTitle', v)} />
          <Input label="Email" value={data.personal.email} onChange={(v) => updatePersonal('email', v)} />
          <Input label="Phone" value={data.personal.phone} onChange={(v) => updatePersonal('phone', v)} />
          <Input label="Location" value={data.personal.location} onChange={(v) => updatePersonal('location', v)} />
          <Input label="LinkedIn (Optional)" value={data.personal.linkedin} onChange={(v) => updatePersonal('linkedin', v)} />
          <Input label="Website (Optional)" value={data.personal.website} onChange={(v) => updatePersonal('website', v)} />
        </div>
      </Section>

      {/* Summary */}
      <Section title="Professional Summary" isOpen={activeSection === 'summary'} onToggle={() => toggleSection('summary')}>
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-32"
            value={data.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="Briefly describe your professional background..."
          />
          <button
            onClick={handleGenerateSummary}
            disabled={loading.summary || !data.personal.jobTitle}
            className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading.summary ? 'Writing...' : <><Sparkles size={14} /> Auto-Write</>}
          </button>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills" isOpen={activeSection === 'skills'} onToggle={() => toggleSection('skills')}>
         <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">List skills separated by commas</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={data.skills.join(', ')}
              onChange={(e) => updateSkills(e.target.value)}
              rows={3}
            />
         </div>
      </Section>

      {/* Experience */}
      <Section title="Experience" isOpen={activeSection === 'experience'} onToggle={() => toggleSection('experience')}>
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  onClick={() => duplicateExperience(exp.id)}
                  className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-50"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input label="Role" value={exp.role} onChange={(v) => updateExperience(exp.id, 'role', v)} />
                <Input label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, 'company', v)} />
                <Input label="Dates" value={exp.dates} onChange={(v) => updateExperience(exp.id, 'dates', v)} />
                <Input label="Location" value={exp.location} onChange={(v) => updateExperience(exp.id, 'location', v)} />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (Bullet points recommended)</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm h-24"
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                />
                 <button
                    onClick={() => handleImproveExp(exp.id, exp.description, exp.role)}
                    disabled={loading[`exp-${exp.id}`] || !exp.description}
                    className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {loading[`exp-${exp.id}`] ? 'Polishing...' : <><Sparkles size={14} /> Polish</>}
                  </button>
              </div>
            </div>
          ))}
          <button
            onClick={addExperience}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2 font-medium"
          >
            <Plus size={18} /> Add Experience
          </button>
        </div>
      </Section>

      {/* Education */}
      <Section title="Education" isOpen={activeSection === 'education'} onToggle={() => toggleSection('education')}>
        <div className="space-y-4">
          {data.education.map((edu) => (
             <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
               <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  onClick={() => duplicateEducation(edu.id)}
                  className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-50"
                  title="Duplicate"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input label="School" value={edu.school} onChange={(v) => updateEducation(edu.id, 'school', v)} />
                <Input label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, 'degree', v)} />
                <Input label="Dates" value={edu.dates} onChange={(v) => updateEducation(edu.id, 'dates', v)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Additional Details</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm h-16"
                  value={edu.details}
                  onChange={(e) => updateEducation(edu.id, 'details', e.target.value)}
                />
              </div>
             </div>
          ))}
           <button
            onClick={addEducation}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2 font-medium"
          >
            <Plus size={18} /> Add Education
          </button>
        </div>
      </Section>
    </div>
  );
};

// Helper Components for Editor
const Section: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
    >
      <span className="font-semibold text-gray-700">{title}</span>
      {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
    </button>
    {isOpen && <div className="p-5 border-t border-gray-100">{children}</div>}
  </div>
);

const Input: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
    <input
      type="text"
      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default Editor;