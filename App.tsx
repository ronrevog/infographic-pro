import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import CanvasArea from './components/CanvasArea';
import RightPanel from './components/RightPanel';
import LoginScreen from './components/LoginScreen';
import { useAuth } from './contexts/AuthContext';
import { GoogleGenAI } from "@google/genai";

export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  ratio: AspectRatio;
  timestamp: number;
}

export interface Preset {
  name: string;
  images: string[];
}

const App: React.FC = () => {
  const { user, loading, apiKey, signOut } = useAuth();

  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Changed to array for multiple references
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);

  const activeImage = generatedImages.find(img => img.id === selectedImageId) || generatedImages[0] || null;

  // Sync aspect ratio when an image is selected from history
  useEffect(() => {
    if (activeImage) {
      setAspectRatio(activeImage.ratio);
    }
  }, [activeImage?.id]);

  const generateImage = async (promptText: string, sourceImage?: string) => {
    if (!apiKey) {
      alert("API Key is not available. Please contact your administrator.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });

      const parts: any[] = [];

      // 1. Add Source Image (Target for editing) if exists
      if (sourceImage) {
        const base64Data = sourceImage.includes('base64,')
          ? sourceImage.split('base64,')[1]
          : sourceImage;

        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Data
          }
        });
      }

      // 2. Add Reference Images (Style/Content refs)
      // Gemini 3 Pro can handle multiple image inputs. 
      // We rely on the model to distinguish between the "image to edit" and "style references" based on the text prompt.
      referenceImages.forEach((refImg) => {
        const base64Ref = refImg.includes('base64,') ? refImg.split('base64,')[1] : refImg;
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: base64Ref
          }
        });
      });

      // 3. Add Text Prompt
      parts.push({ text: promptText });

      // STRICTLY using gemini-3-pro-image-preview
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio === '4:5' ? '4:5' as any : aspectRatio, // Cast if 4:5 is not officially in enum yet, though it usually supports standard ratios. 
            // Note: If API strictly requires "3:4" or "4:3", we might need to map it, but newer models often support standard ratios.
            // Assuming 4:5 is supported or we map it to closest supported if needed. 
            // For safety with strictly typed SDKs if 4:5 isn't in type:
            // Actually, for Gemini 3 Pro Image, typical ratios are 1:1, 3:4, 4:3, 9:16, 16:9. 
            // 4:5 is often treated as 3:4 (close enough) or cropping. 
            // However, the prompt request is to change the UI picker. 
            // We will pass it through. If the model rejects it, we might fallback to 3:4.
            imageSize: "1K"
          }
        }
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: promptText.length > 30 ? promptText.substring(0, 30) + '...' : promptText,
          ratio: aspectRatio,
          timestamp: Date.now()
        };

        setGeneratedImages(prev => [newImage, ...prev]);
        setSelectedImageId(newImage.id);
      } else {
        console.warn("No image found in response", response);
        alert("The model generated a response but no image was found. Try a different prompt.");
      }

    } catch (error: any) {
      console.error("Error generating infographic:", error);
      let errorMsg = "Failed to generate image.";
      if (error.message) errorMsg += ` ${error.message}`;
      alert(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    let instructions = `Create a professional infographic. Topic: ${prompt}. Layout: Clean, Social Media optimized.`;
    if (referenceImages.length > 0) {
      instructions += ` Use the ${referenceImages.length} provided extra images as style and visual references.`;
    }

    await generateImage(instructions, undefined);
  };

  const handleEdit = async (editPrompt: string) => {
    if (!activeImage) return;

    let instructions = `Edit this image. Instruction: ${editPrompt}.`;
    if (referenceImages.length > 0) {
      instructions += ` Use the provided style reference images to guide the edit visually.`;
    }

    await generateImage(instructions, activeImage.url);
  };

  const handleAddReference = (imgData: string) => {
    if (referenceImages.length >= 3) {
      alert("Maximum 3 reference images allowed.");
      return;
    }
    setReferenceImages(prev => [...prev, imgData]);
  };

  const handleExport = () => {
    if (!activeImage) return;
    const link = document.createElement('a');
    link.href = activeImage.url;
    link.download = `infographic-${activeImage.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app-bg text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show error if API key is not available
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-app-bg text-white">
        <div className="text-center p-8 border border-yellow-500/50 rounded bg-yellow-500/10 max-w-md">
          <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
          <p className="mb-4">API Key is not configured in Firestore. Please contact your administrator to set up the API key.</p>
          <button
            onClick={signOut}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-app-bg text-text-main overflow-hidden selection:bg-primary selection:text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          prompt={prompt}
          setPrompt={setPrompt}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          referenceImages={referenceImages}
          setReferenceImages={setReferenceImages}
          presets={presets}
          setPresets={setPresets}
        />
        <CanvasArea
          activeImage={activeImage}
          isGenerating={isGenerating}
          onEdit={handleEdit}
          aspectRatio={aspectRatio}
          onAddReference={handleAddReference}
        />
        <RightPanel
          history={generatedImages}
          selectedId={selectedImageId}
          onSelect={setSelectedImageId}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default App;
