
import React, { useState, useEffect, useRef } from 'react';
import { generateComicPrompts, generateCharacterReferenceImage, generateSceneImage } from './services/geminiService';
import { ComicGenResult, CharacterProfile, IntensityLevel, RealismLevel, ComicEffect, MasterStyle, ClothingType, ClothingColor, ClothingBrand, AspectRatio, DetectedCharacter } from './types';
import { PromptCard } from './components/PromptCard';
import { ThumbnailCard } from './components/ThumbnailCard';

// Función para generar URLs de avatares REALISTAS (Foto Real)
const getAvatarUrl = (id: string, description: string, seed: number) => {
  const shortDesc = description.split(',').slice(0, 3).join(' ');
  // Use 'cinematic portrait' instead of 'fitness portrait' for generic usage
  const prompt = encodeURIComponent(
    `cinematic portrait of ${shortDesc}, dramatic lighting, 8k, facing camera, photorealistic`
  );
  return `https://image.pollinations.ai/prompt/${prompt}?width=300&height=300&seed=${seed + 555}&nologo=true&model=flux`;
};

// --- BASE DE DATOS FITNESS (FITNESS_CHARACTER_DB) ---
const FITNESS_CHARACTER_DB_RAW: CharacterProfile[] = [
  { id: 'hooded_hero', name: 'Hooded Hero', category: 'hooded', styleMode: 'heroic', visualDescription: 'Young aesthetic bodybuilder, sleeveless grey hoodie, sharp jawline, defined abs, vascular arms, modern gym.', imageUrl: '' },
  { id: 'fitbro_casual', name: 'FitBro Casual', category: 'real_male', styleMode: 'realistic', visualDescription: 'Young man 25yo, gaining muscle, simple gym tshirt, shorts, messy hair, casual lifter.', imageUrl: '' },
  { id: 'powerlifter_heavy', name: 'PowerLifter Heavy', category: 'real_male', styleMode: 'realistic', visualDescription: 'Robust man, 110kg, full beard, maximum strength look, powerlifting belt, intense focus.', imageUrl: '' },
  { id: 'slim_tone', name: 'Slim-Tone Guy', category: 'real_male', styleMode: 'realistic', visualDescription: 'Skinny defined guy, recreational gym goer, tank top, wired headphones, youthful.', imageUrl: '' },
  { id: 'trainer_pro', name: 'Trainer Pro', category: 'real_male', styleMode: 'realistic', visualDescription: 'Personal trainer, professional look, polo shirt, stopwatch, clean cut, confident.', imageUrl: '' },
  { id: 'guy_next_door', name: 'Guy Next Door', category: 'real_male', styleMode: 'realistic', visualDescription: 'Average guy, 3 days a week, normal t-shirt, sweating, authentic effort.', imageUrl: '' },
  { id: 'office_worker', name: 'Office Worker Fit', category: 'real_male', styleMode: 'realistic', visualDescription: 'Office employee, glasses, slight belly but trying, health focus, sensible gear.', imageUrl: '' },
  { id: 'calisthenics_guy', name: 'Calisthenics Guy', category: 'real_male', styleMode: 'realistic', visualDescription: 'Bodyweight athlete, shirtless, park setting, defined back, natural physique.', imageUrl: '' },
  { id: 'runner_woman', name: 'Runner Woman', category: 'real_female', styleMode: 'realistic', visualDescription: 'Runner physique, lean legs, smartwatch, sweatband, cardio focus.', imageUrl: '' },
  { id: 'dad_fitness', name: 'Dad Fitness', category: 'real_male', styleMode: 'realistic', visualDescription: 'Dad 40s, busy life, efficient workout, old school gym clothes, tired but strong.', imageUrl: '' },
  { id: 'senior_warrior', name: 'Senior Warrior', category: 'real_male', styleMode: 'realistic', visualDescription: 'Man 60yo, old school strength, grey hair, towel around neck, respected.', imageUrl: '' },
  { id: 'fitgirl_casual', name: 'FitGirl Casual', category: 'real_female', styleMode: 'realistic', visualDescription: 'Normal girl, glute and abs focus, matching set, ponytail, focused expression.', imageUrl: '' },
  { id: 'strong_woman', name: 'Strong Woman', category: 'real_female', styleMode: 'realistic', visualDescription: 'Naturally strong woman, not bodybuilder but solid, functional training gear, intense.', imageUrl: '' },
  { id: 'yoga_pilates', name: 'Yoga Pilates', category: 'real_female', styleMode: 'realistic', visualDescription: 'Flexible athletic woman, neutral clothing, barefoot or socks, calm energy.', imageUrl: '' },
  { id: 'beginner_girl', name: 'Gym Beginner Girl', category: 'real_female', styleMode: 'realistic', visualDescription: 'Shy beginner, oversized t-shirt, learning machines, motivated but hesitant.', imageUrl: '' },
  { id: 'senior_lady', name: 'Senior Fit Lady', category: 'real_female', styleMode: 'realistic', visualDescription: 'Lady 60yo, active aging, light dumbbells, smile, comfortable clothes.', imageUrl: '' },
];

