import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Zap, Activity, ChevronRight, User, CheckCircle2, Sparkles, Printer, Phone, ChevronLeft, ShieldCheck, RefreshCcw, Download } from 'lucide-react';
import { BACH_DATA, SYMPTOMS_DATA, NOSOLOGY_DATA, DiagnosisData } from './data';

const ELEMENT_CONFIG = {
  fire: { color: "text-red-600", bg: "bg-red-50", border: "border-red-500", label: "Огонь", icon: "🔥", force: "ЯН" },
  water: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500", label: "Вода", icon: "💧", force: "ИНЬ" },
  earth: { color: "text-amber-900", bg: "bg-amber-50", border: "border-amber-800", label: "Земля", icon: "⛰️", force: "ИНЬ" },
  wood: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-500", label: "Дерево", icon: "🌿", force: "ЯН" },
  metal: { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-500", label: "Металл", icon: "⚒️", force: "ЯН" }
};

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [selectedNosology, setSelectedNosology] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  const mainContentRef = useState<HTMLDivElement | null>(null)[1];

  // Reset function that truly clears state
  const resetAll = () => {
    console.log("Resetting application state...");
    setSelectedSymptoms(new Set());
    setSelectedNosology(new Set());
    setStep(1);
    setSearchTerm('');
    setShowOnlyMatches(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepChange = (newStep: 1 | 2 | 3) => {
    setStep(newStep);
    setSearchTerm('');
    // Auto-scroll to top of content on step change for better mobile UX
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const currentData = step === 1 ? NOSOLOGY_DATA : SYMPTOMS_DATA;
  const currentSelected = step === 1 ? selectedNosology : selectedSymptoms;

  // Diagnostics calculations
  const nosologyResults = useMemo(() => {
    const remedies: Record<string, string[]> = {};
    selectedNosology.forEach(s => {
      NOSOLOGY_DATA[s]?.r.forEach(rem => {
        if (!remedies[rem]) remedies[rem] = [];
        remedies[rem].push(s);
      });
    });
    return remedies;
  }, [selectedNosology]);

  const etiologyResults = useMemo(() => {
    const remedies: Record<string, string[]> = {};
    selectedSymptoms.forEach(s => {
      SYMPTOMS_DATA[s]?.r.forEach(rem => {
        if (!remedies[rem]) remedies[rem] = [];
        remedies[rem].push(s);
      });
    });
    return remedies;
  }, [selectedSymptoms]);

  // Combined identified remedies for step 2/3
  const allIdentifiedRemediesArr = useMemo(() => {
    const set = new Set([...Object.keys(etiologyResults), ...Object.keys(nosologyResults)]);
    return Array.from(set).sort();
  }, [etiologyResults, nosologyResults]);

  // Synergy: Remedies present in BOTH Steps
  const synergyRemedies = useMemo(() => {
    return Object.keys(nosologyResults).filter(rem => etiologyResults[rem]);
  }, [nosologyResults, etiologyResults]);

  const targetOrgansArr = useMemo(() => {
    const organs = new Map<string, DiagnosisData>();
    selectedSymptoms.forEach(s => {
      const d = SYMPTOMS_DATA[s];
      if (d) organs.set(d.o, d);
    });
    selectedNosology.forEach(s => {
      const d = NOSOLOGY_DATA[s];
      if (d) organs.set(d.o, d);
    });
    return Array.from(organs.values()).sort((a, b) => a.l - b.l);
  }, [selectedSymptoms, selectedNosology]);

  // UI Filtering
  const filteredItems = useMemo(() => {
    const items = Object.keys(currentData).sort();
    let matchesSearch = items.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (step === 2) {
      if (showOnlyMatches) {
        matchesSearch = matchesSearch.filter(a => SYMPTOMS_DATA[a].r.some(r => nosologyResults[r]));
      }

      // Prioritize items that match remedies already found in step 1 (Nosology)
      return matchesSearch.sort((a,b) => {
        const aRelevance = SYMPTOMS_DATA[a].r.some(r => nosologyResults[r]) ? 1 : 0;
        const bRelevance = SYMPTOMS_DATA[b].r.some(r => nosologyResults[r]) ? 1 : 0;
        return bRelevance - aRelevance;
      });
    }
    return matchesSearch;
  }, [searchTerm, currentData, step, nosologyResults, showOnlyMatches]);

  const toggleSelection = (key: string) => {
    if (step === 1) {
      const next = new Set(selectedNosology);
      next.has(key) ? next.delete(key) : next.add(key);
      setSelectedNosology(next);
    } else if (step === 2) {
      const next = new Set(selectedSymptoms);
      next.has(key) ? next.delete(key) : next.add(key);
      setSelectedSymptoms(next);
    }
  };

  const handleConsultation = () => {
    alert("Заявка на консультацию отправлена.");
  };

  return (
    <div className="h-screen lg:h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="h-20 lg:h-16 px-4 lg:px-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between bg-white border-b border-slate-200 shrink-0 z-50 sticky top-0 shadow-sm">
        <div className="flex items-center space-x-4 mb-2 lg:mb-0">
          <div 
            className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform" 
            onClick={() => setStep(1)}
          >
            <span className="text-white font-black text-xl">K</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-800 leading-none">
              KINEZ SYSTEM 
              <span className="text-indigo-600 font-medium ml-2 text-xs uppercase tracking-widest hidden md:inline">
                {step === 1 ? 'Шаг 1: Нозология' : step === 2 ? 'Шаг 2: Этиология' : 'Шаг 3: Анамнез'}
              </span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-1 uppercase">МОДУЛЬ КЛИНИЧЕСКОГО АНАЛИЗА</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={resetAll}
            className="flex items-center space-x-2 text-[9px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-500 hover:text-white transition-all uppercase tracking-wider"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Начать заново</span>
          </button>
          <div className="flex items-center space-x-2 border-l border-slate-100 pl-6">
              <div className="flex space-x-1 cursor-pointer">
                <div 
                  onClick={() => handleStepChange(1)} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}
                ></div>
                <div 
                  onClick={() => selectedNosology.size > 0 ? handleStepChange(2) : null} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'} ${selectedNosology.size === 0 ? 'cursor-not-allowed opacity-30' : ''}`}
                ></div>
                <div 
                  onClick={() => selectedSymptoms.size > 0 ? handleStepChange(3) : null} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'} ${selectedSymptoms.size === 0 ? 'cursor-not-allowed opacity-30' : ''}`}
                ></div>
              </div>
            <span className="text-[10px] font-bold text-slate-400 ml-4 hidden lg:block uppercase tracking-widest">Прогресс: {step === 1 ? '33' : step === 2 ? '66' : '100'}%</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto md:overflow-hidden min-h-0 scroll-smooth">
        
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <motion.div 
              key="diagnostics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 md:h-full min-h-0"
            >
              {/* 1. КАТАЛОГ */}
              <div className="md:col-span-4 flex flex-col bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[500px] md:min-h-0 ring-1 ring-slate-200/50">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">
                      1. Справочник
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest">
                        {currentSelected.size} {step === 1 ? 'Нозология' : 'Этиология'}
                      </span>
                      {step === 2 && Object.keys(nosologyResults).length > 0 && (
                        <button 
                          onClick={() => setShowOnlyMatches(!showOnlyMatches)}
                          className={`text-[10px] px-3 py-1.5 rounded-full font-black transition-all shadow-sm ${
                            showOnlyMatches 
                              ? 'bg-amber-500 text-white shadow-amber-200' 
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100'
                          }`}
                        >
                          {showOnlyMatches ? 'ПОКАЗАТЬ ВСЕ' : 'ТОЛЬКО СОВПАДЕНИЯ'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-[12px] font-bold text-slate-600 leading-snug">
                      {step === 1 
                        ? "Выберите заболевание или состояние (Нозологию). Это поможет системе подобрать корректные препараты."
                        : "Теперь выберите психосоматические причины (Этиологию). Обратите внимание на выделенные пункты."}
                    </p>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={step === 1 ? "Выберите нозологию из списка..." : "Найдите симптомы или причины..."} 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-base outline-none pl-12 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/20 custom-scrollbar">
                  {filteredItems.map(itemKey => {
                    const itemData = (currentData as any)[itemKey];
                    const isSelected = currentSelected.has(itemKey);
                    const isRecommended = step === 2 && itemData.r.some((r: string) => nosologyResults[r]);
                    
                    return (
                      <motion.div
                        key={`${step}-${itemKey}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => toggleSelection(itemKey)}
                        className={`px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer transition-all border ${
                          isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 
                          isRecommended ? 'bg-amber-50 border-amber-300 text-slate-800 ring-4 ring-amber-100 shadow-lg scale-[1.01]' : 'text-slate-600 hover:bg-slate-50 border-transparent bg-white shadow-sm'
                        } flex flex-col group overflow-hidden relative`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`${isSelected ? 'text-sm' : 'text-[13px]'} font-bold transition-all flex items-center`}>
                            {isRecommended && <Star className="w-3.5 h-3.5 mr-2 text-amber-500 fill-amber-500 animate-pulse" />}
                            {itemKey}
                          </span>
                          {isSelected ? <CheckCircle2 className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors" />}
                        </div>
                        
                        {/* Реактивы видны только если выбрано или рекомендовано, чтобы не загромождать список */}
                        {(isSelected || isRecommended) && (
                          <div className="mt-2 pt-2 border-t border-slate-200/50">
                            <div className="flex flex-wrap gap-1">
                              {itemData.r.map((rem: string) => {
                                const isAlreadyDetected = step === 2 && nosologyResults[rem];
                                return (
                                  <span 
                                    key={rem} 
                                    className={`text-[10px] px-2 py-0.5 rounded-lg uppercase tracking-normal border ${
                                      isAlreadyDetected 
                                        ? 'bg-amber-500 text-white border-amber-600 font-black' 
                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}
                                  >
                                    {rem}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 2. СВЯЗИ (АНИМИРОВАННЫЕ) */}
              <div className="md:col-span-5 flex flex-col bg-slate-100/50 border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[400px] md:min-h-0 ring-1 ring-slate-200/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                  <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">2. Энергетические Связи</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Детекция препаратов</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-50/10">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {allIdentifiedRemediesArr.length === 0 ? (
                      <motion.div 
                        key="empty-zap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="h-full py-10 flex flex-col items-center justify-center text-slate-300"
                      >
                        <Zap className="w-10 h-10 mb-4" />
                        <p className="text-[10px] font-black uppercase">Нет данных для анализа</p>
                      </motion.div>
                    ) : (
                      allIdentifiedRemediesArr.map(remKey => {
                        const info = BACH_DATA[remKey] || { ru: remKey, element: 'earth' };
                        const config = (ELEMENT_CONFIG as any)[info.element] || ELEMENT_CONFIG.earth;
                        const etItems = etiologyResults[remKey];
                        const noItems = nosologyResults[remKey];
                        const isSynergic = etItems && noItems;
                        return (
                          <motion.div 
                            key={remKey} 
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-4 rounded-2xl bg-white border-t-2 shadow-sm border ${isSynergic ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-100'} group transition-all hover:shadow-md`} 
                            style={{ borderTopColor: config.border.split('-')[1] === 'red' ? '#ef4444' : config.label === 'Вода' ? '#3b82f6' : config.label === 'Земля' ? '#92400e' : config.label === 'Дерево' ? '#10b981' : '#64748b' }}
                          >
                            <div className="flex justify-between items-start mb-1.5">
                               <div>
                                 <div className="flex items-center space-x-2">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">{remKey}</span>
                                    {isSynergic && <Zap className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />}
                                 </div>
                                 <h3 className={`font-black text-slate-800 ${isSynergic ? 'text-sm' : 'text-xs'}`}>{info.ru}</h3>
                               </div>
                               <span className="text-lg group-hover:scale-110 transition-transform">{config.icon}</span>
                            </div>
                            <div className={`text-[8px] font-bold ${config.color} uppercase mb-2 flex items-center opacity-70`}>
                              {config.label} ({config.force})
                            </div>
                            <div className="space-y-1 pt-1 border-t border-slate-50">
                              {noItems && <div className="flex flex-wrap gap-1"><span className="text-[7px] text-indigo-300 uppercase font-black">В Ноз.:</span>{noItems.map(s => <span key={s} className="text-[7px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-500 font-bold border border-slate-100">{s}</span>)}</div>}
                              {etItems && <div className="flex flex-wrap gap-1"><span className="text-[7px] text-amber-500 uppercase font-black">В Этио.:</span>{etItems.map(s => <span key={s} className="text-[7px] bg-amber-50 px-1.5 py-0.5 rounded text-amber-600 font-bold border border-amber-100">{s}</span>)}</div>}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 3. ОРГАНЫ */}
              <div className="md:col-span-3 flex flex-col bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[300px] md:min-h-0 ring-1 ring-slate-200/50">
                <div className="p-6 border-b border-indigo-100 bg-indigo-50/30 shrink-0">
                  <h2 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">3. Системы Организма</h2>
                  <p className="text-[10px] text-indigo-400 font-bold italic">Проекция физического состояния</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 custom-scrollbar">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {targetOrgansArr.length === 0 ? (
                      <motion.div key="empty-organs" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="h-full py-10 flex flex-col items-center justify-center"><Activity className="w-10 h-10 mb-2" /><span className="text-[9px] font-black uppercase">Ожидание выбора</span></motion.div>
                    ) : (
                      targetOrgansArr.map((data, idx) => (
                        <motion.div 
                          key={data.o} 
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">L{data.l}</div>
                            <div className="text-xs font-black text-slate-700 leading-none">{data.o}</div>
                          </div>
                          <div className={`h-2 w-2 rounded-full ${data.l > 4 ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_5px_rgba(0,0,0,0.1)]`}></div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
                <div className="p-6 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-20">
                  <button 
                    onClick={() => handleStepChange(step === 1 ? 2 : 3)}
                    disabled={(step === 1 && selectedNosology.size === 0) || (step === 2 && selectedSymptoms.size === 0)}
                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none group ring-4 ring-indigo-100 ring-offset-2"
                  >
                    <span className="flex items-center justify-center">{step === 1 ? 'Далее к Этиологии' : 'Анамнез'} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                  </button>
                  {step === 2 && (
                    <button 
                      onClick={() => handleStepChange(1)} 
                      className="w-full mt-4 py-3 text-slate-400 font-bold uppercase text-[10px] hover:text-indigo-600 transition-colors flex items-center justify-center border-2 border-transparent hover:border-slate-100 rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Назад к Нозологии
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Step 3: Anamnesis */
            <motion.div 
              key="anamnesis"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col md:flex-row gap-8 md:overflow-hidden bg-white rounded-[40px] border border-slate-200 shadow-2xl p-4 md:p-8"
            >
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center mb-8 border-b border-slate-100 pb-6 shrink-0">
                   <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mr-5 shadow-lg shadow-indigo-100">
                      <ShieldCheck className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-none mb-1 text-slate-800 uppercase">Итоговый анамнез</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnostic Clinical Report / Step 3</p>
                   </div>
                </div>

                <div className="flex-1 md:overflow-y-auto pr-0 md:pr-4 custom-scrollbar space-y-8">
                   {synergyRemedies.length > 0 && (
                     <section id="synergy-report" className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <h3 className="text-xs font-black uppercase text-amber-600 tracking-widest mb-4 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-2 fill-amber-500" /> ВЫЯВЛЕННАЯ СИНЕРГИЯ (СОВПАДЕНИЯ)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {synergyRemedies.map(rem => {
                           const info = BACH_DATA[rem];
                           const config = (ELEMENT_CONFIG as any)[info?.element] || ELEMENT_CONFIG.earth;
                           return (
                             <div key={`syn-${rem}`} className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-black text-amber-900">{info?.ru || rem}</span>
                                  <span className="text-xl">{config.icon}</span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[8px] text-slate-500 font-bold uppercase">В Нозологии: {nosologyResults[rem]?.join(', ')}</p>
                                  <p className="text-[8px] text-slate-500 font-bold uppercase">В Этиологии: {etiologyResults[rem]?.join(', ')}</p>
                                </div>
                             </div>
                           );
                        })}
                      </div>
                     </section>
                   )}

                   <section>
                      <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-4 flex items-center"><Star className="w-3 h-3 mr-2" /> Клиническая картина</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase mb-3">Нозологические единицы:</h4>
                            <div className="flex flex-wrap gap-2">
                               {Array.from(selectedNosology).map(s => <span key={s} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm">{s}</span>)}
                            </div>
                         </div>
                         <div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100">
                            <h4 className="text-[9px] font-black text-indigo-400 uppercase mb-3">Этиологические факторы:</h4>
                            <div className="flex flex-wrap gap-2">
                               {Array.from(selectedSymptoms).map(s => <span key={s} className="px-3 py-1.5 bg-white border border-indigo-200 rounded-xl text-[10px] font-bold text-indigo-700 shadow-sm">{s}</span>)}
                            </div>
                         </div>
                      </div>
                   </section>

                   <section>
                      <h3 className="text-xs font-black uppercase text-indigo-600 tracking-widest mb-4 flex items-center"><Sparkles className="w-3 h-3 mr-2" /> Схема коррекции (Бах)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {allIdentifiedRemediesArr.map(rem => {
                            const info = BACH_DATA[rem];
                            const config = (ELEMENT_CONFIG as any)[info?.element] || ELEMENT_CONFIG.earth;
                            return (
                               <div key={rem} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center space-x-4">
                                     <span className="text-xl">{config.icon}</span>
                                     <div>
                                        <div className="text-sm font-black text-slate-800 leading-tight">{info?.ru || rem} <span className="text-[9px] text-slate-400 font-medium italic">({rem})</span></div>
                                        <div className={`text-[8px] font-bold ${config.color} uppercase`}>{config.label} • {config.force}</div>
                                     </div>
                                  </div>
                                  <div className="flex space-x-1">
                                     {etiologyResults[rem] && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 shadow-sm" title="Найден в этиологии"></div>}
                                     {nosologyResults[rem] && <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm" title="Найден в нозологии"></div>}
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </section>
                </div>
              </div>

              {/* Action Column */}
              <div className="w-full md:w-80 flex flex-col shrink-0 gap-6 min-h-0">
                 <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400 relative z-10">Проекция систем:</h3>
                    <div className="space-y-4 relative z-10">
                       {targetOrgansArr.slice(0, 10).map((org, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <div className="flex items-center space-x-3">
                                <span className="text-[10px] text-slate-500 font-bold">L{org.l}</span>
                                <span className="text-xs font-bold text-slate-200">{org.o}</span>
                             </div>
                             <Activity className={`w-3 h-3 ${org.l > 4 ? 'text-red-500' : 'text-emerald-500'}`} />
                          </div>
                       ))}
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-5">
                       <ShieldCheck className="w-40 h-40" />
                    </div>
                 </div>

                 <div className="mt-auto space-y-3">
                    <button className="w-full py-4 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all hover:-translate-y-0.5 active:translate-y-0">
                       <Printer className="w-4 h-4 mr-2 text-indigo-400" /> Печать отчета
                    </button>
                    <button 
                      onClick={handleConsultation}
                      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                       <Phone className="w-4 h-4 mr-2" /> Консультация специалиста
                    </button>
                    <button 
                      onClick={() => handleStepChange(2)} 
                      className="w-full mt-4 py-2 text-slate-400 font-bold uppercase text-[9px] hover:text-indigo-600 transition-colors flex items-center justify-center border-2 border-transparent hover:border-slate-100 rounded-xl"
                    >
                      Назад к этиологии
                    </button>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Mobile Footer Sticky Action */}
      <div className="md:hidden p-4 bg-white border-t border-slate-200 sticky bottom-0 z-50 flex space-x-2">
         {step === 2 && (
            <button 
              onClick={() => handleStepChange(1)} 
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black uppercase text-[9px] tracking-widest"
            >
              Ко Ши 1
            </button>
         )}
         {step < 3 && (
            <button 
              onClick={() => handleStepChange(step === 1 ? 2 : 3)}
              disabled={(step === 1 && selectedNosology.size === 0) || (step === 2 && selectedSymptoms.size === 0)}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-30"
            >
              {step === 1 ? 'Далее' : 'Анамнез'}
            </button>
         )}
      </div>

      {/* Footer */}
      <footer className="h-10 px-10 bg-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] shrink-0">
        <div className="flex space-x-6 items-center">
          <div className="flex items-center text-slate-300">
             <User className="w-3 h-3 mr-2 text-indigo-400" />
             <span>Пациент: Иванов А.В.</span>
          </div>
          <span className="opacity-50 text-[8px] font-mono">HASH: 99281-KXC</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          Diagnostic Secure Layer Active
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}
