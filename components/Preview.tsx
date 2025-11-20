
import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { CVData, Experience, Education, CustomSection, CustomItem } from '../types';
import { MapPin, Mail, Phone, Globe, Linkedin } from 'lucide-react';

interface PreviewProps {
  data: CVData;
}

// A4 Constants @ 96 DPI
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123; 
const PADDING_PX = 48;

// Theme Configuration
const getTheme = (template: string) => {
    switch (template) {
        case 'modern':
            return {
                id: 'modern',
                type: 'sidebar',
                sidebarWidth: 240,
                font: 'font-sans',
                headings: 'text-slate-800 font-bold uppercase tracking-wider mb-4',
                sidebarBg: 'bg-slate-900',
                sidebarText: 'text-slate-300',
                mainBg: 'bg-white',
                accent: 'text-blue-600',
            };
        case 'executive':
            return {
                id: 'executive',
                type: 'standard',
                font: 'font-serif',
                headings: 'text-slate-900 font-bold uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-6 text-center text-sm',
                headerAlign: 'text-center',
                nameSize: 'text-4xl',
                isSerif: true,
                headerBg: 'bg-white',
            };
        case 'minimal':
            return {
                id: 'minimal',
                type: 'standard',
                font: 'font-sans',
                headings: 'text-black font-medium uppercase tracking-widest text-xs mb-6',
                headerAlign: 'text-left',
                nameSize: 'text-5xl font-light tracking-tighter',
                headerBg: 'bg-white',
            };
        case 'standard':
        default:
            return {
                id: 'standard',
                type: 'standard',
                font: 'font-sans',
                headings: 'text-blue-800 font-bold uppercase tracking-wider border-b border-blue-100 pb-2 mb-4 text-sm',
                headerAlign: 'text-left',
                nameSize: 'text-4xl font-bold',
                headerBg: 'bg-slate-50/80 border-b border-slate-200', // Added background for 'colorful' look
            };
    }
};

