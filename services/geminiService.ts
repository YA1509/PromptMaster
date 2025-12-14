
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComicGenResult, CharacterProfile, ComicGenOptions, AspectRatio } from "../types";

// --- SEGMENTATION & CONTINUITY ENGINE (PACE-MAKER V3) ---
const SEGMENTATION_RULES = `
📏 MOTOR DE SEGMENTACIÓN CINEMÁTICA (REGLA DE ORO) 📏
1. RITMO OBLIGATORIO (72-80 CARACTERES):
   - CRÍTICO: El guion debe fragmentarse estrictamente cada 75 caracteres aproximadamente.
   - CÁLCULO MANDATORIO: Math.ceil(Total_Caracteres / 75) = Número de Escenas.
   - NO RESUMAS. Fragmenta el guion secuencialmente y genera un KEYFRAME (Imagen) para cada fragmento.
`;

// --- DIRECTOR'S MANIFESTO (STRICT STORYTELLING UPDATE) ---
const DIRECTOR_RULES = `
🎬 ROL: ERES UN DIRECTOR DE CINE OBSESIONADO CON LA NARRATIVA (STORYTELLING FIRST).
TU MISIÓN: Transformar el guion en una PELÍCULA DE 35MM.

REGLAS DE ORO (FIDELIDAD ABSOLUTA):
1. **CASTING AUTOMÁTICO**: Identifica al PROTAGONISTA y a los PERSONAJES SECUNDARIOS del texto.
2. **FIDELIDAD AL TEXTO**: La imagen debe representar *EXACTAMENTE* la acción descrita.
3. **SOLO HUMANOS**: El personaje principal es HUMANO. Está PROHIBIDO generar animales, mascotas o criaturas (salvo que el guion lo exija explícitamente).
4. **ESTÉTICA 35MM**: Todo debe parecer filmado en película Kodak Portra 400 o Kodak Vision3. Grano fílmico real.
5. **CONTINUIDAD**: En cada escena, lista qué personajes aparecen (por nombre) para que el motor de renderizado use sus referencias visuales.
`;

const THUMBNAIL_PSYCH_RULES = `
🖼️ PROTOCOLO DE MINIATURA (SOLO NEURO-FUTURISTA) 🖼️
⚠️ REGLA SUPREMA: Para la MINIATURA, usa estilo "NEURO-FUTURISTA".
   - CONCEPTO: Un cerebro humano hecho de luz/fibra óptica, o una silueta humana conteniendo una galaxia mental.
   - ATMÓSFERA: Fondo negro absoluto ("Void"). Elementos neón Cian/Magenta.
   - TEXTOS (HOOKS): 3 frases de "Disonancia Cognitiva" (ej: "Tu Mente Miente").
`;

const THUMBNAIL_FITNESS_RULES = `
🖼️ PROTOCOLO DE MINIATURA (FITNESS IMPACT) 🖼️
⚠️ REGLA SUPREMA: Optimizado para CTR. Estilo "HIGH-CONTRAST YOUTUBE FITNESS".
   - COMPOSICIÓN: "Split Screen" (Antes/Después) o "Macro Error Focus".
   - ELEMENTOS: Flechas Rojas (Pain/Error), Checks Verdes (Correct).
   - TEXTOS (HOOKS): Urgencia, Dolor o Solución Rápida.
`;

// --- CINEMATIC STYLE ENGINES ---
const ANATOMICAL_STYLE_BASE = "Cinematic Shot on 35mm Film. Kodak Vision3 500T. Arri Alexa LF. Color Grading: Teal & Orange, High Contrast.";
const ANATOMICAL_MANDATORY_ANATOMY = "Natural skin texture, film grain, realistic sweat, pores visible, cinematic depth of field.";
const ANATOMICAL_MANDATORY_LIGHTING = "CINEMATIC LIGHTING: Rembrandt lighting, Volumetric haze, Bokeh background.";

// OTHER STYLES (Keep existing logic but enforce 35mm feel where applicable)
const VECTOR_STYLE_BASE = "High-End Medical Motion Graphics Style. Flat design but with depth layers. Clean, surgical, precise. 4k Resolution Vector Art.";
const RENDER_3D_STYLE_BASE = "Photorealistic 3D Render. Unreal Engine 5 Lumen Global Illumination. Metahuman Creator Quality. 8k Texture Resolution.";