// --- BASE DE DATOS PSICOLOGÍA & CIENCIA (PSYCH_CHARACTER_DB) ---
// Optimizado para estilos virales: Neuro-Futurista, Cerebro 3D, Real Emocional.
// Mas hombres que mujeres.
const PSYCH_CHARACTER_DB_RAW: CharacterProfile[] = [
    // MEN (Science / Authority)
    { id: 'prof_atlas', name: 'Prof. Atlas', category: 'real_male', styleMode: 'realistic', visualDescription: 'Distinguished neuroscientist, 55yo, silver beard, glasses, turtleneck, intense intellectual gaze, academic setting.', imageUrl: '' },
    { id: 'dr_nexus', name: 'Dr. Nexus', category: 'real_male', styleMode: 'realistic', visualDescription: 'Futurist visionary, 35yo, sharp suit, tech-savvy look, clean shaven, confident, ted talk vibes.', imageUrl: '' },
    { id: 'the_analyst', name: 'The Analyst', category: 'real_male', styleMode: 'realistic', visualDescription: 'Data scientist, 30yo, hoodie and blazer mix, focused, working with holograms, analytical.', imageUrl: '' },
    { id: 'old_sage', name: 'The Sage', category: 'real_male', styleMode: 'realistic', visualDescription: 'Wise old man, 75yo, deep wrinkles, kind eyes, simple linen clothes, timeless wisdom.', imageUrl: '' },
    { id: 'bio_hacker', name: 'Bio-Hacker', category: 'real_male', styleMode: 'realistic', visualDescription: 'Edgy researcher, 28yo, tattoos, lab coat over streetwear, intense, cyberpunk vibes.', imageUrl: '' },
    
    // MEN (Subjects / Emotional)
    { id: 'man_anxiety', name: 'The Anxious Mind', category: 'real_male', styleMode: 'realistic', visualDescription: 'Average man, 30s, tired eyes, slightly disheveled, expression of worry, relatable.', imageUrl: '' },
    { id: 'man_depressed', name: 'The Silent Sufferer', category: 'real_male', styleMode: 'realistic', visualDescription: 'Man in shadows, 40s, looking down, somber atmosphere, emotional weight.', imageUrl: '' },
    { id: 'man_focus', name: 'The Focused One', category: 'real_male', styleMode: 'realistic', visualDescription: 'Man in flow state, 25yo, eyes locked on goal, determination, mental clarity.', imageUrl: '' },
    { id: 'man_chaos', name: 'The Chaos Mind', category: 'real_male', styleMode: 'realistic', visualDescription: 'Man gripping head, overwhelmed, 35yo, business casual, mental noise visible.', imageUrl: '' },
    { id: 'man_awakening', name: 'The Awakened', category: 'real_male', styleMode: 'realistic', visualDescription: 'Man looking up at light, realization, peace, 30yo, clean look, mental breakthrough.', imageUrl: '' },
    { id: 'everyman_joe', name: 'Everyman Joe', category: 'real_male', styleMode: 'realistic', visualDescription: 'Generic approachable male, 35yo, plaid shirt, neutral expression, blank slate for projection.', imageUrl: '' },
    { id: 'student_stress', name: 'Stressed Student', category: 'real_male', styleMode: 'realistic', visualDescription: 'Young student, 20yo, library background, tired, studying hard, mental fatigue.', imageUrl: '' },
    { id: 'corp_burnout', name: 'Corporate Burnout', category: 'real_male', styleMode: 'realistic', visualDescription: 'Businessman, loosened tie, exhausted, city night background, high stress.', imageUrl: '' },
    { id: 'stoic_man', name: 'The Stoic', category: 'real_male', styleMode: 'realistic', visualDescription: 'Strong jaw, unreadable expression, calm amidst chaos, black t-shirt, disciplined.', imageUrl: '' },
    { id: 'father_figure', name: 'Father Figure', category: 'real_male', styleMode: 'realistic', visualDescription: 'Protective father, 40s, warm sweater, kind but firm, emotional anchor.', imageUrl: '' },

    // WOMEN (Science / Emotional)
    { id: 'dr_nova', name: 'Dr. Nova', category: 'real_female', styleMode: 'realistic', visualDescription: 'Lead researcher, 35yo, sharp bob cut, lab coat, piercing intelligence, professional.', imageUrl: '' },
    { id: 'psych_empath', name: 'The Empath', category: 'real_female', styleMode: 'realistic', visualDescription: 'Therapist look, 40s, warm cardigan, listening intently, soft lighting, compassionate.', imageUrl: '' },
    { id: 'woman_anxiety', name: 'Anxious Thoughts', category: 'real_female', styleMode: 'realistic', visualDescription: 'Woman biting lip, nervous energy, 25yo, relatable struggle, mental noise.', imageUrl: '' },
    { id: 'woman_clarity', name: 'Mental Clarity', category: 'real_female', styleMode: 'realistic', visualDescription: 'Woman breathing deep, eyes closed, peaceful, yoga vibe, mental health success.', imageUrl: '' },
    { id: 'corp_woman', name: 'Corporate climber', category: 'real_female', styleMode: 'realistic', visualDescription: 'Professional woman, suit, high stakes environment, focused, ambitious.', imageUrl: '' },

    // ABSTRACT / CONCEPTUAL
    { id: 'silhouette_man', name: 'The Shadow Self', category: 'real_male', styleMode: 'realistic', visualDescription: 'Backlit silhouette of a man, mystery, subconscious mind, unknown identity.', imageUrl: '' },
    { id: 'brain_avatar', name: 'Human Connectome', category: 'hooded', styleMode: 'heroic', visualDescription: 'Humanoid figure made of glowing optical fibers, neural network avatar, no face, pure mind.', imageUrl: '' },
];