const Preview: React.FC<PreviewProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  
  const dataString = JSON.stringify(data);
  const templateId = data.template || 'standard';

  // Memoize the theme and block generation
  const { theme, mainBlocks, sidebarBlocks } = useMemo(() => {
    const parsedData: CVData = JSON.parse(dataString);
    const currentTheme = getTheme(templateId);
    
    const main: React.ReactNode[] = [];
    const sidebar: React.ReactNode[] = [];
    
    const isSidebarLayout = currentTheme.type === 'sidebar';

    // Helper to push blocks to the correct list
    const addBlock = (block: React.ReactNode, sectionId: string) => {
        if (isSidebarLayout && ['skills', 'languages', 'interests', 'contact', 'personal'].includes(sectionId)) {
            sidebar.push(block);
        } else {
            main.push(block);
        }
    };

    // Helper for main content specifically to allow flattening
    const addMain = (block: React.ReactNode) => main.push(block);
    const addSidebar = (block: React.ReactNode) => sidebar.push(block);

    // Header Logic
    if (isSidebarLayout) {
        addMain(<ModernHeaderMain key="header-main" data={parsedData} theme={currentTheme} />);
        addSidebar(<ModernHeaderSidebar key="header-sidebar" data={parsedData} theme={currentTheme} />);
    } else {
        addMain(<Header key="header" data={parsedData} theme={currentTheme} />);
    }

    // Section Generators
    const generators: Record<string, (isFirstSection: boolean) => void> = {
      summary: (isFirst) => {
        if (parsedData.summary) {
            if (isSidebarLayout) {
                addMain(
                    <div key="summary-block" className={`${isFirst ? '' : 'mt-6'}`}>
                         <SectionTitle title="Professional Summary" theme={currentTheme} noMargin />
                         <Summary summary={parsedData.summary} theme={currentTheme} />
                    </div>
                );
            } else {
                 // Split for standard layouts to allow better flow
                 addMain(<SectionTitle key="summary-title" title="Professional Summary" theme={currentTheme} isFirst={isFirst} />);
                 addMain(<Summary key="summary-content" summary={parsedData.summary} theme={currentTheme} />);
            }
        }
      },
      skills: (isFirst) => {
        if (parsedData.skills.length > 0) {
            if (isSidebarLayout) {
                // Sidebar skills are handled as a single block usually
                addSidebar(<Skills key="skills" skills={parsedData.skills} theme={currentTheme} />);
            } else {
                addMain(<SectionTitle key="skills-title" title="Skills" theme={currentTheme} isFirst={isFirst} />);
                addMain(<Skills key="skills-content" skills={parsedData.skills} theme={currentTheme} />);
            }
        }
      },
      experience: (isFirst) => {
        if (parsedData.experience.length > 0) {
            addMain(<SectionTitle key="exp-title" title="Experience" theme={currentTheme} isFirst={isFirst} />);
            parsedData.experience.forEach((exp) => {
                addMain(
                    <div key={`exp-${exp.id}`} className="mb-4 break-inside-avoid">
                        <ExperienceBlock exp={exp} theme={currentTheme} />
                    </div>
                );
            });
        }
      },
      education: (isFirst) => {
        if (parsedData.education.length > 0) {
            addMain(<SectionTitle key="edu-title" title="Education" theme={currentTheme} isFirst={isFirst} />);
            parsedData.education.forEach((edu) => {
                addMain(
                    <div key={`edu-${edu.id}`} className="mb-4 break-inside-avoid">
                        <EducationBlock edu={edu} theme={currentTheme} />
                    </div>
                );
            });
        }
      },
    };

    const generateCustomSection = (section: CustomSection, isFirst: boolean) => {
        if (section.items.length > 0) {
            const sectionType = ['languages', 'interests'].includes(section.name) ? section.name : 'custom';
            
            if (isSidebarLayout && ['languages', 'interests'].includes(section.name)) {
                addSidebar(
                    <div key={`custom-sidebar-${section.id}`} className="mt-8">
                        <div className="uppercase tracking-widest text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2">{section.title}</div>
                        {section.items.map(item => (
                             <CustomItemBlock key={item.id} item={item} type={section.name} theme={currentTheme} />
                        ))}
                    </div>
                );
            } else {
                addMain(<SectionTitle key={`custom-title-${section.id}`} title={section.title} theme={currentTheme} isFirst={isFirst} />);
                section.items.forEach((item) => {
                    addMain(
                        <div key={`custom-item-${item.id}`} className="mb-3 break-inside-avoid">
                            <CustomItemBlock item={item} type={section.name} theme={currentTheme} />
                        </div>
                    );
                });
            }
        }
    };

    const order = parsedData.sectionOrder || ['personal', 'summary', 'experience', 'education', 'skills'];
    let firstSectionRendered = false;

    order.forEach(id => {
      if (id === 'personal') return;
      
      // Determine if this is effectively the first section in the main column
      const isSidebarItem = isSidebarLayout && ['skills', 'languages', 'interests', 'contact'].includes(id);
      
      if (generators[id]) {
        generators[id](!firstSectionRendered && !isSidebarItem);
        if (!isSidebarItem) firstSectionRendered = true;
      } else {
        const customSection = parsedData.customSections.find(s => s.id === id);
        if (customSection) {
            const isCustomSidebar = isSidebarLayout && ['languages', 'interests'].includes(customSection.name);
            generateCustomSection(customSection, !firstSectionRendered && !isCustomSidebar);
            if (!isCustomSidebar) firstSectionRendered = true;
        }
      }
    });

    return { theme: currentTheme, mainBlocks: main, sidebarBlocks: sidebar };
  }, [dataString, templateId]); 


  // Pagination Logic
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const newPages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentHeight = 0;

    const effectiveHeight = PAGE_HEIGHT_PX - (PADDING_PX * 2);
    
    const pushPage = () => {
      if (currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    };

    const elements = Array.from(containerRef.current.children) as HTMLElement[];

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const style = window.getComputedStyle(el);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const elementHeight = el.offsetHeight + marginTop + marginBottom;

        // Check for Section Title Orphan Protection
        const isTitle = el.hasAttribute('data-section-title');
        let forceBreak = false;

        if (isTitle && i < elements.length - 1) {
            const nextEl = elements[i+1];
            const nextStyle = window.getComputedStyle(nextEl);
            const nextHeight = nextEl.offsetHeight + parseFloat(nextStyle.marginTop) + parseFloat(nextStyle.marginBottom);
            
            // If title + next item > remaining space, push both to new page
            if (currentHeight + elementHeight + nextHeight > effectiveHeight) {
                forceBreak = true;
            }
        }

        if (forceBreak || (currentHeight + elementHeight > effectiveHeight && currentHeight > 0)) {
            pushPage();
        }

        currentPage.push(mainBlocks[i]);
        currentHeight += elementHeight;
    }

    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  }, [mainBlocks, theme]); // Stable dependencies


  // Calculate layout dimensions
  const isSidebar = theme.type === 'sidebar';
  const sidebarWidth = isSidebar ? (theme.sidebarWidth || 240) : 0;
  const mainWidth = PAGE_WIDTH_PX - sidebarWidth;

  return (
    <div className={`flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0 ${theme.font}`}>
      
      {/* Hidden Measurement Container - Exactly matches main content width */}
      <div 
        ref={containerRef} 
        className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-999]"
        style={{ 
            width: `${mainWidth - (PADDING_PX * 2)}px`, // Subtract padding
            visibility: 'hidden' 
        }} 
      >
        {mainBlocks}
      </div>

      {/* Render Pages */}
      {pages.length === 0 ? (
        <div className="a4-page shadow-2xl bg-white"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page shadow-2xl bg-white relative print:shadow-none overflow-hidden flex text-slate-800">
             
             {/* Sidebar */}
             {isSidebar && (
                 <div 
                    className={`shrink-0 flex flex-col ${theme.sidebarBg} ${theme.sidebarText} relative print:h-full`}
                    style={{ width: `${sidebarWidth}px`, minHeight: '100%' }}
                 >
                    <div className="p-8 flex-1 flex flex-col gap-8">
                        {i === 0 ? sidebarBlocks : (
                             // Decorative continuation for subsequent pages
                             <div className="opacity-20 text-xs uppercase tracking-widest text-center mt-4">Continued</div>
                        )}
                    </div>
                 </div>
             )}

             {/* Main Content Area */}
             <div className="flex-1 flex flex-col h-full relative">
                 {/* Header for non-sidebar layouts (render at top of page 1) */}
                 {/* Note: In logic above, Header is added to mainBlocks[0]. So it's inside pageContent. */}
                 {/* However, Standard/Executive theme might have full-width header background. */}
                 
                 <div className="flex-1 [&>*:first-child]:mt-0" style={{ padding: '48px' }}>
                     {pageContent}
                 </div>
             </div>

          </div>
        ))
      )}
    </div>
  );
};