const PSYCH_STYLES = {
  neuro_futurist: {
    name: "Neuro-Futurista",
    visuals: "Sci-Fi Thriller Aesthetic. Dark Void. Bioluminescent neural fibers.",
    keywords: "Cinematic Macro Shot, Depth of Field f/1.2, Bokeh, Neon Cyan and Magenta, Fiber Optics, 8k Resolution."
  },
  bio_minimalist: {
    name: "Bio-Mente Minimalista",
    visuals: "High-End Tech Commercial Aesthetic. Apple/Braun design. Clean, white/grey studio lighting.",
    keywords: "Soft Box Lighting, Studio Photography, Infinite White Background, Minimalist Composition, Sharp Focus."
  },
  brain_3d: {
    name: "Cerebro 3D Realista",
    visuals: "Medical Documentary Cinema. Inside the human body. Wet, organic.",
    keywords: "Macro Probe Lens, Fluid Simulation, Organic Textures, Golden Light inside dark cavities."
  },
  scientific_illustration: {
    name: "Ilustración Científica Moderna",
    visuals: "Educational YouTube Channel Art. Flat but dimensional.",
    keywords: "Vector Art, Isometric View, Clean Lines, Infographic Aesthetic, Symmetry."
  },
  real_emotional: {
    name: "Real-Humano Emocional",
    visuals: "Indie Drama Movie Aesthetic. A24 Films style. Raw, gritty, emotional.",
    keywords: "35mm Film Grain, Kodak Portra 400, Natural Lighting, Emotional Close-up, Handheld Camera feel."
  },
  ai_cinematic: {
    name: "IA Cinemático (Psique Profunda)",
    visuals: "Mind-Bending Sci-Fi (Inception/Interstellar). Surreal landscapes.",
    keywords: "Wide Angle 16mm lens, Double Exposure, Volumetric Fog, God Rays, Surrealism, Dreamcore."
  }
};

const formatClothingPrompt = (clothing: ComicGenOptions['clothing']) => {
  const label = clothing.type.replace(/_/g, ' ');
  const color = clothing.color.replace(/_/g, ' ');
  const brand = clothing.brand === 'generic' ? 'No Logo' : `${clothing.brand.toUpperCase()} brand logo`;
  const footwear = clothing.isBarefoot ? 'Barefoot (no shoes)' : 'wearing Jordan brand low-top sneakers';
  return `Wearing ${color} ${label}, ${brand} style sports gear, ${footwear}`;
};

const getSystemInstruction = (character: CharacterProfile, options: ComicGenOptions) => {
  const clothingPromptBase = formatClothingPrompt(options.clothing);
  const style = options.masterStyle;
  const isPsychMode = style in PSYCH_STYLES;

  // Build Available Character List string for context
  let characterListString = "";
  if (options.availableCharacters && options.availableCharacters.length > 0) {
      characterListString = options.availableCharacters.map(c => 
          `- ID: "${c.id}" | Name: "${c.name}" | Desc: "${c.visualDescription}"`
      ).join("\n");
  }

  // BASE INSTRUCTION
  let baseInstruction = `
${DIRECTOR_RULES}

ESTILO VISUAL MAESTRO SELECCIONADO: "${options.masterStyle.toUpperCase()}".
⚠️ CRÍTICO: CADA prompt de escena debe comenzar explícitamente con "${options.masterStyle} style".
PROTAGONISTA INPUT (Usuario): ${character.name}, ${character.visualDescription}.
VESTUARIO SUGERIDO: ${clothingPromptBase}.

${SEGMENTATION_RULES}
`;

  // STYLE SPECIFIC LOGIC
  if (isPsychMode) {
     // @ts-ignore
     const psych = PSYCH_STYLES[style];
     baseInstruction += `
     \n${THUMBNAIL_PSYCH_RULES}
     \nESTILO VISUAL: ${psych.visuals}
     \nKEYWORDS: ${psych.keywords}
     \n
     \n🤖 PROTOCOLO DE CASTING AUTOMÁTICO (SOLO PARA ESTILO PSICOLOGÍA):
     \nLa aplicación te provee una lista de AVATARES DISPONIBLES.
     \nTU TAREA:
     \n1. Analiza el guion del usuario.
     \n2. Compara el tono y protagonista del guion con la lista de "AVATARES DISPONIBLES" abajo.
     \n3. SELECCIONA el ID del avatar que mejor encaje (ej: si es una historia triste, elige 'man_depressed'; si es científica, 'prof_atlas').
     \n4. Escribe el ID seleccionado en el campo "suggestedAvatarId" del JSON.
     \n5. USA la descripción visual de ese avatar elegido para generar todos los prompts de las escenas.
     \n
     \nLISTA DE AVATARES DISPONIBLES:
     \n${characterListString}
     `;
  } else {
     baseInstruction += `
     \n${THUMBNAIL_FITNESS_RULES}
     \nESTILO VISUAL: ${ANATOMICAL_STYLE_BASE}
     \nTECH: ${ANATOMICAL_MANDATORY_ANATOMY}
     `;
  }

  return baseInstruction + `
\n🏗️ INSTRUCCIONES DE SALIDA (JSON) 🏗️
1. **suggestedAvatarId**: (Solo en modo Psicología) El ID exacto del avatar elegido de la lista. Si es modo Fitness, déjalo null.
2. **DETECTED CHARACTERS**: Analiza el guion.
   - En modo Psicología: El "protagonista" debe tener la descripción visual del "suggestedAvatarId" elegido.
3. **SCENES**: Para cada escena, lista en 'charactersInScene' los nombres exactos de los personajes que aparecen.
4. **PROMPTS**:
   - EL PROMPT DEBE EMPEZAR CON: "${options.masterStyle.replace(/_/g, ' ')} style, cinematic shot..."
   - Usa lenguaje de cine (35mm, shot type).
   - NEGATIVE PROMPT: animals, furry, zoo, creatures (a menos que el guion lo exija).

GENERA EL JSON.
`;
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    thumbnail: {
      type: Type.OBJECT,
      properties: {
        imagePrompt: { type: Type.STRING },
        titleText: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["imagePrompt", "titleText"]
    },
    suggestedAvatarId: { type: Type.STRING, description: "The ID of the character selected from the provided list." },
    detectedCharacters: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                role: { type: Type.STRING, enum: ['protagonist', 'secondary', 'villain'] }
            },
            required: ["name", "description", "role"]
        }
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        sceneCount: { type: Type.STRING },
        mainActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        emotionalTone: { type: Type.STRING },
        physicalDynamic: { type: Type.STRING }
      },
      required: ["sceneCount", "mainActions", "emotionalTone", "physicalDynamic"]
    },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.INTEGER },
          imagePrompt: { type: Type.STRING },
          grokPrompt: { type: Type.STRING }, 
          animationPrompt: { type: Type.STRING },
          videoPrompt: { type: Type.STRING },
          charactersInScene: { type: Type.ARRAY, items: { type: Type.STRING } },
          meta: {
            type: Type.OBJECT,
            properties: {
              duration: { type: Type.STRING },
              camera: { type: Type.STRING },
              pose: { type: Type.STRING }
            }
          }
        },
        required: ["sceneNumber", "imagePrompt", "grokPrompt", "animationPrompt", "videoPrompt", "meta", "charactersInScene"]
      }
    },
    optimizationNotes: { type: Type.STRING }
  },
  required: ["thumbnail", "analysis", "scenes", "optimizationNotes", "detectedCharacters"]
};

