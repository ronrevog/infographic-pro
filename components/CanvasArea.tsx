import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  BoxSelect, 
  Undo2, 
  Redo2, 
  UserPlus, 
  ScanLine,
  Minus,
  Plus,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Sparkles,
  MousePointer2,
  X,
  ImagePlus
} from 'lucide-react';
import { GeneratedImage, AspectRatio } from '../App';

interface CanvasAreaProps {
  activeImage: GeneratedImage | null;
  isGenerating: boolean;
  onEdit: (prompt: string) => void;
  aspectRatio: AspectRatio;
  onAddReference: (img: string) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ activeImage, isGenerating, onEdit, aspectRatio, onAddReference }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [zoom, setZoom] = useState(0.75);
  const containerRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selection Box State
  const [showSelection, setShowSelection] = useState(false);
  const [selection, setSelection] = useState({ x: 20, y: 20, w: 60, h: 20 }); // Percentages
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Mouse start pos
  const [initialSelection, setInitialSelection] = useState({ x: 0, y: 0 }); // Selection start pos

  const handleEditSubmit = () => {
    if (editPrompt.trim()) {
      const finalPrompt = showSelection 
        ? `In the selected region (x:${Math.round(selection.x)}% y:${Math.round(selection.y)}%): ${editPrompt}` 
        : editPrompt;
      onEdit(finalPrompt);
      setEditPrompt('');
      setShowSelection(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
  
  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddReference(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const getDimensions = () => {
    switch(aspectRatio) {
      case '1:1': return { w: 500, h: 500, labelW: 1080, labelH: 1080 };
      case '16:9': return { w: 640, h: 360, labelW: 1920, labelH: 1080 };
      case '4:5': return { w: 400, h: 500, labelW: 1080, labelH: 1350 };
      case '9:16': 
      default: return { w: 360, h: 640, labelW: 1080, labelH: 1920 };
    }
  };

  const dims = getDimensions();

  // Auto-fit logic
  useEffect(() => {
    const calculateFitZoom = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const availableWidth = clientWidth - 60;
        const availableHeight = clientHeight - 120;

        if (availableWidth > 0 && availableHeight > 0) {
          const scaleW = availableWidth / dims.w;
          const scaleH = availableHeight / dims.h;
          const fitZoom = Math.min(scaleW, scaleH) * 0.9;
          setZoom(Math.max(0.1, fitZoom));
        }
      }
    };
    calculateFitZoom();
    window.addEventListener('resize', calculateFitZoom);
    return () => window.removeEventListener('resize', calculateFitZoom);
  }, [dims.w, dims.h]); 

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showSelection) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSelection({ x: selection.x, y: selection.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      // Convert pixel delta to percentage delta based on the Scaled Image dimensions
      // The image width/height are dims.w/dims.h * zoom
      const currentWidth = dims.w * zoom;
      const currentHeight = dims.h * zoom;

      const dxPercent = (dx / currentWidth) * 100;
      const dyPercent = (dy / currentHeight) * 100;

      setSelection({
        ...selection,
        x: Math.max(0, Math.min(100 - selection.w, initialSelection.x + dxPercent)),
        y: Math.max(0, Math.min(100 - selection.h, initialSelection.y + dyPercent))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse up listener to catch drags that leave the box
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  return (
    <main 
      ref={containerRef} 
      className="flex-1 bg-app-bg relative flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-panel-bg border-b border-border-ui flex items-center px-4 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Square size={14} className="text-text-muted fill-text-muted" />
            <span className="text-xs text-text-muted">Fill: <span className="text-white ml-1">None</span></span>
          </div>
          <div className="flex items-center gap-2">
            <BoxSelect size={14} className="text-text-muted" />
            <span className="text-xs text-text-muted">Stroke: <span className="text-white ml-1">1px</span></span>
          </div>
          <div className="w-px h-4 bg-border-ui"></div>
          <span className="text-xs text-text-muted">W: <span className="text-white">{dims.labelW}px</span></span>
          <span className="text-xs text-text-muted">H: <span className="text-white">{dims.labelH}px</span></span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="size-6 flex items-center justify-center rounded hover:bg-white/10 text-text-muted hover:text-white" title="Undo">
            <Undo2 size={14} />
          </button>
          <button className="size-6 flex items-center justify-center rounded hover:bg-white/10 text-text-muted hover:text-white" title="Redo">
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        className="relative shadow-2xl transition-all duration-300 ease-out origin-center group border border-[#333]"
        style={{ 
          transform: `scale(${zoom})`,
          width: `${dims.w}px`, 
          height: `${dims.h}px`
        }}
      >
        <div className={`w-full h-full bg-white relative overflow-hidden select-none flex items-center justify-center ${activeImage ? 'bg-transparent' : 'bg-[#1a1a1a]'}`}>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-3 text-text-muted">
              <Loader2 size={32} className="animate-spin text-primary" />
              <span className="text-xs">Processing...</span>
            </div>
          ) : activeImage ? (
            <img 
              className="w-full h-full object-contain pointer-events-none" 
              src={activeImage.url}
              alt={activeImage.prompt}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-text-muted/30">
              <ImageIcon size={48} />
              <span className="text-xs max-w-[150px] text-center">Select options on the left and click Generate</span>
            </div>
          )}

          {/* Functional Selection Box */}
          {activeImage && !isGenerating && showSelection && (
            <div 
              className="absolute border border-primary bg-primary/10 cursor-move group/box z-20"
              style={{
                top: `${selection.y}%`,
                left: `${selection.x}%`,
                width: `${selection.w}%`,
                height: `${selection.h}%`
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Corner Handles */}
              <div className="absolute -top-[3px] -left-[3px] size-1.5 bg-white border border-primary"></div>
              <div className="absolute -top-[3px] -right-[3px] size-1.5 bg-white border border-primary"></div>
              <div className="absolute -bottom-[3px] -left-[3px] size-1.5 bg-white border border-primary"></div>
              <div className="absolute -bottom-[3px] -right-[3px] size-1.5 bg-white border border-primary"></div>
              
              {/* Dimensions Tag */}
              <div className="absolute -top-6 left-0 bg-primary text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover/box:opacity-100 transition-opacity whitespace-nowrap">
                Selection Region
              </div>

              {/* Close Selection Button */}
              <div 
                 onClick={(e) => { e.stopPropagation(); setShowSelection(false); }}
                 className="absolute -top-2 -right-2 size-4 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500 shadow-sm"
              >
                <X size={10} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="absolute bottom-8 w-[800px] max-w-[95%] flex items-center gap-1 bg-panel-header px-2 py-1.5 rounded shadow-lg border border-border-ui z-10">
        
        {/* Toggle Selection Tool */}
        <button 
           onClick={() => activeImage && setShowSelection(!showSelection)}
           className={`p-1.5 rounded transition-colors flex flex-col items-center group relative ${showSelection ? 'bg-primary text-white' : 'hover:bg-white/10 text-text-muted hover:text-white'}`}
           title="Select Region"
           disabled={!activeImage}
        >
          <BoxSelect size={18} />
          {/* Tooltip */}
          <span className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
             Select Region
          </span>
        </button>

        <div className="w-px h-5 bg-border-ui mx-1"></div>

        {/* Upload Reference Button (Replacing UserPlus and ScanLine) */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-white/10 text-text-muted hover:text-white transition-colors flex flex-col items-center group relative"
          title="Upload Reference"
        >
          <ImagePlus size={18} />
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*"
            onChange={handleReferenceUpload} 
          />
           {/* Tooltip */}
           <span className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
             Add Reference
          </span>
        </button>

        <div className="w-px h-5 bg-border-ui mx-1"></div>
        
        {/* Expanded Input Field */}
        <input 
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
          className="bg-input-bg border border-border-ui rounded px-2 py-1 text-xs text-white flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-neutral-500" 
          placeholder={
            !activeImage 
              ? "Enter prompt to generate..." 
              : showSelection 
                ? "Describe how to refine the selected area..." 
                : "Describe how to refine this image..."
          }
          type="text"
          disabled={!activeImage && !editPrompt} 
        />
        
        <button 
          onClick={handleEditSubmit}
          className={`px-3 py-1 bg-primary text-white text-xs font-medium rounded transition-colors shadow-sm flex items-center gap-1.5 ${(!editPrompt) || isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={!editPrompt || isGenerating}
        >
          {isGenerating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : activeImage ? (
            <Wand2 size={12} />
          ) : (
             <Sparkles size={12} />
          )}
          {activeImage ? (showSelection ? 'Refine Selection' : 'Refine') : 'Generate'}
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 text-text-muted bg-panel-bg/80 backdrop-blur rounded px-2 py-1 text-xs border border-border-ui">
        <button 
          onClick={handleZoomOut}
          className="cursor-pointer hover:text-white flex items-center justify-center size-4"
        >
          <Minus size={12} />
        </button>
        <span className="w-8 text-center select-none">{Math.round(zoom * 100)}%</span>
        <button 
          onClick={handleZoomIn}
          className="cursor-pointer hover:text-white flex items-center justify-center size-4"
        >
          <Plus size={12} />
        </button>
      </div>
    </main>
  );
};

export default CanvasArea;