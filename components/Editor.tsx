
import React, { useState } from 'react';
import { CVData, Experience, Education, CustomSection, CustomItem } from '../types';
import { generateSummary, improveDescription } from '../services/geminiService';
import { 
  Plus, Trash2, Sparkles, ChevronDown, ChevronUp, Copy, GripVertical, LayoutList, X, 
  Briefcase, GraduationCap, Globe, Award, Folder, FileText, Heart, Users, BookOpen, PenTool, Puzzle,
  LayoutTemplate
} from 'lucide-react';

interface EditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onOpenTemplateSelector?: () => void;
}

const sectionIcons: Record<string, React.ElementType> = {
  personal: Users,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: PenTool,
  languages: Globe,
  certificates: Award,
  interests: Heart,
  projects: Folder,
  courses: BookOpen,
  awards: Award,
  organisations: Users,
  publications: FileText,
  references: Users,
  declaration: PenTool,
  custom: Puzzle,
};

const sectionTitles: Record<string, string> = {
  personal: 'Profile',
  summary: 'Professional Summary',
  experience: 'Professional Experience',
  education: 'Education',
  skills: 'Skills'
};

const Editor: React.FC<EditorProps> = ({ data, onChange, onOpenTemplateSelector }) => {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isReordering, setIsReordering] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);

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

  const handleOpenTemplateSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenTemplateSelector && typeof onOpenTemplateSelector === 'function') {
        onOpenTemplateSelector();
    } else {
        console.warn("onOpenTemplateSelector prop is missing");
    }
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

  // Unified Section Management
  const removeSection = (sectionId: string) => {
    if (sectionId === 'personal') return; // Cannot remove personal details

    if (window.confirm("Are you sure you want to remove this section?")) {
        const isCustom = data.customSections.some(s => s.id === sectionId);
        
        onChange({
            ...data,
            sectionOrder: data.sectionOrder.filter(id => id !== sectionId),
            customSections: isCustom 
                ? data.customSections.filter(s => s.id !== sectionId)
                : data.customSections
        });
    }
  };

  const handleAddSection = (type: string, title: string) => {
    // If it's a standard section that was removed, just add it back to order
    const standardSections = ['summary', 'experience', 'education', 'skills'];
    if (standardSections.includes(type)) {
        if (!data.sectionOrder.includes(type)) {
            onChange({
                ...data,
                sectionOrder: [...data.sectionOrder, type]
            });
            setActiveSection(type);
        }
        setIsAddingSection(false);
        return;
    }

    // If it's a new custom section
    const newSectionId = `custom-${type}-${Date.now()}`;
    const newSection: CustomSection = {
      id: newSectionId,
      name: type,
      title: title,
      items: [],
      isCustom: true
    };

    // Add initial item for better UX
    newSection.items.push({
        id: Date.now().toString(),
        title: '',
        subtitle: '',
        date: '',
        description: ''
    });

    onChange({
      ...data,
      customSections: [...data.customSections, newSection],
      sectionOrder: [...data.sectionOrder, newSectionId]
    });
    setIsAddingSection(false);
    setActiveSection(newSectionId);
  };

  const updateCustomSectionTitle = (sectionId: string, newTitle: string) => {
    onChange({
      ...data,
      customSections: data.customSections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s)
    });
  };

  const addCustomItem = (sectionId: string) => {
    const newItem: CustomItem = {
      id: Date.now().toString(),
      title: '',
      subtitle: '',
      date: '',
      description: ''
    };
    onChange({
      ...data,
      customSections: data.customSections.map(s => 
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    });
  };

  const updateCustomItem = (sectionId: string, itemId: string, field: keyof CustomItem, value: string) => {
    onChange({
      ...data,
      customSections: data.customSections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i) 
        } : s
      )
    });
  };

  const removeCustomItem = (sectionId: string, itemId: string) => {
    onChange({
      ...data,
      customSections: data.customSections.map(s => 
        s.id === sectionId ? { 
          ...s, 
          items: s.items.filter(i => i.id !== itemId)
        } : s
      )
    });
  };

  const renderSection = (id: string) => {
    // Standard Sections
    if (id === 'personal') {
        return (
          <Section key="personal" title="Personal Information" isOpen={activeSection === 'personal'} onToggle={() => toggleSection('personal')} icon={sectionIcons.personal}>
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
        );
    }
    if (id === 'summary') {
        return (
          <Section key="summary" title="Professional Summary" isOpen={activeSection === 'summary'} onToggle={() => toggleSection('summary')} icon={sectionIcons.summary} onDelete={() => removeSection('summary')}>
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
        );
    }
    if (id === 'skills') {
        return (
          <Section key="skills" title="Skills" isOpen={activeSection === 'skills'} onToggle={() => toggleSection('skills')} icon={sectionIcons.skills} onDelete={() => removeSection('skills')}>
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
        );
    }
    if (id === 'experience') {
        return (
          <Section key="experience" title="Experience" isOpen={activeSection === 'experience'} onToggle={() => toggleSection('experience')} icon={sectionIcons.experience} onDelete={() => removeSection('experience')}>
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
        );
    }
    if (id === 'education') {
        return (
          <Section key="education" title="Education" isOpen={activeSection === 'education'} onToggle={() => toggleSection('education')} icon={sectionIcons.education} onDelete={() => removeSection('education')}>
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
        );
    }

    // Custom Sections
    const customSection = data.customSections.find(s => s.id === id);
    if (customSection) {
        const Icon = sectionIcons[customSection.name] || sectionIcons.custom;
        return (
            <Section 
                key={customSection.id} 
                title={customSection.title} 
                isOpen={activeSection === customSection.id} 
                onToggle={() => toggleSection(customSection.id)} 
                icon={Icon}
                onDelete={() => removeSection(customSection.id)}
                isCustom
                onRename={(newTitle) => updateCustomSectionTitle(customSection.id, newTitle)}
            >
                <div className="space-y-4">
                    {customSection.items.map((item) => (
                        <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                             <button
                                onClick={() => removeCustomItem(customSection.id, item.id)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                title="Remove"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <Input 
                                    label={
                                        customSection.name === 'languages' ? 'Language' : 
                                        customSection.name === 'projects' ? 'Project Name' :
                                        customSection.name === 'certificates' ? 'Certificate Name' :
                                        'Title'
                                    } 
                                    value={item.title} 
                                    onChange={(v) => updateCustomItem(customSection.id, item.id, 'title', v)} 
                                />
                                <Input 
                                    label={
                                        customSection.name === 'languages' ? 'Proficiency (e.g. Fluent)' : 
                                        customSection.name === 'projects' ? 'Role / Tech Stack' :
                                        customSection.name === 'certificates' ? 'Issuer' :
                                        'Subtitle / Role'
                                    } 
                                    value={item.subtitle} 
                                    onChange={(v) => updateCustomItem(customSection.id, item.id, 'subtitle', v)} 
                                />
                                <Input label="Date / Period (Optional)" value={item.date} onChange={(v) => updateCustomItem(customSection.id, item.id, 'date', v)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Description / Details (Optional)</label>
                                <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm h-16"
                                value={item.description}
                                onChange={(e) => updateCustomItem(customSection.id, item.id, 'description', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => addCustomItem(customSection.id)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                </div>
            </Section>
        )
    }

    return null;
  };

  const currentOrder = data.sectionOrder || ['personal', 'summary', 'experience', 'education', 'skills'];
  
  const getSectionTitle = (id: string) => {
      if (sectionTitles[id]) return sectionTitles[id];
      const custom = data.customSections.find(s => s.id === id);
      return custom ? custom.title : id;
  };

  return (
    <div className="space-y-4 pb-24">
      
      {/* Template Selection Banner */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="p-5 relative z-10">
            <h3 className="font-bold text-lg text-slate-900 mb-1">Apply a design template</h3>
            <p className="text-slate-500 text-xs mb-4">Update your entire resume design with one click.</p>
            
            <div className="relative h-32 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden mb-0 flex items-center justify-center">
                {/* Mock Background Templates */}
                <div className="absolute inset-0 flex gap-2 opacity-30 grayscale p-2 overflow-hidden pointer-events-none">
                    {[1,2,3,4].map(i => (
                         <div key={i} className="w-24 h-32 bg-white border border-gray-200 shadow-sm shrink-0 rounded-sm flex flex-col gap-1 p-1">
                             <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                             <div className="h-1 w-2/3 bg-gray-200 rounded-sm"></div>
                             <div className="h-1 w-full bg-gray-100 mt-1"></div>
                             <div className="h-1 w-full bg-gray-100"></div>
                             <div className="h-1 w-full bg-gray-100"></div>
                         </div>
                    ))}
                </div>

                <button 
                    type="button"
                    onClick={handleOpenTemplateSelector}
                    className="relative z-20 bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-50 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <LayoutTemplate size={16} />
                    Browse Templates
                </button>
            </div>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsReordering(true)}
          className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          <LayoutList size={16} />
          Reorder Sections
        </button>
      </div>

      {currentOrder.map(id => renderSection(id))}
      
      <button
        onClick={() => setIsAddingSection(true)}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-rose-600 transition-all flex justify-center items-center gap-3 font-bold text-lg transform hover:-translate-y-0.5"
      >
        <Plus size={24} /> Add Content
      </button>

      {isReordering && (
        <ReorderModal
          order={currentOrder}
          getLabel={getSectionTitle}
          onClose={() => setIsReordering(false)}
          onUpdate={(newOrder) => onChange({ ...data, sectionOrder: newOrder })}
        />
      )}

      {isAddingSection && (
        <AddSectionModal 
            onClose={() => setIsAddingSection(false)}
            onAdd={handleAddSection}
            existingSections={currentOrder}
        />
      )}
    </div>
  );
};

interface AddSectionModalProps {
    onClose: () => void;
    onAdd: (type: string, title: string) => void;
    existingSections: string[];
}

const AddSectionModal: React.FC<AddSectionModalProps> = ({ onClose, onAdd, existingSections }) => {
    const sections = [
        { id: 'experience', icon: Briefcase, label: 'Experience', desc: 'Job history', isStandard: true },
        { id: 'education', icon: GraduationCap, label: 'Education', desc: 'Schools & degrees', isStandard: true },
        { id: 'skills', icon: PenTool, label: 'Skills', desc: 'Technical proficiency', isStandard: true },
        { id: 'summary', icon: FileText, label: 'Summary', desc: 'Professional profile', isStandard: true },
        { id: 'languages', icon: Globe, label: 'Languages', desc: 'Languages you speak' },
        { id: 'certificates', icon: Award, label: 'Certificates', desc: 'Licenses & certs' },
        { id: 'interests', icon: Heart, label: 'Interests', desc: 'Hobbies & activities' },
        { id: 'projects', icon: Folder, label: 'Projects', desc: 'Side projects' },
        { id: 'courses', icon: BookOpen, label: 'Courses', desc: 'MOOCs & classes' },
        { id: 'awards', icon: Award, label: 'Awards', desc: 'Achievements' },
        { id: 'organisations', icon: Users, label: 'Organisations', desc: 'Volunteering' },
        { id: 'publications', icon: FileText, label: 'Publications', desc: 'Academic papers' },
        { id: 'references', icon: Users, label: 'References', desc: 'Former colleagues' },
        { id: 'declaration', icon: PenTool, label: 'Declaration', desc: 'Formal signature' },
        { id: 'custom', icon: Puzzle, label: 'Custom', desc: 'Create your own' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Add content</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <div className="p-6 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-full mb-2">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose a section type</h3>
                        </div>
                        {sections.map((section) => {
                            const isDisabled = section.isStandard && existingSections.includes(section.id);
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => !isDisabled && onAdd(section.id, section.label)}
                                    disabled={isDisabled}
                                    className={`
                                        flex flex-col items-start p-4 border rounded-xl text-left group transition-all
                                        ${isDisabled 
                                            ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                                            : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <div className={`mb-3 p-2 rounded-lg transition-colors ${isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                        <section.icon size={24} />
                                    </div>
                                    <h4 className={`font-bold mb-1 ${isDisabled ? 'text-gray-400' : 'text-slate-800'}`}>{section.label}</h4>
                                    <p className="text-xs text-gray-500">{isDisabled ? 'Already added' : section.desc}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ReorderModalProps {
  order: string[];
  getLabel: (id: string) => string;
  onClose: () => void;
  onUpdate: (newOrder: string[]) => void;
}

const ReorderModal: React.FC<ReorderModalProps> = ({ order, getLabel, onClose, onUpdate }) => {
  const [items, setItems] = useState(order);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const draggedIdx = items.indexOf(draggedItem);
    if (draggedIdx === index) return;

    const newItems = [...items];
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedItem(null);
  };

  const saveAndClose = () => {
    onUpdate(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-lg text-slate-800">Change Section Order</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto bg-gray-50">
          <p className="text-sm text-gray-500 mb-4">Drag and drop to reorder sections on your resume.</p>
          <div className="space-y-2">
            {items.map((id, index) => (
              <div
                key={id}
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className={`
                  flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing
                  ${draggedItem === id ? 'opacity-50 bg-gray-100 border-dashed' : 'hover:border-blue-300'}
                `}
              >
                <GripVertical size={20} className="text-gray-400" />
                <span className="font-medium text-slate-700">{getLabel(id)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveAndClose}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    icon?: React.ElementType;
    onDelete?: () => void;
    isCustom?: boolean;
    onRename?: (val: string) => void;
}

const Section: React.FC<SectionProps> = ({ title, isOpen, onToggle, children, icon: Icon, onDelete, isCustom, onRename }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
            <div
                className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors ${isOpen ? 'border-b border-gray-100' : ''}`}
            >
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onToggle}>
                    {Icon && <Icon size={20} className="text-slate-500" />}
                    {isCustom && isEditingTitle ? (
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => onRename?.(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                            autoFocus
                            className="font-semibold text-gray-700 bg-white border border-blue-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="font-semibold text-gray-700">{title}</span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {isCustom && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                            >
                                <PenTool size={12} /> Edit Heading
                            </button>
                        </>
                    )}
                    {onDelete && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete Section"
                         >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button onClick={onToggle} className="text-gray-400">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>
            {isOpen && <div className="p-5 bg-gray-50/50">{children}</div>}
        </div>
    );
};

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
