
import React, { useState } from 'react';
import { X, Star, Briefcase, Box, PenTool, Layout } from 'lucide-react';

interface TemplateSelectorProps {
  currentTemplate: string;
  onSelect: (template: string) => void;
  onClose: () => void;
}

const categories = [
    { id: 'all', label: 'All Templates', icon: null },
    { id: 'popular', label: 'Popular', icon: Star },
    { id: 'simple', label: 'Simple', icon: Briefcase },
    { id: 'modern', label: 'Modern', icon: Box },
    { id: 'creative', label: 'Creative', icon: PenTool },
];

const templates = [
  {
    id: 'standard',
    name: 'ATLANTIC BLUE',
    category: 'popular',
    tags: ['popular', 'simple', 'professional'],
    preview: (
        <div className="w-full h-full bg-white p-4 flex flex-col gap-3 shadow-sm border border-gray-100 relative text-[5px] overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-slate-900 opacity-90"></div>
             <div className="relative z-10 pl-[36%]">
                 <div className="flex flex-col gap-1 mb-4 pt-4">
                     <div className="w-24 h-2 bg-slate-900 mb-1"></div>
                     <div className="w-12 h-1 bg-blue-600"></div>
                 </div>
                 <div className="flex flex-col gap-2">
                     <div className="w-full h-1 bg-gray-200"></div>
                     <div className="w-full h-1 bg-gray-200"></div>
                     <div className="w-3/4 h-1 bg-gray-200"></div>
                     <div className="mt-2 w-full h-1 bg-gray-200"></div>
                     <div className="w-full h-1 bg-gray-200"></div>
                     <div className="mt-2 w-full h-1 bg-gray-200"></div>
                     <div className="w-full h-1 bg-gray-200"></div>
                 </div>
             </div>
             <div className="absolute left-4 top-8 flex flex-col gap-2 z-10">
                <div className="w-8 h-8 bg-gray-200 rounded-full mb-2 opacity-50"></div>
                <div className="w-12 h-0.5 bg-white opacity-50"></div>
                <div className="w-10 h-0.5 bg-white opacity-50"></div>
                <div className="w-8 h-0.5 bg-white opacity-50"></div>
             </div>
        </div>
    )
  },
  {
    id: 'executive',
    name: 'EXECUTIVE',
    category: 'simple',
    tags: ['simple', 'professional'],
    preview: (
        <div className="w-full h-full bg-white p-6 flex flex-col items-center text-[5px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-24 h-3 bg-slate-900 mb-1"></div>
            <div className="w-16 h-1 bg-gray-400 mb-6"></div>
            <div className="w-full flex flex-col gap-1.5 border-t border-gray-200 pt-4">
                <div className="w-full h-1 bg-gray-300"></div>
                <div className="w-full h-1 bg-gray-200"></div>
                <div className="w-full h-1 bg-gray-200"></div>
                <div className="w-3/4 h-1 bg-gray-200"></div>
            </div>
             <div className="w-full flex flex-col gap-1.5 mt-4">
                <div className="w-8 h-1 bg-gray-400 mb-1"></div>
                <div className="w-full h-1 bg-gray-200"></div>
                <div className="w-full h-1 bg-gray-200"></div>
            </div>
        </div>
    )
  },
  {
    id: 'modern',
    name: 'CORPORATE',
    category: 'modern',
    tags: ['modern', 'creative'],
    preview: (
        <div className="w-full h-full bg-white flex text-[5px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-1/3 bg-slate-100 h-full p-3 flex flex-col gap-3 border-r border-gray-200">
                <div className="w-8 h-8 bg-slate-300 rounded-full mx-auto mb-2"></div>
                <div className="w-full h-1 bg-slate-300 rounded"></div>
                <div className="w-full h-1 bg-slate-300 rounded"></div>
                <div className="w-3/4 h-1 bg-slate-300 rounded"></div>
                <div className="mt-auto w-full h-16 bg-slate-200 rounded"></div>
            </div>
            <div className="w-2/3 p-4 pt-8">
                 <div className="w-24 h-3 bg-slate-900 mb-1"></div>
                 <div className="w-12 h-1 bg-blue-500 mb-6"></div>
                 <div className="w-full h-1 bg-gray-300 mb-2"></div>
                 <div className="w-full h-1 bg-gray-200 mb-2"></div>
                 <div className="w-full h-1 bg-gray-200 mb-2"></div>
                 <div className="w-3/4 h-1 bg-gray-200"></div>
            </div>
        </div>
    )
  },
  {
    id: 'minimal',
    name: 'FINANCE',
    category: 'creative',
    tags: ['creative', 'simple'],
    preview: (
         <div className="w-full h-full bg-white p-6 text-[5px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-20 h-6 bg-black mb-6"></div>
            <div className="flex gap-6">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full h-1 bg-gray-800 mb-1"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="mt-4 w-full h-1 bg-gray-800 mb-1"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                </div>
                <div className="w-1/3 flex flex-col gap-2 pt-1">
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                    <div className="w-full h-1 bg-gray-200"></div>
                </div>
            </div>
        </div>
    )
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ currentTemplate, onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.tags.includes(activeCategory) || t.category === activeCategory);

  return (
    <div className="fixed inset-0 bg-slate-800/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] h-auto flex flex-col overflow-hidden relative border border-white/20">
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
        >
            <X size={20} />
        </button>

        {/* Header */}
        <div className="px-6 md:px-10 pt-10 pb-6 bg-slate-100 shrink-0">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">
                Apply a design template
            </h2>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3">
                {categories.map(cat => {
                    const isActive = activeCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                                ${isActive 
                                    ? 'bg-white border-transparent text-slate-900 shadow-md ring-1 ring-black/5' 
                                    : 'bg-transparent border-slate-300 text-slate-600 hover:bg-white hover:border-transparent hover:shadow-sm'
                                }
                            `}
                        >
                            {Icon && <Icon size={16} className={isActive ? "text-slate-900" : "text-slate-500"} />}
                            {cat.label}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* Grid */}
        <div className="px-6 md:px-10 pb-10 overflow-y-auto custom-scrollbar h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTemplates.map((template) => {
              const isSelected = currentTemplate === template.id;
              return (
                <div key={template.id} className="flex flex-col gap-3 group">
                    <button
                    onClick={() => onSelect(template.id)}
                    className={`
                        relative w-full aspect-[210/297] bg-white rounded-sm overflow-hidden text-left transition-all duration-200 cursor-pointer
                        ${isSelected 
                            ? 'ring-4 ring-indigo-600 ring-offset-4 ring-offset-slate-100 shadow-xl scale-[1.02]' 
                            : 'shadow-md hover:shadow-xl hover:-translate-y-1 ring-1 ring-black/5'
                        }
                    `}
                    >
                        {template.preview}
                        
                        {/* Hover Overlay */}
                        <div className={`absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors ${isSelected ? 'bg-indigo-900/0' : ''}`} />
                    </button>
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-center">
                        {template.name}
                    </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
