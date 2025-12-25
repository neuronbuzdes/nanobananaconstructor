import React from 'react';
import { X, Download, Share2, Edit2, RotateCw, Heart, Copy } from 'lucide-react';
import { GenerationResult, GenerationSettings, HistoryItem } from '../types';

interface ResultViewProps {
  result: GenerationResult | HistoryItem;
  settings: GenerationSettings;
  onClose: () => void;
  onRegenerate: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  settings,
  onClose,
  onRegenerate,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col md:flex-row">
      
      {/* Left: Image View (Main focus) */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-4 md:p-8">
        <button 
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full backdrop-blur-md transition-colors"
        >
            <X size={20} />
        </button>
        
        <div className="relative w-full h-full flex items-center justify-center">
            <img 
                src={result.imageUrl} 
                alt="Generated Result" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            />
        </div>
      </div>

      {/* Right: Sidebar / Controls */}
      <div className="w-full md:w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-[40vh] md:h-full">
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {/* Header Details */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4">Generation Details</h2>
                <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="text-white font-medium text-right">{settings.model === 'gemini-3-pro-image-preview' ? 'Nano Banana Pro' : 'Nano Banana'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Aspect Ratio:</span>
                        <span className="text-white font-medium">{settings.aspectRatio}</span>
                    </div>
                     {settings.model === 'gemini-3-pro-image-preview' && (
                         <div className="flex justify-between">
                            <span>Size:</span>
                            <span className="text-white font-medium">{settings.imageSize}</span>
                        </div>
                     )}
                </div>
            </div>

            {/* Actions Stack */}
            <div className="space-y-3">
                <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Download size={18} /> Download
                </button>
                <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-zinc-700">
                    <Share2 size={18} /> Share
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-zinc-700"
                >
                    <Edit2 size={18} /> Edit Settings
                </button>
                <button 
                    onClick={onRegenerate}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                >
                    <RotateCw size={18} /> Generate Again
                </button>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-500 mb-2 uppercase">Prompt</h3>
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                    "{result.prompt}"
                </p>
            </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="p-4 border-t border-zinc-800 grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors">
                <Heart size={20} />
                <span className="text-[10px]">Save</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-blue-400 transition-colors">
                <Copy size={20} />
                <span className="text-[10px]">Copy Prompt</span>
            </button>
        </div>
      </div>
    </div>
  );
};