// --- Subcomponents ---

const Header: React.FC<{ data: CVData, theme: any }> = ({ data, theme }) => {
    // Custom styling wrapper for different themes
    if (theme.id === 'standard') {
        return (
            <div className="-mx-12 -mt-12 mb-8 p-12 bg-slate-50 border-b border-slate-200">
                 <h1 className="text-4xl font-bold text-slate-900 mb-2 uppercase tracking-tight leading-none">
                    {data.personal.fullName}
                </h1>
                <p className="text-lg mb-4 text-blue-600 font-bold uppercase text-sm tracking-widest">
                    {data.personal.jobTitle}
                </p>
                <ContactRow data={data} theme={theme} />
            </div>
        )
    }

    if (theme.id === 'executive') {
        return (
            <header className={`mb-8 ${theme.headerAlign} border-b-0 pt-4`}>
                <div className="w-16 h-1 bg-slate-900 mx-auto mb-6"></div>
                <h1 className={`${theme.nameSize} text-slate-900 mb-4 uppercase tracking-widest leading-none ${theme.isSerif ? 'font-serif' : ''}`}>
                    {data.personal.fullName}
                </h1>
                <p className="text-sm mb-6 text-slate-600 font-medium uppercase tracking-[0.2em]">
                    {data.personal.jobTitle}
                </p>
                <ContactRow data={data} theme={theme} centered />
            </header>
        )
    }

    // Minimal
    return (
        <header className={`mb-8 ${theme.headerAlign} border-b-0`}>
            <h1 className={`${theme.nameSize} text-slate-900 mb-2 uppercase tracking-tight leading-none`}>
                {data.personal.fullName}
            </h1>
            <p className="text-lg mb-4 text-slate-500 font-medium">
                {data.personal.jobTitle}
            </p>
            <ContactRow data={data} theme={theme} />
        </header>
    );
};

