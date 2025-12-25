
import React, { useRef } from 'react';
import { Camera, ChevronRight, Upload, XCircle, Image as ImageIcon, User, Image as ImageIconLucide, Plus, Key, Eye } from 'lucide-react';
import { CATEGORIES, GENDER_OPTIONS } from '../constants';
import { GenerationSettings } from '../types';

interface MainStudioProps {
  settings: GenerationSettings;
  updateSettings: (key: keyof GenerationSettings, value: any) => void;
  updateStyle: (categoryId: string, optionId: string) => void;
  onNavigateToSelection: (categoryId: string) => void;
  onGenerate: () => void;
  onViewPrompt: () => void;
  hasProKey?: boolean;
}

export const MainStudio: React.FC<MainStudioProps> = ({
  settings,
  updateSettings,
  updateStyle,
  onNavigateToSelection,
  onGenerate,
  onViewPrompt,
  hasProKey = false
}) => {
  const charInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'character' | 'background' | 'additional'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const currentRefs = settings.referenceImages;

      if (type === 'additional') {
        if (currentRefs.additional.length >= 5) {
          alert("Maximum 5 additional items allowed.");
          return;
        }
        updateSettings('referenceImages', {
          ...currentRefs,
          additional: [...currentRefs.additional, result]
        });
      } else {
        updateSettings('referenceImages', {
          ...currentRefs,
          [type]: result
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearImage = (type: 'character' | 'background', e: React.MouseEvent) => {
    e.stopPropagation();
    updateSettings('referenceImages', {
      ...settings.referenceImages,
      [type]: null
    });
  };

  const removeAdditionalImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAdditional = [...settings.referenceImages.additional];
    newAdditional.splice(index, 1);
    updateSettings('referenceImages', {
      ...settings.referenceImages,
      additional: newAdditional
    });
  };

  const isProMissingKey = settings.model === 'gemini-3-pro-image-preview' && !hasProKey;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* Reference Images Section */}
        <div>
           <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Reference Images</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => charInputRef.current?.click()}
                className={`
                  relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                  ${settings.referenceImages.character
                    ? 'border-yellow-400/50 bg-zinc-900/50' 
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/30 hover:bg-zinc-900/50'}
                `}
              >
                <input type="file" ref={charInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'character')} />
                {settings.referenceImages.character ? (
                   <>
                     <img src={settings.referenceImages.character} alt="Character" className="w-full h-full object-cover" />
                     <button onClick={(e) => clearImage('character', e)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors"><XCircle size={16} /></button>
                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><span className="text-xs font-bold text-yellow-400">Character Ref</span></div>
                   </>
                ) : (
                   <div className="text-center p-4">
                      <User size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs font-bold text-zinc-300">Character Face</p>
                      <p className="text-[10px] text-zinc-500">Max 1 photo</p>
                   </div>
                )}
              </div>

              <div 
                onClick={() => bgInputRef.current?.click()}
                className={`
                  relative h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                  ${settings.referenceImages.background
                    ? 'border-yellow-400/50 bg-zinc-900/50' 
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/30 hover:bg-zinc-900/50'}
                `}
              >
                <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'background')} />
                {settings.referenceImages.background ? (
                   <>
                     <img src={settings.referenceImages.background} alt="Background" className="w-full h-full object-cover" />
                     <button onClick={(e) => clearImage('background', e)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors"><XCircle size={16} /></button>
                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent"><span className="text-xs font-bold text-yellow-400">Background Ref</span></div>
                   </>
                ) : (
                   <div className="text-center p-4">
                      <ImageIconLucide size={32} className="mx-auto text-zinc-600 mb-2" />
                      <p className="text-xs font-bold text-zinc-300">Background</p>
                      <p className="text-[10px] text-zinc-500">Max 1 photo</p>
                   </div>
                )}
              </div>

              <div className={`relative h-48 border-2 border-dashed rounded-xl flex flex-col transition-all overflow-hidden bg-zinc-900/30 border-zinc-800`}>
                <input type="file" ref={addInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'additional')} />
                <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                    {settings.referenceImages.additional.length === 0 ? (
                        <div onClick={() => addInputRef.current?.click()} className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 rounded-lg transition-colors">
                            <Plus size={32} className="mx-auto text-zinc-600 mb-2" />
                            <div className="text-center"><p className="text-xs font-bold text-zinc-300">Add Items</p><p className="text-[10px] text-zinc-500">Up to 5 photos</p></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {settings.referenceImages.additional.length < 5 && (
                                <button onClick={() => addInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center border border-zinc-700 hover:border-zinc-500 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-all"><Plus size={20} className="text-zinc-400" /><span className="text-[9px] text-zinc-500 mt-1">Add</span></button>
                            )}
                            {settings.referenceImages.additional.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                    <img src={img} alt={`Item ${idx}`} className="w-full h-full object-cover" />
                                    <button onClick={(e) => removeAdditionalImage(idx, e)} className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex justify-between items-center"><span className="text-[10px] font-bold text-zinc-400">Extra Items</span><span className="text-[10px] text-zinc-500">{settings.referenceImages.additional.length}/5</span></div>
              </div>
           </div>
        </div>

        {/* Gender Selection Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Gender</h2>
          <div className="grid grid-cols-4 gap-3">
            {GENDER_OPTIONS.map((option) => {
              const isSelected = settings.gender === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => updateSettings('gender', isSelected ? null : option.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${isSelected ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_10px_-3px_rgba(250,204,21,0.3)]' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-8">
            {CATEGORIES.map((category) => {
                let isDisabled = false;
                if (category.id === 'subject' && !!settings.referenceImages.character) isDisabled = true;
                if (category.id === 'painters') {
                    // Category available for any gender as long as character reference is provided
                    const hasCharRef = !!settings.referenceImages.character;
                    if (!hasCharRef) isDisabled = true;
                }
                if (isDisabled) return null;
                const activeOptionId = settings.selectedStyles[category.id];
                const previewOptions = category.options.slice(0, 6);

                return (
                    <div key={category.id} className="space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-zinc-100">{category.name}</h2>
                            <button onClick={() => onNavigateToSelection(category.id)} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-medium transition-colors">Show All <ChevronRight size={14} /></button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {previewOptions.map((option) => {
                                const isSelected = activeOptionId === option.id || (!activeOptionId && option.id === 'none');
                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => updateStyle(category.id, option.id)}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-yellow-400 shadow-[0_0_15px_-3px_rgba(250,204,21,0.3)]' : 'border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                        {option.id === 'none' ? (
                                            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600 group-hover:text-zinc-400 transition-colors"><XCircle size={24} className="mb-2" /><span className="text-[10px] uppercase font-bold tracking-wider">None</span></div>
                                        ) : (
                                            <>
                                                <img src={option.previewUrl} alt={option.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2"><span className={`text-[10px] font-medium truncate w-full text-center ${isSelected ? 'text-yellow-400' : 'text-zinc-300'}`}>{option.name}</span></div>
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
              <button 
                onClick={onViewPrompt}
                title="Посмотреть текущий промпт"
                className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/30 transition-all active:scale-95"
              >
                  <Eye size={20} />
              </button>
              <button
                onClick={onGenerate}
                className={`
                    px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg
                    ${isProMissingKey 
                        ? 'bg-zinc-800 text-yellow-400 hover:bg-zinc-700 border border-yellow-400/50' 
                        : 'bg-yellow-400 hover:bg-yellow-300 text-zinc-950 shadow-yellow-900/20'}
                `}
              >
                {isProMissingKey ? (
                    <>
                        <Key size={18} />
                        Настроить Pro ключ
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping opacity-20 bg-black rounded-full"></div>
                            <ImageIcon size={18} />
                        </div>
                        Generate
                    </>
                )}
              </button>
          </div>
      </div>
    </div>
  );
};