// --- IMAGE GENERATION FOR SCENES (GEMINI 2.5 FLASH IMAGE) ---
// UPDATED: Now accepts an optional referenceImageBase64 to enforce character consistency
export const generateSceneImage = async (prompt: string, aspectRatio: AspectRatio, referenceImageBase64?: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key is missing.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Enforce NO ANIMALS in the generation phase as well
    const safePrompt = `${prompt} . Cinematic 35mm film still, shot on Kodak Vision3. Highly detailed, photorealistic. NEGATIVE PROMPT: animals, zoo, furry, wolf, tiger, dog, cat, creature, non-human, distorted text, watermark, cartoon, sketch`;

    const parts: any[] = [];
    
    // IF REFERENCE EXISTS, INJECT IT (Image-to-Image / Structure Reference)
    if (referenceImageBase64) {
        // Strip header if present to get raw data
        const cleanBase64 = referenceImageBase64.split(',')[1] || referenceImageBase64;
        parts.push({
            inlineData: {
                mimeType: 'image/png',
                data: cleanBase64
            }
        });
    }

    parts.push({ text: safePrompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: { parts: parts },
            config: {
                imageConfig: { 
                    aspectRatio: aspectRatio
                }
            }
        });

        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image data returned.");
    } catch (error: any) {
        console.error("Gemini Image Gen Error:", error);
        throw new Error(error.message || "Image generation failed");
    }
};

export const editSceneImage = async (base64Image: string, editPrompt: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key is missing.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: editPrompt }
                ]
            }
        });
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No edited image data returned.");
    } catch (error: any) {
        console.error("Gemini Image Edit Error:", error);
        throw new Error(error.message || "Image edit failed");
    }
};

// GENERATE REFERENCE IMAGE (CASTING)
export const generateCharacterReferenceImage = async (characterName: string, description: string, options: ComicGenOptions): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const clothingPrompt = formatClothingPrompt(options.clothing);

  // 35mm FILM STYLE PROMPT FOR REFERENCE
  let imagePrompt = `
  Cinematic 35mm film character portrait of ${characterName}, ${description}. 
  Wearing: ${clothingPrompt}. 
  Shot on Kodak Portra 400. Neutral background studio lighting. 
  Hyper-realistic, film grain, detailed skin texture. 
  NEGATIVE PROMPT: text, typography, letters, watermark, bad anatomy, animals, dog, cat, wolf, tiger, furry, creature, cartoon, illustration.
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: imagePrompt }] },
          config: {
              imageConfig: { 
                  aspectRatio: "9:16" // Portrait for character cards
              }
          }
      });

      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              }
          }
      }
      throw new Error("Gemini Image generation failed.");

  } catch (error: any) {
      console.error("Reference Image Gen Error:", error);
      throw new Error("No se pudo generar la imagen de referencia. " + (error.message || ""));
  }
};

export const generateComicPrompts = async (script: string, character: CharacterProfile, options: ComicGenOptions): Promise<ComicGenResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", 
      contents: `GUION: ${script}`,
      config: {
        systemInstruction: getSystemInstruction(character, options),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: {
            thinkingBudget: 32768, 
        },
      },
    });

    if (!response.text) {
        throw new Error("No response text received from Gemini.");
    }

    const jsonResponse = JSON.parse(response.text) as ComicGenResult;
    return jsonResponse;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
