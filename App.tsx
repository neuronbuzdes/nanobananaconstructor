
import React, { useState, useEffect } from 'react';
import { LayoutGrid, Banana, Monitor, Smartphone, Book, Tv, Box, ShieldCheck, CreditCard, Key, Lock, Unlock, X, Copy, Check, Wand2, Image as ImageIcon } from 'lucide-react';
import { MainStudio } from './components/MainStudio';
import { SelectionGrid } from './components/SelectionGrid';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { CATEGORIES, MODELS, ASPECT_RATIOS } from './constants';
import { GenerationSettings, HistoryItem, ModelType, AspectRatio } from './types';
import { generateImage, constructPrompt } from './services/geminiService';

type Screen = 'studio' | 'selection' | 'result' | 'history';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('studio');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasUserKey, setHasUserKey] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');

  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'gemini-2.5-flash-image',
    aspectRatio: '1:1',
    imageSize: '1K',
    referenceImages: { character: null, background: null, additional: [] },
    gender: 'woman',
    selectedStyles: {},
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const status = await window.aistudio.hasSelectedApiKey();
      setHasUserKey(status);
    };
    checkKey();
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateSettings = (key: keyof GenerationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleModelChange = async (modelId: ModelType) => {
    if (modelId === 'gemini-3-pro-image-preview') {
      // @ts-ignore
      const status = await window.aistudio.hasSelectedApiKey();
      if (!status) {
        try {
          // @ts-ignore
          await window.aistudio.openSelectKey();
          setHasUserKey(true);
          updateSettings('model', modelId);
        } catch (e) {
          console.error("Key selection cancelled", e);
        }
      } else {
        updateSettings('model', modelId);
      }
    } else {
      updateSettings('model', modelId);
    }
  };

  const handleGenerate = async (prompt?: string | any) => {
    // Safety check: ensure prompt is a string to avoid circular dependency errors if an event is passed
    const overridePrompt = typeof prompt === 'string' ? prompt : undefined;

    if (settings.model === 'gemini-3-pro-image-preview') {
      // @ts-ignore
      const isKeySelected = await window.aistudio.hasSelectedApiKey();
      if (!isKeySelected) {
        alert("Для Nano Banana Pro ОБЯЗАТЕЛЬНО требуется ваш собственный API-ключ.");
        // @ts-ignore
        await window.aistudio.openSelectKey();
        return;
      }
    }

    setIsGenerating(true);
    setIsPreviewOpen(false);
    setLoadingStep(0);
    const timer = setInterval(() => setLoadingStep(s => (s < 90 ? s + 10 : s)), 300);

    try {
      const result = await generateImage(settings, overridePrompt);
      clearInterval(timer);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: result.imageUrl,
        settings: { ...settings },
        prompt: result.prompt
      };

      setHistory(h => [newItem, ...h]);
      setLastResult(newItem);
      setIsGenerating(false);
      setCurrentScreen('result');
    } catch (error: any) {
      clearInterval(timer);
      setIsGenerating(false);
      
      const errorMsg = error.message || "";
      if (errorMsg.includes("Requested entity was not found") || errorMsg === "API_KEY_REQUIRED") {
        alert("Ошибка доступа: Выбранный ключ не подходит или не активен.");
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        alert(`Ошибка: ${error.message}`);
      }
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPromptPreview = () => {
    setEditablePrompt(constructPrompt(settings));
    setIsPreviewOpen(true);
  };

  const getAspectRatioIcon = (ar: AspectRatio) => {
    const found = ASPECT_RATIOS.find(r => r.id === ar);
    switch(found?.icon) {
      case 'smartphone': return <Smartphone size={16} />;
      case 'monitor': return <Monitor size={16} />;
      case 'book': return <Book size={16} />;
      case 'tv': return <Tv size={16} />;
      default: return <Box size={16} />;
    }
  };

  const renderScreen = () => {
    if (isGenerating) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-400 rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-bold text-white mb-2 tracking-tight">Создаем шедевр...</p>
          <p className="text-zinc-500 text-sm mb-6">Используем мощности Gemini AI</p>
          <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${loadingStep}%` }}></div>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case 'selection':
        const cat = CATEGORIES.find(c => c.id === activeCategoryId);
        return cat ? (
          <SelectionGrid 
            category={cat} 
            selectedOptionId={settings.selectedStyles[cat.id]} 
            onSelect={(id) => updateSettings('selectedStyles', { ...settings.selectedStyles, [cat.id]: id })} 
            onBack={() => setCurrentScreen('studio')} 
          />
        ) : null;
      case 'result':
        return lastResult ? (
          <ResultView 
            result={lastResult} 
            settings={lastResult.settings} 
            onClose={() => setCurrentScreen('studio')} 
            onRegenerate={() => handleGenerate()} 
          />
        ) : null;
      case 'history':
        return <HistoryView history={history} onBack={() => setCurrentScreen('studio')} onReuse={(item) => { setSettings(item.settings); setCurrentScreen('studio'); }} />;
      default:
        return (
          <MainStudio 
            settings={settings} 
            updateSettings={updateSettings} 
            updateStyle={(cid, oid) => updateSettings('selectedStyles', { ...settings.selectedStyles, [cid]: oid })} 
            onNavigateToSelection={(id) => { setActiveCategoryId(id); setCurrentScreen('selection'); }} 
            onGenerate={() => handleGenerate()} 
            onViewPrompt={openPromptPreview}
            hasProKey={hasUserKey}
          />
        );
    }
  };

  const isProMissingKey = settings.model === 'gemini-3-pro-image-preview' && !hasUserKey;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 selection:bg-yellow-400 selection:text-black">
      {currentScreen === 'studio' && !isGenerating && (
        <header className="px-4 py-3 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-zinc-900 shadow-lg shadow-yellow-400/20">
                <Banana size={20} fill="currentColor" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">Nano<span className="text-yellow-400">Banana</span> Constructor</span>
            </div>
            {hasUserKey && (
              <div className="hidden md:flex px-2 py-1 bg-green-500/10 border border-green-500/20 rounded items-center gap-1.5">
                <Unlock size={12} className="text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase">Personal Key Active</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 overflow-hidden">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  className={`px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-2 ${settings.model === m.id ? 'bg-yellow-400 text-zinc-900 shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {m.isPro ? (
                    hasUserKey ? <Unlock size={12} /> : <Lock size={12} className="text-red-400" />
                  ) : null}
                  {m.isPro ? (hasUserKey ? m.name : "Pro: Ввести ключ") : m.name}
                </button>
              ))}
            </div>
            
            <button 
              // @ts-ignore
              onClick={() => window.aistudio.openSelectKey()}
              title="Настроить свой API-ключ"
              className={`p-2 transition-colors bg-zinc-900 border border-zinc-800 rounded-lg ${hasUserKey ? 'text-green-400 hover:text-green-300' : 'text-zinc-400 hover:text-yellow-400'}`}
            >
              <Key size={18} />
            </button>

            <div className="hidden sm:flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {ASPECT_RATIOS.slice(0, 3).map(r => (
                <button key={r.id} onClick={() => updateSettings('aspectRatio', r.id)} className={`p-1.5 rounded-md ${settings.aspectRatio === r.id ? 'text-yellow-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {getAspectRatioIcon(r.id)}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentScreen('history')} className="p-2 text-zinc-400 hover:text-yellow-400 transition-colors">
              <LayoutGrid size={22} />
            </button>
          </div>
        </header>
      )}
      {renderScreen()}

      {/* Prompt Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
             <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-yellow-400/10 rounded text-yellow-400"><Banana size={16} /></div>
                   <h3 className="font-bold text-zinc-100">Предпросмотр промпта</h3>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
             </div>
             
             <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Сгенерированный текст для Gemini AI</p>
                   <button 
                        onClick={handleCopyPrompt}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'}`}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Скопировано' : 'Копировать'}
                    </button>
                </div>

                <div className="relative">
                    <textarea 
                        value={editablePrompt}
                        onChange={(e) => setEditablePrompt(e.target.value)}
                        className="w-full bg-black/40 p-5 rounded-xl border border-zinc-800 font-mono text-sm text-zinc-300 min-h-[220px] max-h-[400px] overflow-y-auto whitespace-pre-wrap leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
                        spellCheck={false}
                    />
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-400/5 rounded-xl border border-yellow-400/10">
                    <div className="mt-0.5 p-1 bg-yellow-400/10 rounded text-yellow-400">
                        <ShieldCheck size={14} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">Expert Architecture Applied</p>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                            Промпт построен по структуре «От общего к частному». Вы можете вручную отредактировать текст перед генерацией.
                        </p>
                    </div>
                </div>
             </div>

             <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3">
                <button 
                    onClick={() => setIsPreviewOpen(false)} 
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-lg transition-all active:scale-95 uppercase text-xs"
                >
                    Закрыть
                </button>
                <button 
                    onClick={() => handleGenerate(editablePrompt)} 
                    className={`
                        px-8 py-3 rounded-lg font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-yellow-900/20 uppercase text-xs
                        ${isProMissingKey 
                            ? 'bg-zinc-800 text-yellow-400 border border-yellow-400/50 hover:bg-zinc-700' 
                            : 'bg-yellow-400 hover:bg-yellow-300 text-zinc-950'}
                    `}
                >
                    {isProMissingKey ? (
                        <>
                            <Key size={14} />
                            Настроить Pro ключ
                        </>
                    ) : (
                        <>
                            <Wand2 size={14} />
                            Generate
                        </>
                    )}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