// Initialize DBs with Avatar URLs
const FITNESS_DB = FITNESS_CHARACTER_DB_RAW.map((char, index) => ({
  ...char,
  imageUrl: getAvatarUrl(char.id, char.visualDescription, index)
}));

const PSYCH_DB = PSYCH_CHARACTER_DB_RAW.map((char, index) => ({
  ...char,
  imageUrl: getAvatarUrl(char.id, char.visualDescription, index + 50)
}));

const getCategoryLabel = (category: string) => {
  if (category === 'hooded' || category === 'nonHooded') return 'AVATAR';
  if (category === 'real_male') return 'HOMBRE';
  if (category === 'real_female') return 'MUJER';
  return 'OTRO';
};

// --- VISUAL CLOTHING MAP ---
const CLOTHING_VISUALS: Record<ClothingType, { icon: string, label: string }> = {
    'tank_top': { icon: '🎽', label: 'Musculosa' },
    'compression': { icon: '🥋', label: 'Compresión' },
    't_shirt': { icon: '👕', label: 'Camiseta' },
    'shirtless': { icon: '💪', label: 'Sin Camiseta' },
    'hoodie_sleeveless': { icon: '🧥', label: 'Hoodie s/M' },
    'hoodie_full': { icon: '🧢', label: 'Hoodie' },
    'sports_bra': { icon: '👚', label: 'Top' },
    'crop_top': { icon: '👚', label: 'Crop Top' },
};

const COMPLEX_STYLES: MasterStyle[] = ['anatomical', 'vector', '3d_render', 'neuro_futurist', 'bio_minimalist', 'brain_3d', 'scientific_illustration', 'real_emotional', 'ai_cinematic'];

