
import { GoogleGenAI } from "@google/genai";
import { GenerationSettings, StyleOption } from '../types';
import { CATEGORIES, GENDER_OPTIONS } from '../constants';

export const constructPrompt = (settings: GenerationSettings): string => {
  const getSelected = (catId: string): StyleOption | undefined => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return undefined;
    const optId = settings.selectedStyles[catId];
    const opt = cat.options.find(o => o.id === optId);
    return opt && opt.id !== 'none' ? opt : undefined;
  };

  const refs = settings.referenceImages;
  const blocks: Record<string, string[]> = {
    'main subject': [],
    'attributes': [],
    'style': [],
    'composition': [],
    'setting': [],
    'lighting': [],
    'render': []
  };

  // --- 1. Main Subject & Reference Handling ---
  if (refs.character) {
    blocks['main subject'].push("The exact person from the primary character reference image, maintaining 100% facial likeness, features, and identity");
  }

  const subjectOpt = getSelected('subject');
  if (subjectOpt && !refs.character) {
    blocks['main subject'].push(subjectOpt.promptValue || subjectOpt.name);
  } else if (!subjectOpt && !refs.character) {
    blocks['main subject'].push("a person");
  }

  if (settings.gender && !refs.character) {
    const genderLabel = GENDER_OPTIONS.find(g => g.id === settings.gender)?.value;
    if (genderLabel) blocks['main subject'].push(genderLabel);
  }

  // --- 2. Attributes (Hair, Clothing, Gear) ---
  ['hair_length', 'hair_color', 'hairstyle'].forEach(id => {
    const opt = getSelected(id);
    if (opt) blocks['attributes'].push(opt.promptValue || opt.name);
  });

  ['clothing', 'material', 'pattern', 'features', 'headwear', 'accessories'].forEach(id => {
    const opt = getSelected(id);
    if (opt) blocks['attributes'].push(opt.promptValue || opt.name);
  });

  if (refs.additional.length > 0) {
    blocks['attributes'].push("incorporating all visual elements, props, and details shown in the additional item reference images");
  }

  // --- 3. Style & Influence ---
  const styleOpt = getSelected('painters');
  if (styleOpt) {
    blocks['style'].push(styleOpt.promptValue || styleOpt.name);
  }

  // --- 4. Composition & Perspective ---
  ['camera_distance', 'camera_focus', 'camera_position'].forEach(id => {
    const opt = getSelected(id);
    if (opt) blocks['composition'].push(opt.promptValue || opt.name);
  });

  // --- 5. Background & Setting ---
  if (refs.background) {
    blocks['setting'].push("The exact environment, architecture, and background style shown in the provided background reference image");
  }

  // --- 6. Lighting & Atmosphere ---
  ['light_settings', 'light_sources'].forEach(id => {
    const opt = getSelected(id);
    if (opt) blocks['lighting'].push(opt.promptValue || opt.name);
  });

  // --- 7. Render & Quality Modifiers ---
  ['filters_colors', 'effects_fx'].forEach(id => {
    const opt = getSelected(id);
    if (opt) blocks['render'].push(opt.promptValue || opt.name);
  });

  // Constructing the final nested prompt string
  const finalParts: string[] = [];
  
  Object.entries(blocks).forEach(([key, values]) => {
    if (values.length > 0) {
      const uniqueValues = Array.from(new Set(values));
      finalParts.push(`(${key}: ${uniqueValues.join(', ')})`);
    }
  });

  return finalParts.join('\n');
};

export const generateImage = async (settings: GenerationSettings, overridePrompt?: string): Promise<{ imageUrl: string; prompt: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const finalPrompt = overridePrompt ?? constructPrompt(settings);
  const refs = settings.referenceImages;
  
  try {
    const config: any = {
      imageConfig: {
        aspectRatio: settings.aspectRatio,
      }
    };

    if (settings.model === 'gemini-3-pro-image-preview') {
      config.imageConfig.imageSize = settings.imageSize;
    }

    const contentsParts: any[] = [];
    
    if (refs.character) {
      const base64Data = refs.character.split(',')[1];
      contentsParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      contentsParts.push({ text: "Primary Identity Reference: Focus on the facial structure and likeness of the person in this image." });
    }

    if (refs.background) {
      const base64Data = refs.background.split(',')[1];
      contentsParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      contentsParts.push({ text: "Background/Setting Reference: Replicate the environment, style, and atmosphere of this image." });
    }

    if (refs.additional.length > 0) {
      refs.additional.forEach((img) => {
        const base64Data = img.split(',')[1];
        contentsParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      });
      contentsParts.push({ text: "Element/Props Reference: Use these images for specific items and visual details." });
    }

    contentsParts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model: settings.model,
      contents: { parts: contentsParts },
      config: config
    });

    let base64Image = '';
    if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                base64Image = part.inlineData.data;
                break;
            }
        }
    }

    if (!base64Image) {
        throw new Error("The model did not return any image data. Please check safety settings.");
    }

    return {
      imageUrl: `data:image/png;base64,${base64Image}`,
      prompt: finalPrompt
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("Requested entity was not found") || error.status === 404 || error.status === 403) {
        throw new Error("API_KEY_REQUIRED");
    }
    throw error;
  }
};
