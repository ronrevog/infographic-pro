import React, { useRef, useState } from 'react';
import { 
  ChevronDown, 
  Upload, 
  Mic, 
  Smartphone, 
  Square, 
  Monitor,
  Layout, 
  Plus,
  ImagePlus,
  Sparkles,
  Loader2,
  X,
  Save,
  Bookmark
} from 'lucide-react';
import { AspectRatio, Preset } from '../App';

// Cap based on Gemini 3 Pro practical limits for reference/context images
const MAX_REF_IMAGES = 3;

interface LeftPanelProps {
  prompt: string;
  setPrompt: (val: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (val: AspectRatio) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  referenceImages: string[];
  setReferenceImages: (imgs: string[]) => void;
  presets: Preset[];
  setPresets: (presets: Preset[]) => void;
}

const PanelSection: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  action?: React.ReactNode 
}> = ({ title, children, action }) => (
  <div className="border-b border-border-ui">
    <div className="bg-panel-header px-3 py-2 flex justify-between items-center cursor-default group hover:bg-[#383838] transition-colors">
      <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#b0b0b0]">{title}</span>
      {action ? action : <ChevronDown size={14} className="text-text-muted" />}
    </div>
    <div className="p-3">
      {children}
    </div>
  </div>
);

const LeftPanel: React.FC<LeftPanelProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  onGenerate,
  isGenerating,
  referenceImages,
  setReferenceImages,
  presets,
  setPresets
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (referenceImages.length >= MAX_REF_IMAGES) {
      alert(`Maximum ${MAX_REF_IMAGES} reference images allowed.`);
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages([...referenceImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  const removeReference = (index: number) => {
    const newRefs = [...referenceImages];
    newRefs.splice(index, 1);
    setReferenceImages(newRefs);
  };

  const savePreset = () => {
    if (!newPresetName.trim()) return;
    setPresets([...presets, { name: newPresetName, images: [...referenceImages] }]);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  return (
    <aside className="w-80 flex flex-col border-r border-border-ui bg-panel-bg shrink-0 h-full overflow-hidden text-sm z-10">
      <div className="flex-1 overflow-y-auto">
        
        {/* Infographic Direction */}
        <PanelSection title="Infographic Direction">
          <div className="relative group">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full h-24 bg-input-bg text-text-main text-xs rounded border border-border-ui p-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none placeholder:text-neutral-600 font-mono" 
              placeholder="Describe your infographic topic (e.g., 'Benefits of drinking water', 'Social Media Trends 2024')..."
            />
            <div className="flex justify-end gap-1 mt-1.5">
              <button className="px-2 py-1 rounded bg-active-item border border-border-ui hover:border-gray-500 text-text-muted hover:text-white text-xs flex items-center gap-1 transition-colors">
                <Upload size={12} />
                <span className="text-[10px]">Doc</span>
              </button>
              <button className="px-2 py-1 rounded bg-active-item border border-border-ui hover:border-gray-500 text-text-muted hover:text-white text-xs flex items-center gap-1 transition-colors">
                <Mic size={12} />
                <span className="text-[10px]">Voice</span>
              </button>
            </div>
          </div>
        </PanelSection>

        {/* Format */}
        <PanelSection title="Format">
          <div className="grid grid-cols-4 gap-1">
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded border transition-all ${aspectRatio === '9:16' ? 'bg-primary/20 border-primary text-white' : 'bg-active-item border-border-ui text-text-muted hover:bg-white/10 hover:text-white'}`}
            >
              <Smartphone size={16} />
              <span className="text-[10px] font-medium">9:16</span>
            </button>
            <button 
              onClick={() => setAspectRatio('1:1')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded border transition-all ${aspectRatio === '1:1' ? 'bg-primary/20 border-primary text-white' : 'bg-active-item border-border-ui text-text-muted hover:bg-white/10 hover:text-white'}`}
            >
              <Square size={16} />
              <span className="text-[10px] font-medium">1:1</span>
            </button>
            <button 
              onClick={() => setAspectRatio('16:9')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded border transition-all ${aspectRatio === '16:9' ? 'bg-primary/20 border-primary text-white' : 'bg-active-item border-border-ui text-text-muted hover:bg-white/10 hover:text-white'}`}
            >
              <Monitor size={16} />
              <span className="text-[10px] font-medium">16:9</span>
            </button>
            <button 
              onClick={() => setAspectRatio('4:5')}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded border transition-all ${aspectRatio === '4:5' ? 'bg-primary/20 border-primary text-white' : 'bg-active-item border-border-ui text-text-muted hover:bg-white/10 hover:text-white'}`}
            >
              <Layout size={16} />
              <span className="text-[10px] font-medium">4:5</span>
            </button>
          </div>
        </PanelSection>

        {/* Reference Images */}
        <PanelSection 
          title={`Reference Images (${referenceImages.length}/${MAX_REF_IMAGES})`}
          action={
            <Plus 
              size={14} 
              className={`text-text-muted cursor-pointer hover:text-white ${referenceImages.length >= MAX_REF_IMAGES ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => referenceImages.length < MAX_REF_IMAGES && fileInputRef.current?.click()}
            />
          }
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="grid grid-cols-3 gap-2">
            {referenceImages.map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded bg-cover bg-center border border-border-ui" style={{ backgroundImage: `url('${img}')` }}>
                <button 
                  onClick={() => removeReference(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            
            {referenceImages.length < MAX_REF_IMAGES && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded bg-active-item border border-dashed border-border-ui flex flex-col items-center justify-center text-[10px] text-text-muted/50 p-2 text-center cursor-pointer hover:border-text-muted hover:bg-white/5 transition-colors"
              >
                <ImagePlus size={16} className="mb-1 opacity-50" />
                <span>Add Ref</span>
              </div>
            )}
          </div>
          
          {referenceImages.length > 0 && !isSavingPreset && (
             <button 
              onClick={() => setIsSavingPreset(true)}
              className="mt-3 w-full py-1.5 text-xs border border-border-ui rounded text-text-muted hover:text-white hover:bg-active-item transition-colors flex items-center justify-center gap-2"
             >
               <Save size={12} /> Save as Style Preset
             </button>
          )}

          {isSavingPreset && (
            <div className="mt-3 flex gap-2">
              <input 
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Preset Name"
                className="flex-1 bg-input-bg border border-border-ui rounded px-2 py-1 text-xs focus:border-primary focus:outline-none"
              />
              <button onClick={savePreset} disabled={!newPresetName} className="text-primary hover:text-blue-400 disabled:opacity-50">
                <Save size={14} />
              </button>
              <button onClick={() => setIsSavingPreset(false)} className="text-text-muted hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
        </PanelSection>

        {/* Saved Presets */}
        <PanelSection title="Saved Presets">
           {presets.length === 0 ? (
             <div className="text-center py-4 text-text-muted opacity-50 text-xs">
               No presets saved yet. <br/> Add references to create one.
             </div>
           ) : (
             <div className="flex flex-col gap-2">
               {presets.map((preset, idx) => {
                 const isActive = referenceImages.length === preset.images.length && 
                                  referenceImages.every((img, i) => img === preset.images[i]);
                 return (
                   <div 
                     key={idx}
                     onClick={() => setReferenceImages([...preset.images])}
                     className={`flex items-center gap-3 p-2 rounded border cursor-pointer group transition-all ${
                       isActive 
                         ? 'bg-primary/20 border-primary' 
                         : 'bg-active-item border-transparent hover:border-border-ui'
                     }`}
                   >
                      <Bookmark size={14} className={isActive ? "text-primary fill-primary" : "text-primary"} />
                      <span className={`text-xs flex-1 ${isActive ? "text-white font-medium" : "text-text-main"}`}>{preset.name}</span>
                      <span className={`text-[10px] ${isActive ? "text-white/70" : "text-text-muted"}`}>{preset.images.length} refs</span>
                   </div>
                 );
               })}
             </div>
           )}
        </PanelSection>

      </div>

      <div className="p-3 border-t border-border-ui bg-panel-bg">
        <button 
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-2 text-white rounded text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all group ${isGenerating || !prompt.trim() ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'}`}
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:animate-pulse" />}
          {isGenerating ? 'Generating...' : 'Generate Infographic'}
        </button>
        <div className="mt-2 flex justify-between text-[10px] text-text-muted px-1">
          <span>Gemini 3 Pro</span>
          <span>Nano Banana Pro</span>
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel;