import React, { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Category, StyleOption } from '../types';

interface SelectionGridProps {
  category: Category;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  onBack: () => void;
}

export const SelectionGrid: React.FC<SelectionGridProps> = ({
  category,
  selectedOptionId,
  onSelect,
  onBack,
}) => {
  // Group options if 'group' property exists
  const { groups, order } = useMemo(() => {
    const groups: Record<string, StyleOption[]> = {};
    const order: string[] = [];

    // Check if any option has a group (excluding 'none' which might have 'General')
    const hasAnyGroups = category.options.some(opt => opt.group && opt.id !== 'none');

    if (!hasAnyGroups) {
        return { groups: { 'All': category.options }, order: ['All'] };
    }

    category.options.forEach(opt => {
        const g = opt.group || 'General';
        if (!groups[g]) {
            groups[g] = [];
            order.push(g);
        }
        groups[g].push(opt);
    });

    return { groups, order };
  }, [category]);

  const renderOption = (option: StyleOption) => {
    const isSelected = selectedOptionId === option.id || (!selectedOptionId && option.id === 'none');
    return (
        <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
                group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all
                ${isSelected 
                    ? 'border-yellow-400 shadow-[0_0_20px_-5px_rgba(250,204,21,0.3)]' 
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'}
            `}
        >
            {option.id === 'none' ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 group-hover:text-zinc-400">
                    <XCircle size={40} className="mb-3" />
                    <span className="text-sm font-medium">None</span>
                </div>
            ) : (
                <>
                    <img 
                        src={option.previewUrl} 
                        alt={option.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        loading="lazy"
                    />
                    {/* Selected Overlay with Checkmark */}
                    {isSelected && (
                        <div className="absolute inset-0 bg-yellow-400/10 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-yellow-400 text-black rounded-full p-1 shadow-lg">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                    )}
                    {/* Label Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8">
                        <span className={`text-xs font-bold block text-center truncate ${isSelected ? 'text-yellow-400' : 'text-zinc-300'}`}>
                            {option.name}
                        </span>
                    </div>
                </>
            )}
        </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-bold text-white">{category.name}</h1>
                <p className="text-xs text-zinc-500">{category.description}</p>
            </div>
        </div>
        
        {/* Done Button */}
        <button 
            onClick={onBack}
            className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm transition-colors"
        >
            Done
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {order.map(groupName => (
                <div key={groupName}>
                    {/* Render Header only if not the default "All" group and if groups actually exist */}
                    {groupName !== 'All' && (
                        <h3 className="text-lg font-bold text-zinc-100 mb-4 px-1 sticky top-0 py-2 bg-zinc-950/95 backdrop-blur z-10 border-b border-zinc-800/50">
                            {groupName}
                        </h3>
                    )}
                    
                    {/* Updated grid columns to prefer 4 columns as per "Row 1: A, B, C, D" structure */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {groups[groupName].map(option => renderOption(option))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};