const ContactRow: React.FC<{ data: CVData, theme: any, centered?: boolean }> = ({ data, theme, centered }) => (
    <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 ${centered ? 'justify-center' : ''}`}>
        {[
            { icon: Mail, val: data.personal.email },
            { icon: Phone, val: data.personal.phone },
            { icon: MapPin, val: data.personal.location },
            { icon: Linkedin, val: data.personal.linkedin?.replace(/^https?:\/\//, '') },
            { icon: Globe, val: data.personal.website?.replace(/^https?:\/\//, '') }
        ].map((item, idx) => item.val && (
            <div key={idx} className="flex items-center gap-1.5">
                <item.icon size={14} className={theme.id === 'standard' ? 'text-blue-600' : 'text-slate-400'} />
                <span>{item.val}</span>
            </div>
        ))}
    </div>
)

const ModernHeaderMain: React.FC<{ data: CVData, theme: any }> = ({ data, theme }) => (
    <div className="mb-10 pb-6 border-b border-slate-100">
         <h1 className="text-5xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">{data.personal.fullName}</h1>
         <p className="text-xl text-blue-600 font-bold uppercase tracking-wider">{data.personal.jobTitle}</p>
    </div>
);

const ModernHeaderSidebar: React.FC<{ data: CVData, theme: any }> = ({ data, theme }) => (
    <div className="space-y-6">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 mb-8 mx-auto border-4 border-slate-700">
            {data.personal.fullName.charAt(0)}
        </div>

        <div className="space-y-4">
            <div className="uppercase tracking-widest text-xs font-bold text-slate-500 border-b border-slate-800 pb-2">Contact</div>
             {[
                { icon: Mail, val: data.personal.email },
                { icon: Phone, val: data.personal.phone },
                { icon: MapPin, val: data.personal.location },
                { icon: Linkedin, val: data.personal.linkedin?.replace(/^https?:\/\//, '') },
                { icon: Globe, val: data.personal.website?.replace(/^https?:\/\//, '') }
            ].map((item, idx) => item.val && (
                <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 break-words">
                    <item.icon size={16} className="shrink-0 mt-0.5 text-blue-400" />
                    <span className="flex-1">{item.val}</span>
                </div>
            ))}
        </div>
    </div>
);

const Summary: React.FC<{ summary: string, theme: any }> = ({ summary, theme }) => (
  <div className="break-inside-avoid">
     <p className="text-slate-700 leading-relaxed text-sm text-justify">{summary}</p>
  </div>
);

const Skills: React.FC<{ skills: string[], theme: any }> = ({ skills, theme }) => {
    if (theme.type === 'sidebar') {
        return (
            <section className="mt-8">
                 <div className="uppercase tracking-widest text-xs font-bold text-slate-500 mb-4 border-b border-slate-800 pb-2">Skills</div>
                 <div className="flex flex-col gap-2">
                    {skills.map((skill, index) => (
                        <span key={index} className="text-sm text-slate-300">
                        • {skill}
                        </span>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <div className="flex flex-wrap gap-x-1 gap-y-2 break-inside-avoid">
        {skills.map((skill, index) => (
            <span key={index} className={`${theme.id === 'minimal' ? 'bg-white border border-slate-200' : 'bg-slate-100'} text-slate-700 px-3 py-1 rounded text-xs font-semibold`}>
            {skill}
            </span>
        ))}
        </div>
    );
};

const SectionTitle: React.FC<{ title: string, theme: any, isFirst?: boolean, noMargin?: boolean }> = ({ title, theme, isFirst, noMargin }) => (
  <div className={`${(isFirst || noMargin) ? '' : 'mt-6'} mb-4 break-inside-avoid`} data-section-title>
    <h2 className={theme.headings}>{title}</h2>
  </div>
);

const ExperienceBlock: React.FC<{ exp: Experience, theme: any }> = ({ exp, theme }) => (
  <div className="break-inside-avoid">
    <div className="flex justify-between items-baseline mb-1">
      <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">{exp.dates}</span>
    </div>
    <div className="flex justify-between items-center mb-2">
       <span className={`text-sm font-semibold ${theme.id === 'standard' ? 'text-blue-600' : 'text-slate-600'}`}>{exp.company}</span>
       <span className="text-xs text-slate-400">{exp.location}</span>
    </div>
    {exp.description && (
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-1">
            {exp.description}
        </div>
    )}
  </div>
);

const EducationBlock: React.FC<{ edu: Education, theme: any }> = ({ edu, theme }) => (
  <div className="break-inside-avoid"> 
     <div className="flex justify-between items-baseline mb-1">
      <h3 className="font-bold text-slate-900 text-base">{edu.school}</h3>
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">{edu.dates}</span>
    </div>
    <div className="mb-1">
        <span className={`text-sm font-medium ${theme.id === 'standard' ? 'text-blue-600' : 'text-slate-600'}`}>{edu.degree}</span>
    </div>
     {edu.details && <div className="text-xs text-slate-500 leading-normal mt-1">{edu.details}</div>}
  </div>
);

const CustomItemBlock: React.FC<{ item: CustomItem; type: string, theme: any }> = ({ item, type, theme }) => {
    const isSimpleList = ['languages', 'interests'].includes(type);
    const isSidebar = theme.type === 'sidebar';

    if (isSidebar && isSimpleList) {
        return (
            <div className="mb-3">
                 <div className="text-sm font-bold text-slate-200">{item.title}</div>
                 <div className="text-xs text-slate-400">{item.subtitle}</div>
            </div>
        )
    }

    if (isSimpleList) {
        return (
             <div className="flex justify-between items-center mb-1 border-b border-gray-50 pb-1 last:border-0 break-inside-avoid">
                <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                <span className="text-sm text-slate-600 italic">{item.subtitle}</span>
            </div>
        )
    }

    return (
        <div className="break-inside-avoid">
            <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{item.date}</span>
            </div>
            {item.subtitle && (
                <div className={`text-sm font-medium mb-1 ${theme.id === 'standard' ? 'text-blue-600' : 'text-slate-600'}`}>{item.subtitle}</div>
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
