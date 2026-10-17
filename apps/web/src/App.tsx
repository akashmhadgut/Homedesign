import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { DesignBriefForm } from './components/forms/DesignBriefForm'
import { FloorPlanSvg } from './components/viewer/FloorPlanSvg'
import { FloorPlan3D } from './components/viewer/FloorPlan3D'
import { useDesignGeneration } from './hooks/useDesignGeneration'
import { api } from './lib/api'
import type { HouseDesign } from '@aihome/domain';

function App() {
  const { mutate, isPending } = useDesignGeneration();
  const [localDesign, setLocalDesign] = useState<HouseDesign | null>(null);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [selectedConceptIdx, setSelectedConceptIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D'); // Default to 3D for immediate wow factor!
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'AiHome_Client_Concept_Report',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = (intent: any) => {
    setErrorMsg(null);
    mutate(intent, {
      onSuccess: (data) => {
        setLocalDesign(data.houseDesign);
        if (data.concepts && data.concepts.length > 0) {
          setConcepts(data.concepts);
          setSelectedConceptIdx(0);
        } else {
          setConcepts([data]);
          setSelectedConceptIdx(0);
        }
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || err.message || 'Generation failed. Please try a different prompt or adjust plot dimensions.';
        setErrorMsg(msg);
      }
    });
  };

  const handleSelectConcept = (idx: number) => {
    setSelectedConceptIdx(idx);
    if (concepts[idx]?.houseDesign) {
      setLocalDesign(concepts[idx].houseDesign);
    }
  };

  const handleSaveDraft = async () => {
    if (!localDesign) return;
    try {
      const res = await api.post('/projects/save-draft', { designData: localDesign });
      alert(`Design successfully saved to MongoDB!\n\nClient Share Link:\nhttp://localhost:5173/review/${res.data.versionId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save to cloud.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
              AiHome
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5 tracking-wide uppercase">Intelligent Architectural Space Planning</p>
          </div>
          <div className="flex gap-4">
            <button className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all">Sign In</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <DesignBriefForm onSubmit={handleGenerate} isLoading={isPending} externalError={errorMsg} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {/* Dedicated Professional Presentation Toolbar */}
            <div className="bg-white px-5 py-3 rounded-2xl shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {/* Variations Switcher (Left) */}
              <div className="flex items-center gap-2">
                {concepts.length > 1 ? (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider px-2">Design Options:</span>
                    {concepts.slice(0, 3).map((_, idx) => (
                      <button
                        key={`concept-opt-${idx}`}
                        onClick={() => handleSelectConcept(idx)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          selectedConceptIdx === idx
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        }`}
                      >
                        Option {idx + 1}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Architectural Layout Engine Ready
                  </div>
                )}
              </div>

              {/* Action Buttons & 2D/3D View Switcher (Right) */}
              <div className="flex items-center gap-2 flex-wrap">
                {localDesign && (
                  <>
                    <button 
                      onClick={handleSaveDraft}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-blue-600 hover:bg-blue-50 transition-all border border-blue-200 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Share Link
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all border border-emerald-200 flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export PDF
                    </button>
                  </>
                )}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setViewMode('2D')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === '2D' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    2D Blueprint
                  </button>
                  <button 
                    onClick={() => setViewMode('3D')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === '3D' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    3D Visualizer
                  </button>
                </div>
              </div>
            </div>

            {/* Viewer Canvas Container */}
            <div className="bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100/40 border border-slate-100 relative overflow-hidden">
              <div ref={printRef} className="print:p-8 print:bg-white">
                {viewMode === '2D' ? (
                  <div className="print:h-[800px]">
                    <FloorPlanSvg design={localDesign} onDesignUpdate={setLocalDesign} />
                  </div>
                ) : (
                  <FloorPlan3D design={localDesign} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
