
import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { CVData, Experience, Education, CustomSection, CustomItem } from '../types';
import { MapPin, Mail, Phone, Globe, Linkedin } from 'lucide-react';

interface PreviewProps {
  data: CVData;
}

// A4 Constants @ 96 DPI
const PAGE_HEIGHT_PX = 1123; // 297mm
const PADDING_PX = 48; // p-12 = 3rem = 48px top/bottom
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - (PADDING_PX * 2); // Usable height

const Preview: React.FC<PreviewProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  // 1. Break down the CV into atomic "Blocks" that can be moved between pages.
  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];

    // Generator Functions
    const generators: Record<string, () => void> = {
      personal: () => {
        items.push(<Header key="header" data={data} />);
      },
      summary: () => {
        if (data.summary) {
          items.push(<Summary key="summary" summary={data.summary} />);
        }
      },
      skills: () => {
        if (data.skills.length > 0) {
          items.push(<Skills key="skills" skills={data.skills} />);
        }
      },
      experience: () => {
        if (data.experience.length > 0) {
          items.push(<SectionTitle key="exp-title" title="Work Experience" />);
          
          data.experience.forEach((exp, index) => {
            const isLast = index === data.experience.length - 1;
            items.push(<ExperienceHeader key={`exp-header-${exp.id}`} exp={exp} />);
            if (exp.description) {
              const lines = exp.description.split('\n');
              lines.forEach((line, lineIdx) => {
                if (line.trim()) {
                  items.push(<ExperienceDescriptionLine key={`exp-desc-${exp.id}-${lineIdx}`} text={line} />);
                }
              });
            }
            if (!isLast) items.push(<div key={`exp-spacer-${exp.id}`} className="h-5" />);
          });
        }
      },
      education: () => {
        if (data.education.length > 0) {
          items.push(<SectionTitle key="edu-title" title="Education" />);
          data.education.forEach((edu, index) => {
            const isLast = index === data.education.length - 1;
            items.push(<EducationHeader key={`edu-header-${edu.id}`} edu={edu} />);
            if (edu.details) {
               const lines = edu.details.split('\n');
               lines.forEach((line, lineIdx) => {
                if (line.trim()) {
                   items.push(<EducationDetailsLine key={`edu-desc-${edu.id}-${lineIdx}`} text={line} />);
                }
              });
            }
            if (!isLast) items.push(<div key={`edu-spacer-${edu.id}`} className="h-4" />);
          });
        }
      }
    };

    const generateCustomSection = (section: CustomSection) => {
        if (section.items.length > 0) {
            items.push(<SectionTitle key={`custom-title-${section.id}`} title={section.title} />);
            
            section.items.forEach((item, index) => {
                const isLast = index === section.items.length - 1;
                
                items.push(
                    <CustomItemBlock 
                        key={`custom-item-${section.id}-${item.id}`} 
                        item={item} 
                        type={section.name}
                    />
                );

                if (!isLast) items.push(<div key={`custom-spacer-${section.id}-${item.id}`} className="h-3" />);
            });
        }
    };

    // Execute generators in the user-defined order
    const order = data.sectionOrder || ['personal', 'summary', 'experience', 'education', 'skills'];
    
    order.forEach(id => {
      if (generators[id]) {
        generators[id]();
      } else {
        // Check if it is a custom section
        const customSection = data.customSections.find(s => s.id === id);
        if (customSection) {
            generateCustomSection(customSection);
        }
      }
    });

    return items;
  }, [data]);

  // 2. Measure and Distribute Blocks into Pages
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const newPages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentHeight = 0;

    const pushPage = () => {
      if (currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    };

    const elements = Array.from(containerRef.current.children) as HTMLElement[];

    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const elementHeight = el.offsetHeight + marginTop + marginBottom;

      if (currentHeight + elementHeight > CONTENT_HEIGHT_PX) {
        pushPage();
      }

      currentPage.push(blocks[index]);
      currentHeight += elementHeight;
    });

    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  }, [blocks]); 

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      
      {/* Hidden Measurement Container */}
      <div 
        ref={containerRef} 
        className="fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]"
        style={{ visibility: 'hidden' }} 
      >
        {blocks}
      </div>

      {/* Render Pages */}
      {pages.length === 0 ? (
        <div className="a4-page shadow-2xl p-12 bg-white"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page shadow-2xl p-12 bg-white text-slate-900 relative print:shadow-none">
             {pageContent}
             {pages.length > 1 && (
               <div className="absolute bottom-4 right-12 text-[10px] text-slate-400 print:hidden">
                 Page {i + 1} of {pages.length}
               </div>
             )}
          </div>
        ))
      )}
    </div>
  );
};

