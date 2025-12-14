
export interface SceneAnalysis {
  sceneCount: string;
  mainActions: string[];
  emotionalTone: string;
  physicalDynamic: string;
}

export interface DetectedCharacter {
  name: string;
  description: string;
  role: 'protagonist' | 'secondary' | 'villain';
  referenceImageUrl?: string; // Generated reference image
  castingError?: boolean; // New: Flag for failed generation
}

export interface ScenePrompts {
  sceneNumber: number;
  imagePrompt: string;
  grokPrompt: string;
  animationPrompt: string;
  videoPrompt: string;
  generatedImageUrl?: string | null; // URL/Base64 of generated image
  isGeneratingImage?: boolean; // Loading state
  charactersInScene: string[]; // List of names appearing in this scene
  meta: {
    duration: string;
    camera: string;
    pose: string;
  };
}

export interface ThumbnailData {
  imagePrompt: string;
  titleText: string[];
}

export interface ComicGenResult {
  thumbnail: ThumbnailData;
  analysis: SceneAnalysis;
  detectedCharacters: DetectedCharacter[]; // New: List of characters found in script
  suggestedAvatarId?: string; // New: ID of the character automatically selected by AI
  scenes: ScenePrompts[];
  optimizationNotes: string;
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: ComicGenResult | null;
}

export type CharacterCategory = 'hooded' | 'nonHooded' | 'female' | 'real_male' | 'real_female';
export type StyleMode = 'heroic' | 'realistic';

export interface CharacterProfile {
  id: string;
  name: string;
  category: CharacterCategory;
  styleMode: StyleMode;
  imageUrl: string;
  visualDescription: string;
}

export type MasterStyle = 
  | 'anatomical' 
  | 'vector' 
  | '3d_render' 
  | 'neuro_futurist'
  | 'bio_minimalist'
  | 'brain_3d'
  | 'scientific_illustration'
  | 'real_emotional'
  | 'ai_cinematic';

export type IntensityLevel = 'soft' | 'medium' | 'intense';
export type RealismLevel = 'natural' | 'stylized' | 'hyper';
export type ComicEffect = 'none' | 'motion_blur' | 'kinetic_lines' | 'light_flash' | 'impact_lines';

export type ClothingType = 'shirtless' | 'tank_top' | 'compression' | 't_shirt' | 'hoodie_sleeveless' | 'hoodie_full' | 'sports_bra' | 'crop_top';
export type ClothingColor = 'black' | 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'grey' | 'neon_green' | 'neon_pink';
export type ClothingBrand = 'generic' | 'nike' | 'adidas' | 'under_armour' | 'gymshark' | 'puma' | 'reebok';

export interface VideoConfig {
  duration: number; // 4 to 12
  fps: number; // 30 default
  isSequence: boolean;
}

// New Types for Image Generation
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ComicGenOptions {
  masterStyle: MasterStyle;
  intensity: IntensityLevel;
  realism: RealismLevel;
  effect: ComicEffect;
  aspectRatio: AspectRatio;
  video: VideoConfig;
  clothing: {
    type: ClothingType;
    color: ClothingColor;
    brand: ClothingBrand;
    isBarefoot: boolean;
  };
  availableCharacters?: CharacterProfile[]; // New: List of characters for AI to choose from
}
