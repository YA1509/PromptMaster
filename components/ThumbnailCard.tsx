
import React from 'react';
import { ThumbnailData } from '../types';

interface ThumbnailCardProps {
  data: ThumbnailData;
  niche: 'Fitness' | 'Psychology';
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
      className={`ml-auto text-xs font-bold px-3 py-1.5 rounded transition-colors ${
        copied ? 'bg-green-600 text-white' : 'bg-slate-700 hover:bg-white hover:text-black text-slate-200'
      }`}
    >
      {copied ? '¡COPIADO!' : 'COPIAR'}
    </button>
  );
};

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ data, niche }) => {
  return (
    <div className={`mb-8 border-4 rounded-lg overflow-hidden shadow-2xl relative ${niche === 'Psychology' ? 'border-purple-500 bg-[#1a0f2e]' : 'border-red-600 bg-slate-900'}`}>
      {/* HEADER */}
      <div className={`px-6 py-3 flex justify-between items-center ${niche === 'Psychology' ? 'bg-purple-900/80' : 'bg-red-900/80'}`}>
        <div className="flex items-center gap-3">
            <span className="text-3xl">{niche === 'Psychology' ? '🧠' : '🔥'}</span>
            <div>
                <h3 className="text-white font-display text-xl uppercase tracking-tighter leading-none">
                    MINIATURA VIRAL
                </h3>
                <p className="text-[10px] text-white/70 font-mono uppercase tracking-widest">
                    OPTIMIZADO PARA: {niche === 'Psychology' ? 'ESTILO NEURO-FUTURISTA' : 'ESTILO FITNESS IMPACTO'}
                </p>
            </div>
        </div>
        <div className="bg-black/40 px-3 py-1 rounded text-xs font-bold text-white border border-white/20">
            PASO 0: CREAR PRIMERO
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* IMAGE PROMPT */}
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold uppercase tracking-wider ${niche === 'Psychology' ? 'text-purple-400' : 'text-red-400'}`}>
                    Prompt de Imagen (16:9)
                </span>
                <CopyButton text={data.imagePrompt} />
            </div>
            <div className="bg-black/50 p-4 rounded border border-slate-700/50">
                <p className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{data.imagePrompt}</p>
            </div>
        </div>

        {/* TEXT OPTIONS */}
        <div>
            <span className={`block text-sm font-bold uppercase tracking-wider mb-3 ${niche === 'Psychology' ? 'text-cyan-400' : 'text-yellow-400'}`}>
                Textos para Miniatura (Hooks)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.titleText?.map((text, idx) => (
                    <div key={idx} className="bg-slate-800 p-3 rounded border border-slate-600 hover:border-white transition-colors group relative">
                        <p className="text-center font-display text-xl text-white mb-2 leading-tight">"{text}"</p>
                        <button 
                            onClick={() => navigator.clipboard.writeText(text)}
                            className="w-full text-[10px] uppercase font-bold text-slate-500 group-hover:text-white text-center mt-2 py-1 bg-black/20 rounded hover:bg-white/20 transition-colors"
                        >
                            Copiar Texto
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