// --- Subcomponents for Blocks ---

const Header: React.FC<{ data: CVData }> = ({ data }) => (
  <header className="border-b-2 border-slate-800 pb-6 mb-6">
    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2 uppercase">{data.personal.fullName}</h1>
    <p className="text-xl text-slate-600 font-medium mb-4">{data.personal.jobTitle}</p>
    
    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        {data.personal.email && (
          <div className="flex items-center gap-1.5">
            <Mail size={14} />
            <span>{data.personal.email}</span>
          </div>
        )}
        {data.personal.phone && (
          <div className="flex items-center gap-1.5">
            <Phone size={14} />
            <span>{data.personal.phone}</span>
          </div>
        )}
        {data.personal.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={14} />
            <span>{data.personal.location}</span>
          </div>
        )}
        {data.personal.linkedin && (
          <div className="flex items-center gap-1.5">
            <Linkedin size={14} />
            <span>{data.personal.linkedin.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
         {data.personal.website && (
          <div className="flex items-center gap-1.5">
            <Globe size={14} />
            <span>{data.personal.website.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
    </div>
  </header>
);

const Summary: React.FC<{ summary: string }> = ({ summary }) => (
  <section className="mb-6">
    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
    <p className="text-slate-700 leading-relaxed text-sm text-justify">{summary}</p>
  </section>
);

const Skills: React.FC<{ skills: string[] }> = ({ skills }) => (
  <section className="mb-6">
    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Core Competencies</h2>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-semibold">
          {skill}
        </span>
      ))}
    </div>
  </section>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-4 border-b border-slate-200 pb-1 pt-2">
    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
  </div>
);

// Granular Experience Components
const ExperienceHeader: React.FC<{ exp: Experience }> = ({ exp }) => (
  <div className="mb-2">
    <div className="flex justify-between items-baseline mb-1">
      <h3 className="font-bold text-slate-800 text-base">{exp.role}</h3>
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{exp.dates}</span>
    </div>
    <div className="flex justify-between items-center">
       <span className="text-sm text-slate-600 font-semibold">{exp.company}</span>
       <span className="text-xs text-slate-400 italic">{exp.location}</span>
    </div>
  </div>
);

const ExperienceDescriptionLine: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-sm text-slate-700 leading-relaxed pl-1">
    {text}
  </div>
);

// Granular Education Components
const EducationHeader: React.FC<{ edu: Education }> = ({ edu }) => (
  <div className="mb-1"> 
     <div className="flex justify-between items-baseline mb-1">
      <h3 className="font-bold text-slate-800 text-base">{edu.school}</h3>
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{edu.dates}</span>
    </div>
    <div>
        <span className="text-sm text-slate-600 font-medium">{edu.degree}</span>
    </div>
  </div>
);

const EducationDetailsLine: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-xs text-slate-500 leading-normal mt-0.5">
     {text}
  </div>
);

// Custom Item Block
const CustomItemBlock: React.FC<{ item: CustomItem; type: string }> = ({ item, type }) => {
    // Layout variation for simple lists (like Languages/Interests)
    const isSimpleList = ['languages', 'interests', 'skills'].includes(type);

    if (isSimpleList) {
        return (
             <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                <span className="text-sm text-slate-600 italic">{item.subtitle}</span>
            </div>
        )
    }

    // Default Layout (similar to experience)
    return (
        <div className="mb-2">
            <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{item.date}</span>
            </div>
            {item.subtitle && (
                <div className="text-sm text-slate-600 font-medium mb-1">{item.subtitle}</div>
            )}
            {item.description && (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.description}
                </div>
            )}
        </div>
    )
}

export default Preview;
