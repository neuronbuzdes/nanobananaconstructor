import React from 'react';
import { ArrowLeft, Filter, ArrowUpDown, Repeat, Heart } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onBack: () => void;
  onReuse: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onBack, onReuse }) => {
  return (
    <div className="flex-1 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-white">History & Library</h1>
                <p className="text-xs text-zinc-500">Your generated images and saved styles</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-300">
                <ArrowUpDown size={14} /> Sort
             </button>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-300">
                <Filter size={14} /> Filter
             </button>
             <span className="text-xs text-yellow-400 font-bold ml-2">{history.length} items</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-4 border-b border-zinc-800/50">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
              <button className="text-sm font-bold text-zinc-950 bg-yellow-400 px-4 py-1 rounded-full whitespace-nowrap">All Images</button>
              <button className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-1 rounded-full whitespace-nowrap">Today</button>
              <button className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-1 rounded-full whitespace-nowrap">This Week</button>
              <button className="text-sm font-medium text-zinc-400 hover:text-white px-4 py-1 rounded-full whitespace-nowrap flex items-center gap-1"><Heart size={14} className="fill-current"/> Favorites</button>
          </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
                <p>No history yet. Start generating!</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {history.map((item) => (
                    <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                        <img 
                            src={item.imageUrl} 
                            alt={item.prompt} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        
                        {/* Overlay Controls on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                             <div className="self-end">
                                 <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm">
                                     <Heart size={16} />
                                 </button>
                             </div>
                             
                             <div className="space-y-2">
                                 <p className="text-[10px] text-zinc-300 line-clamp-2">{item.prompt}</p>
                                 <button 
                                    onClick={() => onReuse(item)}
                                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-zinc-950 text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
                                 >
                                     <Repeat size={14} /> Reuse Style
                                 </button>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        <div className="mt-8 flex justify-center pb-8">
            <button className="px-6 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-colors">
                + Load More Images
            </button>
        </div>
      </div>
    </div>
  );
};