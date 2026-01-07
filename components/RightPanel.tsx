import React from 'react';
import { 
  Share2,
  Download,
  History
} from 'lucide-react';
import { GeneratedImage } from '../App';

interface RightPanelProps {
  history: GeneratedImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExport: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ history, selectedId, onSelect, onExport }) => {
  return (
    <aside className="w-72 flex flex-col border-l border-border-ui bg-panel-bg shrink-0 h-full overflow-hidden z-10">
      {/* Header */}
      <div className="bg-panel-header px-4 py-3 border-b border-border-ui cursor-default">
          <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#b0b0b0]">Generations</span>
      </div>

      {/* Generations List (History) */}
      <div className="flex-1 overflow-y-auto bg-panel-bg p-2">
           {history.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-text-muted gap-2 opacity-50">
                   <History size={24} />
                   <span className="text-xs">No history yet</span>
               </div>
           ) : (
               <div className="flex flex-col gap-2">
                   {history.map((img) => (
                       <div 
                        key={img.id}
                        onClick={() => onSelect(img.id)}
                        className={`flex gap-2 p-2 rounded cursor-pointer border ${selectedId === img.id ? 'bg-active-item border-primary' : 'border-transparent hover:bg-white/5'}`}
                       >
                           <img src={img.url} className="w-12 h-16 object-cover rounded-sm bg-black" alt="thumbnail" />
                           <div className="flex flex-col justify-center min-w-0">
                               <span className="text-xs font-medium text-white truncate w-full">{img.prompt}</span>
                               <span className="text-[10px] text-text-muted">{img.ratio}</span>
                           </div>
                       </div>
                   ))}
               </div>
           )}
      </div>

      {/* Footer Actions */}
      <div className="p-2 border-t border-border-ui bg-panel-bg flex justify-between gap-2">
        <button className="flex-1 h-8 bg-active-item hover:bg-white/10 text-text-main border border-border-ui rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors">
          <Share2 size={12} /> Share
        </button>
        <button 
          onClick={onExport}
          className={`flex-1 h-8 bg-primary text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors ${!selectedId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={!selectedId}
        >
          <Download size={12} /> Export
        </button>
      </div>
    </aside>
  );
};

export default RightPanel;