// Helper to determine if a style is Psychology/Science based
const isPsychStyle = (style: MasterStyle) => {
    return ['neuro_futurist', 'bio_minimalist', 'brain_3d', 'scientific_illustration', 'real_emotional', 'ai_cinematic'].includes(style);
};

const App: React.FC = () => {
  const [script, setScript] = useState(() => localStorage.getItem('pm_script') || '');
  
  // Phase 5: Configuración Óptima por Defecto
  const [masterStyle, setMasterStyle] = useState<MasterStyle>('anatomical'); 
  
  // Determine active DB based on Master Style
  const activeDB = isPsychStyle(masterStyle) ? PSYCH_DB : FITNESS_DB;
  
  // Initialize charId safely
  const [selectedCharId, setSelectedCharId] = useState(() => {
      const saved = localStorage.getItem('pm_charId');
      // Verify if saved char exists in ANY db, if not default to first of active
      return saved || activeDB[0].id;
  });

  // Ensure selected character is valid when switching styles
  useEffect(() => {
     const exists = activeDB.find(c => c.id === selectedCharId);
     if (!exists) {
         setSelectedCharId(activeDB[0].id);
     }
  }, [masterStyle, activeDB]);

  const [intensity, setIntensity] = useState<IntensityLevel>('medium');
  const [realism, setRealism] = useState<RealismLevel>('stylized');
  const [effect, setEffect] = useState<ComicEffect>('none');
  const [duration, setDuration] = useState<number>(8);
  const [isSequence, setIsSequence] = useState<boolean>(false);
  
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // Clothing State
  const [clothingType, setClothingType] = useState<ClothingType>('tank_top');
  const [clothingColor, setClothingColor] = useState<ClothingColor>('black');
  const [clothingBrand, setClothingBrand] = useState<ClothingBrand>('generic');
  const [isBarefoot, setIsBarefoot] = useState<boolean>(false);

  const [result, setResult] = useState<ComicGenResult | null>(() => {
    try {
        const saved = localStorage.getItem('pm_result');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [productionStage, setProductionStage] = useState<'IDLE' | 'ANALYSIS' | 'CASTING' | 'FILMING' | 'DONE'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Derived state to check if we are in a complex mode (now mostly true for all styles as we want chars in all)
  const isComplexMode = true; 

  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);

  // SAFE STORAGE EFFECT
  useEffect(() => {
    try {
      localStorage.setItem('pm_script', script);
      localStorage.setItem('pm_charId', selectedCharId);
      
      if (result) {
        const storageResult = {
            ...result,
            detectedCharacters: result.detectedCharacters?.map(c => ({
                ...c,
                referenceImageUrl: undefined 
            })),
            scenes: result.scenes.map(s => ({
                ...s,
                generatedImageUrl: null, 
                isGeneratingImage: false
            }))
        };
        localStorage.setItem('pm_result', JSON.stringify(storageResult));
      } else {
        localStorage.removeItem('pm_result');
      }
    } catch (e) {
        console.warn("LocalStorage Error (Quota Exceeded):", e);
        try {
            localStorage.removeItem('pm_result');
        } catch(err) {}
    }
  }, [script, selectedCharId, result]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCharacter = activeDB.find(c => c.id === selectedCharId) || activeDB[0];

  const handleCharacterSelect = (charId: string) => {
    setSelectedCharId(charId);
    setIsDropdownOpen(false);
  };

  const handleClearAll = () => {
      setScript('');
      setResult(null);
      setError(null);
      setProductionStage('IDLE');
      localStorage.removeItem('pm_script');
      localStorage.removeItem('pm_result');
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- PHASE 3: AUTOMATIC SCENE GENERATION WITH REFERENCES ---
  const executeFilmingPhase = async (castResult: ComicGenResult) => {
    if (!isMounted.current) return;
    setProductionStage('FILMING');
    setResult(castResult);

    let currentScenes = [...castResult.scenes];
    
    for (let i = 0; i < currentScenes.length; i++) {
        if (!isMounted.current) break;
        if (i > 0) await wait(4000);

        currentScenes[i] = { ...currentScenes[i], isGeneratingImage: true };
        setResult({ ...castResult, scenes: [...currentScenes] });

        try {
            let referenceImage: string | undefined = undefined;
            const sceneChars = currentScenes[i].charactersInScene || [];
            
            if (sceneChars.length > 0 && castResult.detectedCharacters) {
                const protagonist = castResult.detectedCharacters.find(c => c.role === 'protagonist' && sceneChars.includes(c.name));
                const secondary = castResult.detectedCharacters.find(c => sceneChars.includes(c.name));
                const foundChar = protagonist || secondary;
                
                if (foundChar && foundChar.referenceImageUrl) {
                    referenceImage = foundChar.referenceImageUrl;
                }
            }

            const imageUrl = await generateSceneImage(
                currentScenes[i].imagePrompt, 
                aspectRatio,
                referenceImage
            );
            
            currentScenes[i] = { 
                ...currentScenes[i], 
                generatedImageUrl: imageUrl, 
                isGeneratingImage: false 
            };
        } catch (error) {
            console.error(`Error generating image for scene ${i+1}`, error);
            currentScenes[i] = { ...currentScenes[i], isGeneratingImage: false };
        }

        setResult({ ...castResult, scenes: [...currentScenes] });
    }
    
    setProductionStage('DONE');
    setLoading(false);
  };

  // --- PHASE 2: CASTING (GENERATE REFERENCES) ---
  const executeCastingPhase = async (analysisResult: ComicGenResult) => {
      if (!isMounted.current) return;
      setProductionStage('CASTING');
      setResult(analysisResult);

      const detectedChars = analysisResult.detectedCharacters || [];
      const updatedChars: DetectedCharacter[] = [];

      for (let i = 0; i < detectedChars.length; i++) {
          const char = detectedChars[i];
          if (!isMounted.current) break;
          if (i > 0) await wait(4000);

          try {
              const refUrl = await generateCharacterReferenceImage(char.name, char.description, {
                  masterStyle,
                  intensity,
                  realism,
                  effect,
                  aspectRatio,
                  video: { duration, fps: 30, isSequence },
                  clothing: { type: clothingType, color: clothingColor, brand: clothingBrand, isBarefoot }
              });
              updatedChars.push({ ...char, referenceImageUrl: refUrl });
              
          } catch (e: any) {
              console.error(`Failed to cast ${char.name}`, e);
              updatedChars.push({ ...char, castingError: true }); 
          }

          setResult({
            ...analysisResult,
            detectedCharacters: [...updatedChars, ...detectedChars.slice(updatedChars.length)]
          });
      }

      const castResult = { ...analysisResult, detectedCharacters: updatedChars };
      executeFilmingPhase(castResult);
  };

  // --- PHASE 1: ANALYSIS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;
    setLoading(true);
    setProductionStage('ANALYSIS');
    setError(null);
    setResult(null);

    try {
      // PASS availableCharacters to options so Gemini can choose from them in Psych mode
      const analysisData = await generateComicPrompts(script, activeCharacter, { 
          masterStyle, 
          intensity, 
          realism, 
          effect,
          aspectRatio,
          video: {
              duration,
              fps: 30,
              isSequence
          },
          clothing: {
            type: clothingType,
            color: clothingColor,
            brand: clothingBrand,
            isBarefoot
          },
          availableCharacters: activeDB 
      });
      
      if (isMounted.current) {
        // AUTO-SELECT CHARACTER IF SUGGESTED (Psychology Mode)
        if (analysisData.suggestedAvatarId) {
            setSelectedCharId(analysisData.suggestedAvatarId);
            // We do NOT stop execution, we continue to casting. 
            // The scene prompts generated by Gemini already use the description of suggestedAvatarId
            // because of the System Instruction logic.
        }

        executeCastingPhase(analysisData);
      }
    } catch (err: any) {
      if (isMounted.current) {
          setError(err.message || "Error al analizar el guion.");
          setLoading(false);
          setProductionStage('IDLE');
      }
    }
  };

  const handleImageUpdate = (sceneNumber: number, newImageUrl: string) => {
      if (!result) return;
      const updatedScenes = result.scenes.map(s => 
          s.sceneNumber === sceneNumber ? { ...s, generatedImageUrl: newImageUrl } : s
      );
      setResult({ ...result, scenes: updatedScenes });
  };

  const getBackgroundClass = () => {
      if (masterStyle === 'vector' || masterStyle === 'neuro_futurist') return 'bg-[#1a0f2e]';
      if (masterStyle === '3d_render' || masterStyle === 'brain_3d') return 'bg-[#0f172a]';
      if (masterStyle === 'bio_minimalist' || masterStyle === 'scientific_illustration') return 'bg-slate-900';
      return 'bg-slate-950';
  };

  const getHeaderTitle = () => {
      if (isPsychStyle(masterStyle)) return 'PSYCHOLOGY EDITION';
      return 'FITNESS EDITION';
  };

  const getStatusMessage = () => {
      switch (productionStage) {
          case 'ANALYSIS': return "LEYENDO GUION & DESGLOSANDO ESCENAS...";
          case 'CASTING': return "GENERANDO FOTOGRAMAS DE CASTING (PACING ACTIVADO)...";
          case 'FILMING': return "RODANDO ESCENAS EN 35MM (PACING ACTIVADO)...";
          case 'DONE': return "PRODUCCIÓN COMPLETADA.";
          default: return "";
      }
  };

  // Helper to safely handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
     const target = e.target as HTMLImageElement;
     target.onerror = null; // Prevent infinite loop
     // Fallback to a solid color div with initial
     target.style.display = 'none';
     if (target.parentElement) {
         const fallback = document.createElement('div');
         fallback.className = "w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xl";
         fallback.innerText = "?";
         target.parentElement.appendChild(fallback);
     }
  };

  return (
    <div className={`min-h-screen text-slate-200 selection:bg-comic-accent selection:text-white pb-20 font-sans transition-colors duration-500 ${getBackgroundClass()}`}>
      <header className="bg-comic-dark border-b border-comic-accent/30 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center font-display text-xl text-white italic comic-shadow transform rotate-3">X</div>
             <div>
                <h1 className="font-display text-2xl tracking-tighter text-white leading-none">
                  PROMPTMASTER <span className="text-comic-accent">{getHeaderTitle()}</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                    {masterStyle.replace(/_/g, ' ')}
                </p>
             </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleClearAll} className="text-[10px] font-bold text-red-400 hover:text-red-300 border border-red-900/50 bg-red-950/30 px-3 py-1.5 rounded uppercase tracking-wider">
               Limpiar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <section className="mb-10 text-center">
             <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight uppercase">
                ESTILO <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">{masterStyle.replace(/_/g, ' ')}</span>
             </h2>
             <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                 Sistema de producción cinematográfica: Guion -> Casting -> Rodaje.
             </p>
        </section>

        {/* --- STYLE SELECTOR DROPDOWN --- */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-8 max-w-2xl mx-auto shadow-lg backdrop-blur">
             <label className="block text-comic-accent font-bold text-xs uppercase tracking-widest mb-2 text-center">SELECCIONAR ESTILO MAESTRO</label>
             <div className="relative">
                 <select 
                    value={masterStyle}
                    onChange={(e) => setMasterStyle(e.target.value as MasterStyle)}
                    className="w-full bg-slate-800 text-white font-display text-lg py-3 px-4 rounded-lg border border-slate-600 focus:border-comic-accent outline-none appearance-none cursor-pointer uppercase text-center tracking-wide"
                 >
                    <optgroup label="FITNESS & ANATOMÍA (COMPLETO)">
                        <option value="anatomical">FITNESS ANATÓMICO CÓMIC</option>
                        <option value="vector">VECTOR FITNESS COMIC</option>
                        <option value="3d_render">3D MÉDICO HIPERREALISTA</option>
                    </optgroup>
                    <optgroup label="PSICOLOGÍA & CIENCIA (VIRAL)">
                        <option value="neuro_futurist">NEURO-FUTURISTA (POTENTE)</option>
                        <option value="bio_minimalist">BIO-MENTE MINIMALISTA</option>
                        <option value="brain_3d">CEREBRO 3D REALISTA</option>
                        <option value="scientific_illustration">ILUSTRACIÓN CIENTÍFICA</option>
                        <option value="real_emotional">REAL-HUMANO EMOCIONAL</option>
                        <option value="ai_cinematic">IA CINEMÁTICA (PSIQUE)</option>
                    </optgroup>
                 </select>
             </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT COLUMN: CONFIGURATION --- */}
          {/* Always show character selector now, but content changes */}
          <div className="w-full lg:w-1/3 relative z-40" ref={dropdownRef}>
            
            {/* 1. CHARACTER SELECTOR */}
            <>
                <label className="block text-comic-accent font-bold text-xs uppercase tracking-widest mb-2 ml-1">
                    {isPsychStyle(masterStyle) ? '1. PERSONAJE (SELECCIÓN AUTOMÁTICA O MANUAL)' : '1. PERSONAJE BASE'}
                </label>
                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-slate-900 border-2 border-slate-700 hover:border-comic-accent rounded-xl p-3 cursor-pointer transition-all duration-300 flex items-center gap-4 group shadow-2xl relative overflow-hidden mb-6">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-500 group-hover:border-comic-accent relative flex-shrink-0 z-10 shadow-lg bg-slate-800">
                        <img src={activeCharacter.imageUrl} alt={activeCharacter.name} className="w-full h-full object-cover" loading="eager" onError={handleImageError} />
                    </div>
                    <div className="flex-grow z-10">
                        <h3 className="font-display text-xl text-white group-hover:text-comic-accent transition-colors tracking-tight">{activeCharacter.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-orange-900/50 border-orange-500/50 text-orange-200">
                                {getCategoryLabel(activeCharacter.category)}
                            </span>
                        </div>
                    </div>
                </div>

                {isDropdownOpen && (
                    <div className="absolute top-24 left-0 w-full mt-2 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar animate-fade-in-up z-50">
                        <div className="p-2 space-y-1">
                            {activeDB.map((char) => (
                            <button key={char.id} onClick={() => handleCharacterSelect(char.id)} className={`w-full flex items-center gap-4 p-2 rounded-lg transition-all text-left group border-b border-slate-800 last:border-0 ${selectedCharId === char.id ? 'bg-slate-800 border-comic-accent/50' : 'hover:bg-slate-800/50'}`}>
                                <div className="w-12 h-12 rounded border border-slate-600 overflow-hidden relative flex-shrink-0 bg-black">
                                    <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" loading="lazy" onError={handleImageError} />
                                </div>
                                <div className="overflow-hidden">
                                    <div className={`font-display text-base leading-none ${selectedCharId === char.id ? 'text-comic-accent' : 'text-slate-300 group-hover:text-white'}`}>{char.name}</div>
                                </div>
                            </button>
                            ))}
                        </div>
                    </div>
                )}
            </>
            
            {/* 3. CLOTHING SECTION - Only show for fitness/realistic styles where clothing matters heavily */}
            {/* We keep it for now but user can ignore in Psych mode if needed */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-4 mb-6">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">3. VESTIMENTA Y MARCA</h4>
                <button 
                    onClick={() => setIsBarefoot(!isBarefoot)}
                    className={`text-[9px] font-bold px-2 py-1 rounded border transition-colors ${isBarefoot ? 'bg-blue-600 text-white border-blue-400' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'}`}
                >
                    {isBarefoot ? '🦶 DESCALZO' : '👟 CON ZAPATILLAS'}
                </button>
                </div>
                
                {/* Type - VISUAL GRID SELECTOR */}
                <div className={isBarefoot ? 'opacity-50 pointer-events-none' : ''}>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">TIPO DE PRENDA (SPORT)</label>
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(CLOTHING_VISUALS).map(([key, {icon, label}]) => (
                        <button
                            key={key}
                            onClick={() => setClothingType(key as ClothingType)}
                            className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${clothingType === key ? 'bg-slate-700 border-comic-accent text-white shadow-lg scale-105' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                        >
                            <span className="text-xl mb-1">{icon}</span>
                            <span className="text-[9px] font-bold uppercase leading-none text-center">{label}</span>
                        </button>
                    ))}
                </div>
                </div>

                {/* Color */}
                <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">COLOR PRINCIPAL</label>
                <select 
                    value={clothingColor} 
                    onChange={(e) => setClothingColor(e.target.value as ClothingColor)}
                    className="w-full bg-slate-800 text-slate-300 text-xs p-2 rounded border border-slate-700 focus:border-comic-accent outline-none font-bold uppercase"
                >
                    <option value="black">Negro</option>
                    <option value="white">Blanco</option>
                    <option value="grey">Gris</option>
                    <option value="red">Rojo</option>
                    <option value="blue">Azul</option>
                    <option value="green">Verde</option>
                </select>
                </div>
            </div>

          </div>

          {/* Prompt Generation Form & Results */}
          <div className="w-full lg:w-2/3">
             
             {/* FORMAT CONTROLS */}
             <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-4 backdrop-blur shadow-lg">
                 <div>
                     <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">RELACIÓN DE ASPECTO</label>
                     <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                        className="w-full bg-slate-800 text-white text-sm py-2 px-3 rounded border border-slate-600 focus:border-comic-accent outline-none"
                     >
                         <option value="9:16">9:16 (Stories/Reels)</option>
                         <option value="16:9">16:9 (Cinematic)</option>
                         <option value="1:1">1:1 (Square)</option>
                     </select>
                 </div>
             </div>

             <form onSubmit={handleSubmit} className="bg-comic-panel p-1 rounded-xl shadow-2xl border border-slate-700 mb-8 relative z-10">
                <textarea
                  className="w-full h-32 bg-slate-900 text-slate-100 p-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-comic-accent resize-none font-mono text-sm leading-relaxed placeholder-slate-600"
                  placeholder="ESCRIBE TU GUION AQUÍ. El sistema detectará personajes, creará referencias visuales y generará la película..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  disabled={loading}
                />
                <div className="p-3 bg-slate-800 rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-yellow-400' : 'bg-green-500'}`}></span>
                        {loading ? getStatusMessage() : 'SISTEMA LISTO'}
                    </div>
                    <button type="submit" disabled={loading || !script.trim()} className={`w-full sm:w-auto font-display uppercase text-lg px-8 py-3 rounded transform transition-all duration-200 ${loading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white comic-shadow hover:-translate-y-1'}`}>
                        {loading ? 'PRODUCIENDO...' : 'COMENZAR RODAJE (3 FASES)'}
                    </button>
                </div>
              </form>

              {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg flex items-center gap-3 text-sm font-bold animate-pulse">
                   {error}
                </div>
              )}

              {result && (
                <div className="animate-fade-in-up space-y-8">
                  
                  {/* --- NEW: DETECTED CHARACTERS (CASTING SHEET) --- */}
                  {result.detectedCharacters && result.detectedCharacters.length > 0 && (
                      <div className="bg-slate-900/80 border-2 border-indigo-500/50 rounded-xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                              FASE 2: CASTING
                          </div>
                          <h3 className="text-xl font-display text-white mb-4">REPARTO CONFIRMADO (REFERENCIAS VISUALES)</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {result.detectedCharacters.map((char, idx) => (
                                  <div key={idx} className="group relative">
                                      <div className={`aspect-[9/16] bg-black rounded-lg overflow-hidden border relative ${char.castingError ? 'border-red-500' : 'border-slate-700'}`}>
                                          {char.referenceImageUrl ? (
                                              <img src={char.referenceImageUrl} alt={char.name} className="w-full h-full object-cover" />
                                          ) : char.castingError ? (
                                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-red-400 text-center p-2">
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                   <span className="text-[10px] font-bold">ERROR GENERACIÓN (429)</span>
                                              </div>
                                          ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                              </div>
                                          )}
                                          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2 pt-8">
                                              <p className="text-white font-bold text-sm leading-none">{char.name}</p>
                                              <p className="text-[10px] text-indigo-300 uppercase font-bold">{char.role}</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* --- SCENES --- */}
                  <div className="space-y-8">
                      {result.scenes?.map((scene, index) => (
                          <PromptCard 
                            key={`${scene.sceneNumber}-${index}`} 
                            scene={scene} 
                            activeCharacterImage={undefined} 
                            onImageUpdate={handleImageUpdate}
                          />
                      ))}
                  </div>

                  {result.thumbnail && (
                      <ThumbnailCard 
                        data={result.thumbnail} 
                        niche={isPsychStyle(masterStyle) ? 'Psychology' : 'Fitness'} 
                      />
                  )}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
