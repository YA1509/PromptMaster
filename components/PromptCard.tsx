
import React, { useState } from 'react';
import { ScenePrompts } from '../types';
import { editSceneImage } from '../services/geminiService';

interface PromptCardProps {
  scene: ScenePrompts;
  activeCharacterImage?: string;
  onImageUpdate: (sceneNumber: number, newImageUrl: string) => void;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`ml-auto text-xs font-bold px-2 py-1 rounded transition-colors ${
        copied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-comic-accent text-slate-200'
      }`}
    >
      {copied ? '¡COPIADO!' : 'COPIAR'}
    </button>
  );
};

export const PromptCard: React.FC<PromptCardProps> = ({ scene, activeCharacterImage, onImageUpdate }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleEditImage = async () => {
      if (!scene.generatedImageUrl || !editPrompt.trim()) return;
      setIsEditing(true);
      setEditError(null);
      try {
          const newImage = await editSceneImage(scene.generatedImageUrl, editPrompt);
          onImageUpdate(scene.sceneNumber, newImage);
          setEditPrompt('');
      } catch (e: any) {
          setEditError("Error al editar: " + e.message);
      } finally {
          setIsEditing(false);
      }
  };

  return (
    <div className="bg-comic-panel border-l-4 border-comic-accent p-6 mb-6 rounded-r-lg shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-comic-accent text-white font-display text-4xl px-4 py-2 opacity-20 select-none">
        {scene.sceneNumber}
      </div>
      
      <h3 className="text-2xl font-display text-white mb-6 flex items-center">
        ESCENA {scene.sceneNumber}
        <span className="ml-4 h-px bg-slate-600 flex-grow"></span>
      </h3>

      {/* --- GENERATED IMAGE DISPLAY --- */}
      <div className="mb-6 bg-black rounded-lg overflow-hidden border-2 border-slate-700 relative min-h-[200px] flex items-center justify-center">
          {scene.isGeneratingImage ? (
              <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-comic-accent border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs text-comic-accent font-bold animate-pulse">GENERANDO IMAGEN...</span>
                  <span className="text-[10px] text-slate-500">(Gemini 2.5 Flash Image)</span>
              </div>
          ) : scene.generatedImageUrl ? (
              <div className="relative w-full group">
                  <img src={scene.generatedImageUrl} alt={`Scene ${scene.sceneNumber}`} className="w-full h-auto object-cover" />
                  
                  {/* EDIT OVERLAY */}
                  <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            placeholder="Ej: Añadir filtro retro, quitar fondo..."
                            className="flex-grow bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 focus:border-comic-accent outline-none"
                            disabled={isEditing}
                          />
                          <button 
                             onClick={handleEditImage}
                             disabled={isEditing || !editPrompt}
                             className={`text-xs font-bold px-3 rounded ${isEditing ? 'bg-slate-600' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
                          >
                             {isEditing ? '...' : 'EDITAR'}
                          </button>
                      </div>
                      {editError && <p className="text-[10px] text-red-400 mt-1">{editError}</p>}
                  </div>
              </div>
          ) : (
              <div className="text-slate-600 text-xs font-mono">ESPERANDO GENERACIÓN...</div>
          )}
      </div>

      {scene.meta && (
        <div className="flex gap-2 mb-4">
             <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
                POSE: {scene.meta.pose}
             </span>
             <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">
                CAM: {scene.meta.camera}
             </span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Image Prompt */}
        <div className="bg-slate-900/50 p-4 rounded border border-slate-700 relative">
            <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-comic-accent font-bold text-sm tracking-wider uppercase">Prompt de Imagen</span>
                </div>
                <CopyButton text={scene.imagePrompt} />
            </div>
          <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.imagePrompt}</p>
        </div>

        {/* Grok Animation Prompt */}
        <div className="bg-gray-900 p-4 rounded border border-gray-600 relative shadow-inner">
            <div className="flex items-center mb-2 justify-between">
                <span className="text-white font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Prompt Animación GROK / X-AI
                </span>
                <CopyButton text={scene.grokPrompt || "Prompt no disponible"} />
            </div>
            <p className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.grokPrompt}</p>
        </div>

        {/* Video Prompt */}
        <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
            <div className="flex items-center mb-2">
                <span className="text-purple-400 font-bold text-sm tracking-wider uppercase">Prompt Video Veo 3.1</span>
                 <CopyButton text={scene.videoPrompt} />
            </div>
          <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.videoPrompt}</p>
        </div>
      </div>
    </div>
  );
};
