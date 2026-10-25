import axios from 'axios';
import fs from 'fs';

export const generateArtSpec = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(422).json({ message: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // High quality fallback specs
    const fallbacks = {
      bohemian: {
        gradient_start: '#fdfc47',
        gradient_end: '#240b36',
        primary_shape: 'sun',
        shape_color: '#d4af37',
        accent_shapes: [
          { shape: 'circle', x_pct: 30, y_pct: 40, size: 15, color: '#b58c5c' },
          { shape: 'stripes', x_pct: 50, y_pct: 70, size: 60, color: '#78350f' }
        ],
        typography: 'Solitude & Light',
        curated_font: 'serif',
        curated_frame: 'oak',
        palette_name: 'Bohemian Sunset Radiance',
        layout_description: 'Earthy warmth paired with rising sun geometry.',
        typography_recommendation: 'Serif font adds classical poetic character.'
      },
      minimal: {
        gradient_start: '#faf9f6',
        gradient_end: '#e5e5e0',
        primary_shape: 'arch',
        shape_color: '#1c1917',
        accent_shapes: [
          { shape: 'circle', x_pct: 70, y_pct: 30, size: 20, color: '#d4af37' }
        ],
        typography: 'Silence',
        curated_font: 'sans-serif',
        curated_frame: 'black',
        palette_name: 'Nordic Alabaster Monolith',
        layout_description: 'Pure architectural arches with balanced negative space.',
        typography_recommendation: 'Crisp sans-serif maintains modern quiet luxury.'
      },
      emerald: {
        gradient_start: '#064e3b',
        gradient_end: '#022c22',
        primary_shape: 'circle',
        shape_color: '#f5f5f4',
        accent_shapes: [
          { shape: 'arch', x_pct: 50, y_pct: 60, size: 45, color: '#d4af37' }
        ],
        typography: 'Royal Sanctuary',
        curated_font: 'fantasy',
        curated_frame: 'gold',
        palette_name: 'Botanical Velvet Deep Emerald',
        layout_description: 'Sumptuous deep forest hues punctuated by brushed gold.',
        typography_recommendation: 'Display letterforms reflect luxury sanctuary aesthetics.'
      }
    };

    const lowerPrompt = prompt.toLowerCase();
    let selectedSpec = fallbacks.minimal;
    if (lowerPrompt.includes('boho') || lowerPrompt.includes('bohemian') || lowerPrompt.includes('sun') || lowerPrompt.includes('earth')) {
      selectedSpec = fallbacks.bohemian;
    } else if (lowerPrompt.includes('emerald') || lowerPrompt.includes('green') || lowerPrompt.includes('velvet') || lowerPrompt.includes('luxury')) {
      selectedSpec = fallbacks.emerald;
    }

    let resultSpec = { ...selectedSpec };

    // Try Gemini API if key is present
    if (apiKey) {
      try {
        const systemInstruction = "You are a professional abstract graphic design engine for luxury canvas prints. You generate design specs in valid JSON format ONLY. Do not wrap JSON in Markdown code block quotes (e.g. do not use ```json). Response must start and end with curly brackets. IMPORTANT: Be highly creative, dynamic, and unpredictable with your color palettes, shape selections, and layout placements. Never output the same design twice.";
        const promptMessage = `Analyze this visual art design prompt: '${prompt}'. Generate a highly unique, unpredictable, and beautiful minimalist canvas print graphic design structure. Respond ONLY with a valid flat JSON block with keys: 'gradient_start' (hex color), 'gradient_end' (hex color), 'primary_shape' (one of: 'circle', 'arch', 'sun', 'mountain', 'stripes'), 'shape_color' (hex color), 'accent_shapes' (array of 1 to 3 objects with keys: 'shape', 'x_pct' (0-100), 'y_pct' (0-100), 'size' (10-50), 'color'), 'typography' (an elegant 2-4 word artistic quote matching the theme), 'curated_font' (one of: 'serif', 'sans-serif', 'fantasy', 'monospace'), 'curated_frame' (one of: 'gold', 'oak', 'black', 'none'), 'palette_name' (a creative name for the color scheme), 'layout_description' (a 2-sentence description of the visual layout), 'typography_recommendation' (a 1-sentence explanation of why the font was chosen).`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: `${systemInstruction}\n\n${promptMessage}` }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 1.3
            }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
        );

        const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```(?:json)?|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && typeof parsed === 'object') {
            resultSpec = parsed;
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Art Spec] Gemini API fallback triggered:', geminiErr.message);
      }
    }

    // Pre-fetch synthesized image via Pollinations AI to bypass browser CORS limitations
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' premium interior wallpaper decor art')}?width=800&height=1000&nologo=true&seed=${seed}`;
      
      const imgRes = await axios.get(pollinationsUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      if (imgRes.status === 200) {
        const base64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        resultSpec.synthesized_image_base64 = `data:image/jpeg;base64,${base64}`;
      }
    } catch (imgErr) {
      console.warn('[Pollinations AI] Image fetch error:', imgErr.message);
    }

    res.json({
      status: 'success',
      source: apiKey ? 'gemini_ai' : 'curation_engine_fallback',
      data: resultSpec
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const analyzeRoom = async (req, res) => {
  try {
    const { objective, room_scene } = req.body;
    const scene = room_scene || 'living';
    const apiKey = process.env.GEMINI_API_KEY;

    const fallbacks = {
      living: {
        harmony_analysis: "### Spatial Diagnostics: Living Room Lounge\n\nYour living room features a bright, sun-drenched configuration with high exposure. The existing walls present a neutral alabaster base. The key visual challenge is creating a focal anchor above low-profile seating to ground the gaze.\n\n* **Lighting Assessment:** Excellent soft natural light. High glare potential during mid-day suggests warm wood or golden metallic mouldings to diffuse light scattering.\n* **Symmetry Ratio:** 82% aligned. Balanced but requires structural wall art placements.",
        styling_tips: "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** Center a premium, large **A2 Oak wood frame** approximately 12 inches above the velvet sofa backrest.\n2. **Textile Accentuation:** Blend emerald velvet scatter cushions with rustic amber throws to tie the botanical energies together.\n3. **Foliage Integration:** Place a tall, broad-leaf Fiddle Leaf Fig or Monstera in an earthy terracotta pot in the empty corner.",
        palette: [
          { name: 'Botanical Emerald', hex: '#064e3b' },
          { name: 'Warm Ochre', hex: '#b58c5c' },
          { name: 'Champagne Sand', hex: '#fef3c7' },
          { name: 'Charcoal Ash', hex: '#1c1917' }
        ],
        recommended_frame_color: '#064e3b',
        recommended_frame_style: 'oak'
      },
      bedroom: {
        harmony_analysis: "### Spatial Diagnostics: Sanctuary Bedroom\n\nThis sanctuary bedroom context focuses heavily on calming symmetry and low visual noise. Soft indirect light scatter is present, pointing to pastel alabasters and neutral textures.\n\n* **Lighting Assessment:** Warm and cozy warm lighting. Low blue-spectrum exposure allows highly tranquil colors to pop without feeling abrasive.\n* **Symmetry Ratio:** 90% aligned. Highly harmonious layout.",
        styling_tips: "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** Position dual A3 oak or borderless frames symmetrically above the headboard.\n2. **Linen Selection:** Introduce stone-washed champagne linen sheet sets to echo the warmth of the frame borders.\n3. **Illumination:** Soft diffused bedside lamps with amber warm bulbs (2700K) to highlight frame texture details.",
        palette: [
          { name: 'Champagne Sand', hex: '#fef3c7' },
          { name: 'Earthy Terracotta', hex: '#78350f' },
          { name: 'Sage Haze', hex: '#80bea6' },
          { name: 'Slate Cloud', hex: '#dee9fc' }
        ],
        recommended_frame_color: '#fef3c7',
        recommended_frame_style: 'none'
      },
      office: {
        harmony_analysis: "### Spatial Diagnostics: Creative Office\n\nYour home study currently operates under sharp task lighting. It lacks deep geometric accents, which can lead to fatigue. Adding a crisp high-contrast focal print stimulates spatial activity and creativity.\n\n* **Lighting Assessment:** Bright desktop LED exposure. High-contrast frames prevent details from getting washed out under direct beam exposure.\n* **Symmetry Ratio:** 75% aligned. Dynamic and modern asymmetric space.",
        styling_tips: "### Aura Styling Recommendations\n\n1. **Wall Art Placement:** An asymmetric golden brass A2 frame hung adjacent to the secondary work desk.\n2. **Desk Elements:** Steel-finish desktop organizers, brass lighting fixtures, and leather desk pads matching the primary colors.\n3. **Vertical Accents:** Minimalist wall shelves featuring architectural models or high-end ceramics.",
        palette: [
          { name: 'Deep Navy', hex: '#1e3a8a' },
          { name: 'Brass Gold', hex: '#d4af37' },
          { name: 'Charcoal Ash', hex: '#1c1917' },
          { name: 'Pure Linen', hex: '#fafaf9' }
        ],
        recommended_frame_color: '#1e3a8a',
        recommended_frame_style: 'gold'
      }
    };

    let selectedReport = fallbacks[scene] || fallbacks.living;

    if (apiKey) {
      try {
        const systemInstruction = "You are an expert high-end spatial computing AI interior designer for 'Aura Decor'. You analyze room environments and prompts to output spatial diagnostic reports in raw JSON format ONLY. Do not use Markdown block code wraps around the JSON.";
        const promptMessage = `The user wants to style their space with this design objective: '${objective}'. Target scene is '${scene}'. Provide an expert spatial analysis. You MUST respond ONLY with a valid JSON block containing: 'harmony_analysis' (detailed spatial review in markdown), 'styling_tips' (textile, layout & element suggestions in markdown), 'palette' (array of 4 color objects matching the style, with keys: 'name', 'hex'), 'recommended_frame_color' (hex color), 'recommended_frame_style' (one of: 'gold', 'oak', 'black', 'none').`;

        const parts = [];
        if (req.file) {
          const fileBuffer = fs.readFileSync(req.file.path);
          parts.push({
            inline_data: {
              mime_type: req.file.mimetype,
              data: fileBuffer.toString('base64')
            }
          });
        }
        parts.push({ text: promptMessage });

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json' }
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const rawText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```(?:json)?|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed && typeof parsed === 'object') {
            selectedReport = parsed;
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Room Analysis] Gemini fallback used:', geminiErr.message);
      }
    }

    res.json({
      status: 'success',
      source: apiKey ? 'gemini_ai_spatial' : 'spatial_engine_fallback',
      data: selectedReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const recommend = async (req, res) => {
  const fallback = {
    style: 'modern',
    suggestions: ['wall frame', 'lamp'],
    source: 'fallback'
  };

  const endpoint = process.env.AI_RECOMMENDER_URL;
  if (!endpoint) {
    return res.json(fallback);
  }

  try {
    const response = await axios.post(endpoint, { image: req.body.image }, { timeout: 10000 });
    if (response.data) {
      return res.json(response.data);
    }
  } catch (e) {
    //
  }

  res.json(fallback);
};
