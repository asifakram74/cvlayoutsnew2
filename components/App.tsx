
import React, { useState, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import TemplateSelector from './components/TemplateSelector';
import { CVData, INITIAL_CV_DATA } from './types';
import { Printer, FileText, Sparkles, X, Download, Loader2, Palette } from 'lucide-react';
import { generateReview } from './services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [cvData, setCvData] = useState<CVData>(INITIAL_CV_DATA);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [aiReview, setAiReview] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const pages = document.querySelectorAll('.a4-page');
      if (pages.length === 0) {
        alert('Please switch to the Preview tab to generate the PDF.');
        setIsGeneratingPdf(false);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const clone = page.cloneNode(true) as HTMLElement;
        
        // Styles for capture
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '-10000px';
        clone.style.width = '210mm'; // 794px
        clone.style.minHeight = '297mm'; // 1123px
        clone.style.zIndex = '9999';
        clone.style.margin = '0';
        clone.style.transform = 'none';
        clone.style.overflow = 'visible';
        clone.style.background = 'white';
        
        clone.classList.remove('shadow-2xl', 'my-8');
        
        document.body.appendChild(clone);

        try {
            await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay for heavy elements

            const canvas = await html2canvas(clone, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              windowWidth: clone.scrollWidth,
              windowHeight: clone.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            if (i > 0) {
              pdf.addPage();
            }
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        } finally {
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
        }
      }
      
      pdf.save(`${cvData.personal.fullName.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleAIReview = async () => {
    setReviewOpen(true);
    if (!aiReview) {
      setReviewLoading(true);
      const review = await generateReview(cvData);
      setAiReview(review);
      setReviewLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-100 relative print:h-auto print:overflow-visible print:block">
      
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b p-4 flex justify-between items-center no-print z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <h1 className="font-serif font-bold text-xl text-slate-800">ResuMate</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="p-2 text-slate-600">
            {isGeneratingPdf ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          </button>
           <button onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'editor' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Edit</button>
          <button onClick={() => setActiveTab('preview')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}>Preview</button>
        </div>
      </div>

      {/* Left Sidebar (Editor) */}
      <div className={`
        w-full lg:w-5/12 xl:w-4/12 bg-gray-50 border-r border-gray-200 flex flex-col h-full
        ${activeTab === 'editor' ? 'block' : 'hidden lg:flex'}
        no-print
      `}>
        <div className="p-6 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" />
              CV Editor
            </h2>
          </div>
          <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    console.log("Design button clicked");
                    setTemplateOpen(true);
                }}
                className="flex-1 sm:flex-none justify-center text-sm border border-gray-300 text-slate-700 font-medium hover:bg-gray-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
              >
                <Palette size={16} />
                <span className="hidden xl:inline">Design</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex-1 sm:flex-none justify-center text-sm bg-slate-900 text-white font-medium hover:bg-slate-800 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden xl:inline">{isGeneratingPdf ? 'Generating...' : 'Save PDF'}</span>
              </button>
              <button 
                onClick={handleAIReview}
                className="flex-1 sm:flex-none justify-center text-sm text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span className="hidden xl:inline">Review</span>
              </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Editor 
            data={cvData} 
            onChange={setCvData} 
            onOpenTemplateSelector={() => {
                console.log("Opening template selector from editor");
                setTemplateOpen(true);
            }}
          />
        </div>
      </div>

      {/* Right Main Area (Preview) */}
      <div className={`
        w-full lg:w-7/12 xl:w-8/12 bg-slate-200/50 relative overflow-y-auto h-full flex flex-col items-center
        ${activeTab === 'preview' ? 'block' : 'hidden lg:flex'}
        print:w-full print:h-auto print:overflow-visible print:block print:static print:bg-white
      `}>
        <div id="cv-preview-content" className="py-8 lg:py-12 w-full px-4 md:px-8 lg:px-12 print:p-0 print:w-full print:static">
          <Preview data={cvData} />
        </div>
      </div>

      {/* Modals */}
      {reviewOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 no-print">
           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="p-5 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
                 <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                   <Sparkles size={20} />
                   AI Resume Critique
                 </h3>
                 <button onClick={() => setReviewOpen(false)} className="text-indigo-400 hover:text-indigo-700"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto text-slate-700 leading-relaxed">
                 {reviewLoading ? (
                   <div className="flex flex-col items-center justify-center py-8">
                     <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                     <p className="text-sm text-slate-500">Analyzing your CV structure...</p>
                   </div>
                 ) : (
                   <div className="prose prose-sm prose-indigo"><p className="whitespace-pre-line">{aiReview}</p></div>
                 )}
              </div>
              <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end">
                <button onClick={() => setReviewOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700">Close</button>
              </div>
           </div>
        </div>
      )}

      {templateOpen && (
        <TemplateSelector 
            currentTemplate={cvData.template || 'standard'}
            onSelect={(t) => {
                setCvData({ ...cvData, template: t });
            }}
            onClose={() => setTemplateOpen(false)}
        />
      )}

    </div>
  );
};

export default App;
