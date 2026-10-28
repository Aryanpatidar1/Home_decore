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

    res.json({
      status: 'success',
      source: apiKey ? 'gemini_ai' : 'curation_engine_fallback',
      data: resultSpec
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildRoomDesignReport = (objective, roomScene) => {
  const prompt = String(objective || '').trim();
  const text = prompt.toLowerCase();
  const sceneName = String(roomScene || 'living').replace(/[-_]/g, ' ');
  const wantsGaming = /\b(gam(e|ing)|stream|pc setup|esports|rgb)\b/.test(text);
  const wantsCinema = /\b(movie|cinema|theatre|theater|projector|film)\b/.test(text);
  const wantsReading = /\b(reading|book|library|study nook)\b/.test(text);
  const wantsJapandi = /\bjapandi\b/.test(text);
  const wantsBoho = /\b(boho|bohemian|earthy|terracotta)\b/.test(text);
  const wantsWorkout = /\b(gym|workout|fitness|yoga)\b/.test(text);

  if (wantsGaming) {
    return {
      concept_title: 'Next-Level Gaming Lounge',
      concept_subtitle: 'A focused, immersive setup built for long sessions and clean cable-free visuals.',
      harmony_analysis: `Your brief calls for a gaming room${prompt ? `: “${prompt}”` : ''}. Build the room around one clear hero zone: the desk and display wall. Keep the strongest colors behind the monitors, while the rest of the room stays dark and calm so RGB light feels intentional instead of overwhelming. Prioritize comfort, glare control, airflow, and cable management before adding collectibles.`,
      styling_tips: 'Use a charcoal or deep navy base with controlled electric-cyan accents; add magenta only as a small secondary highlight. Put dimmable indirect LED strips behind the desk and monitor, not directly in your eye line. Choose a matte desk surface, an ergonomic chair, a large low-pile rug for sound absorption, and closed storage for controllers and cables. Add a few framed game-inspired prints or floating display shelves, leaving breathing room around the screens.',
      room_plan: [
        { title: 'Command desk', description: 'Center the desk on the main wall; align the primary monitor at eye level and leave clear space for keyboard, mouse, and charging dock.' },
        { title: 'Light without screen glare', description: 'Run dimmable RGB strips behind the desk and monitor. Add one warm task lamp to the side and avoid visible bulbs reflecting in the screens.' },
        { title: 'Comfort & acoustics', description: 'Use an adjustable ergonomic chair, a soft rug under the desk, and fabric acoustic panels on the wall behind the setup.' },
        { title: 'Display & storage', description: 'Place a narrow shelf for a few collectibles, then hide power strips and spare gear in ventilated drawers or cable trays.' }
      ],
      shopping_list: [
        { item: 'Dimmable RGB light strip', detail: 'Bias lighting behind the monitors; app or remote controlled.', priority: 'Essential' },
        { item: 'Ergonomic gaming chair', detail: 'Adjustable lumbar support and seat height for long sessions.', priority: 'Essential' },
        { item: 'Cable tray and desk grommet', detail: 'Route power and display cables under the desk.', priority: 'Essential' },
        { item: 'Acoustic wall panels', detail: 'Fabric or felt panels to soften echo without covering the whole wall.', priority: 'Upgrade' },
        { item: 'Floating display shelf', detail: 'A single curated row for collectibles or framed gaming art.', priority: 'Finishing touch' }
      ],
      palette: [
        { name: 'Midnight Graphite', hex: '#202630' },
        { name: 'Electric Cyan', hex: '#27D7F2' },
        { name: 'Deep Indigo', hex: '#4438A8' },
        { name: 'Soft Ice', hex: '#DDEBF1' }
      ],
      recommended_frame_color: '#27D7F2',
      recommended_frame_style: 'black',
      recommended_products: ['LED bias lighting', 'Acoustic wall panels', 'Framed game-inspired art']
    };
  }

  if (wantsCinema) {
    return {
      concept_title: 'Private Cinema Retreat',
      concept_subtitle: 'A cozy, low-glare screening room with layered sound and soft ambient light.',
      harmony_analysis: `Your brief points to a movie-focused room${prompt ? `: “${prompt}”` : ''}. Treat the screen as the focal wall, control reflections with matte finishes, and keep the seating zone comfortable with clear sightlines. A dark accent wall works best behind the screen; lighter surrounding surfaces prevent the room from feeling closed in.`,
      styling_tips: 'Choose deep navy, warm charcoal, and muted burgundy accents. Install dimmable wall sconces beside the seating rather than in front of the screen. Add thick curtains, a dense rug, and upholstered seating to soften sound. Keep decor minimal around the screen; use framed film art on the side walls.',
      room_plan: [
        { title: 'Screen wall', description: 'Use a matte deep-tone finish and keep reflective frames or mirrors away from the screen.' },
        { title: 'Seating & sightlines', description: 'Center seating on the screen and leave a comfortable walkway behind or beside the sofa.' },
        { title: 'Layered lighting', description: 'Add dimmable side sconces and a soft LED strip behind the screen for low-glare viewing.' },
        { title: 'Sound-softening layers', description: 'Use lined curtains, a thick rug, and upholstered pieces to reduce echo.' }
      ],
      shopping_list: [
        { item: 'Blackout curtains', detail: 'Block daylight and reduce screen reflections.', priority: 'Essential' },
        { item: 'Dimmable wall sconces', detail: 'Keep light off the screen while maintaining safe pathways.', priority: 'Essential' },
        { item: 'Dense area rug', detail: 'Anchor the seating and soften room acoustics.', priority: 'Upgrade' },
        { item: 'Framed film artwork', detail: 'Create a gallery moment on a side wall.', priority: 'Finishing touch' }
      ],
      palette: [
        { name: 'Cinema Navy', hex: '#17243B' },
        { name: 'Velvet Charcoal', hex: '#34343A' },
        { name: 'Muted Burgundy', hex: '#8A4654' },
        { name: 'Warm Brass', hex: '#C4A56A' }
      ],
      recommended_frame_color: '#C4A56A',
      recommended_frame_style: 'black',
      recommended_products: ['Blackout curtains', 'Dimmable wall sconces', 'Framed film artwork']
    };
  }

  if (wantsReading) {
    return {
      concept_title: 'The Quiet Reading Nook',
      concept_subtitle: 'A restorative corner with task lighting, reachable books, and soft natural texture.',
      harmony_analysis: `Your brief is centered on reading${prompt ? `: “${prompt}”` : ''}. Create a compact destination near natural light, but position the chair so daylight comes from the side rather than directly behind the book. The space needs a comfortable seat, a reachable surface, focused lighting, and a small amount of visual calm.`,
      styling_tips: 'Layer warm ivory, muted sage, and oak. Choose a supportive lounge chair with a footstool, a narrow side table for tea, and an adjustable 2700K reading lamp. Add a short book ledge or compact bookcase, a textured throw, and one framed botanical or abstract print above the nook.',
      room_plan: [
        { title: 'Reading seat', description: 'Place a supportive chair near a window with daylight coming from the side.' },
        { title: 'Focused light', description: 'Add an adjustable warm-white reading lamp that lights the page without glare.' },
        { title: 'Reachable essentials', description: 'Keep a slim side table and a compact book ledge within arm’s reach.' },
        { title: 'Soft landing', description: 'Layer a small rug, a tactile throw, and one calm piece of wall art.' }
      ],
      shopping_list: [
        { item: 'Supportive lounge chair', detail: 'Comfortable seat depth and arm support for longer reading.', priority: 'Essential' },
        { item: 'Adjustable reading lamp', detail: 'Warm 2700K light with a directional shade.', priority: 'Essential' },
        { item: 'Narrow side table', detail: 'A compact surface for books, glasses, and a cup.', priority: 'Upgrade' },
        { item: 'Oak book ledge', detail: 'Keep current reads visible without making the nook feel crowded.', priority: 'Finishing touch' }
      ],
      palette: [
        { name: 'Soft Sage', hex: '#9EAE9A' },
        { name: 'Warm Ivory', hex: '#F4EFE4' },
        { name: 'Natural Oak', hex: '#B78A5A' },
        { name: 'Ink', hex: '#343C39' }
      ],
      recommended_frame_color: '#9EAE9A',
      recommended_frame_style: 'oak',
      recommended_products: ['Adjustable reading lamp', 'Oak book ledge', 'Botanical wall art']
    };
  }

  if (wantsWorkout) {
    return {
      concept_title: 'Everyday Movement Studio',
      concept_subtitle: 'A flexible, uncluttered wellness zone that makes movement easy to start.',
      harmony_analysis: `Your brief describes a movement and wellness space${prompt ? `: “${prompt}”` : ''}. Keep the center of the floor open and make equipment easy to reach but easy to put away. Use a mirror to check form and bounce light, with soft storage and natural textures to keep the room from feeling like a commercial gym.`,
      styling_tips: 'Use warm white, eucalyptus green, and natural wood. Choose a wipeable floor mat, wall hooks for bands, a lidded basket for small equipment, and a full-length mirror placed away from direct glare. For yoga, add dimmable warm lighting and a small shelf for blocks and towels.',
      room_plan: [
        { title: 'Clear movement zone', description: 'Reserve an open central area sized for a mat and full range of movement.' },
        { title: 'Mirror & daylight', description: 'Place a full-length mirror on a side wall and keep daylight indirect.' },
        { title: 'Equipment storage', description: 'Use wall hooks, a slim rack, and a lidded basket to keep the floor clear.' },
        { title: 'Calm finish', description: 'Add a plant, warm dimmable lighting, and one motivating framed print.' }
      ],
      shopping_list: [
        { item: 'Non-slip exercise mat', detail: 'Choose thickness and grip to suit your training style.', priority: 'Essential' },
        { item: 'Wall hooks and storage basket', detail: 'Store bands, blocks, towels, and small equipment.', priority: 'Essential' },
        { item: 'Full-length mirror', detail: 'Support form checks and reflect natural light.', priority: 'Upgrade' },
        { item: 'Dimmable warm light', detail: 'Create a softer mood for stretching and yoga.', priority: 'Finishing touch' }
      ],
      palette: [
        { name: 'Eucalyptus', hex: '#819687' },
        { name: 'Warm Chalk', hex: '#F2EFE8' },
        { name: 'Natural Timber', hex: '#B68A63' },
        { name: 'Deep Moss', hex: '#3C5147' }
      ],
      recommended_frame_color: '#3C5147',
      recommended_frame_style: 'oak',
      recommended_products: ['Non-slip exercise mat', 'Wall storage hooks', 'Calming botanical print']
    };
  }

  const style = wantsJapandi
    ? { title: 'Japandi Stillness', colors: [['Oat Linen', '#E8E0D3'], ['Soft Charcoal', '#3C3C38'], ['Moss Green', '#7C8976'], ['Natural Oak', '#B28A60']], frame: 'oak' }
    : wantsBoho
      ? { title: 'Bohemian Earth & Light', colors: [['Terracotta', '#B96042'], ['Sandy Clay', '#D9B98C'], ['Olive Leaf', '#77784C'], ['Warm Cream', '#F3E9D7']], frame: 'oak' }
      : { title: 'Modern Organic Retreat', colors: [['Botanical Emerald', '#315C4D'], ['Warm Sand', '#D2B68C'], ['Ivory Mist', '#F4F0E8'], ['Walnut Charcoal', '#393631']], frame: 'oak' };
  const palette = style.colors.map(([name, hex]) => ({ name, hex }));

  return {
    concept_title: wantsJapandi || wantsBoho ? style.title : `${sceneName.charAt(0).toUpperCase()}${sceneName.slice(1)} — Thoughtfully Layered`,
    concept_subtitle: 'A practical, polished scheme shaped around your room, light, and daily routine.',
    harmony_analysis: `Your design brief${prompt ? `, “${prompt},”` : ''} sets the direction for a ${sceneName} space. Keep one clear focal point, repeat two or three materials so the room feels intentional, and leave negative space around the main furniture. The palette below balances a grounding shade with warm natural texture and a light neutral to keep the room open.`,
    styling_tips: `Start with ${style.colors[0][0]} as the anchor, then layer ${style.colors[1][0]} through wood, textiles, or ceramics. Use ${style.colors[2][0]} on larger surfaces to keep the composition light. Choose one statement artwork sized to the furniture below it, add a warm dimmable lamp for evening, and finish with a natural texture such as linen, jute, or oak. Keep small decor grouped in threes rather than scattered.`,
    room_plan: [
      { title: 'Create a focal point', description: 'Center one statement artwork above the main furniture and hang it at comfortable seated eye level.' },
      { title: 'Layer the lighting', description: 'Combine daylight, one warm ambient lamp, and a focused task light where you need it.' },
      { title: 'Repeat natural textures', description: 'Echo oak, linen, or woven texture in at least two places to tie the scheme together.' },
      { title: 'Keep the layout breathable', description: 'Protect clear walking paths and leave a few surfaces intentionally uncluttered.' }
    ],
    shopping_list: [
      { item: 'Statement framed wall art', detail: `Choose a ${style.frame} frame and size it to roughly two-thirds the width of the furniture below.`, priority: 'Essential' },
      { item: 'Warm dimmable table or floor lamp', detail: 'A warm-white bulb helps the room transition comfortably into evening.', priority: 'Essential' },
      { item: 'Textured cushion or throw', detail: `Bring in ${style.colors[1][0]} through a tactile, easy-care fabric.`, priority: 'Upgrade' },
      { item: 'Hand-finished ceramic accent', detail: 'Use one sculptural vase or bowl as a small, considered finishing detail.', priority: 'Finishing touch' }
    ],
    palette,
    recommended_frame_color: style.colors[0][1],
    recommended_frame_style: style.frame,
    recommended_products: ['Statement framed wall art', 'Warm dimmable lighting', 'Natural-texture soft furnishings']
  };
};

export const analyzeRoom = async (req, res) => {
  try {
    const { objective, room_scene } = req.body;
    const scene = room_scene || 'living';
    const apiKey = process.env.GEMINI_API_KEY;
    let selectedReport = buildRoomDesignReport(objective, scene);
    let source = 'prompt_curation_fallback';

    if (apiKey) {
      try {
        const systemInstruction = "You are an expert high-end spatial computing AI interior designer for 'Aura Decor'. You analyze room environments and prompts to output spatial diagnostic reports in raw JSON format ONLY. Do not use Markdown block code wraps around the JSON.";
        const promptMessage = `Create a genuinely useful, specific interior design consultation. The user's exact brief is: "${String(objective || '').slice(0, 1500)}". The selected room template is "${scene}", but if the user's brief names a more specific room or purpose (for example gaming room, cinema room, nursery, reading nook, home gym), that purpose MUST drive the design and must not be replaced by generic living-room advice. Refer to concrete needs in the brief. Never claim to have measured or visually analyzed a photo unless supported by the uploaded image.\n\nReturn valid JSON only with this schema: {"concept_title":"short attractive concept name","concept_subtitle":"one sentence promise","harmony_analysis":"personalized 3-5 sentence room diagnosis referencing the requested use and practical priorities","styling_tips":"specific, practical 4-6 sentence design direction covering colors, materials, lighting, layout and comfort","room_plan":[{"title":"zone name","description":"actionable specific placement advice"}] (4 items),"shopping_list":[{"item":"specific decor/product","detail":"what to choose and why","priority":"Essential, Upgrade, or Finishing touch"}] (4-6 items),"palette":[{"name":"color name","hex":"#RRGGBB"}] (exactly 4),"recommended_products":["3 relevant decor/product suggestions"],"recommended_frame_color":"#RRGGBB","recommended_frame_style":"one of gold, oak, black, none"}. Recommendations must be attractive but realistic, renter-friendly where appropriate, and specific to the stated brief.`;

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
            selectedReport = {
              ...selectedReport,
              ...parsed,
              palette: Array.isArray(parsed.palette) && parsed.palette.length >= 3 ? parsed.palette.slice(0, 4) : selectedReport.palette,
              room_plan: Array.isArray(parsed.room_plan) && parsed.room_plan.length ? parsed.room_plan : selectedReport.room_plan,
              shopping_list: Array.isArray(parsed.shopping_list) && parsed.shopping_list.length ? parsed.shopping_list : selectedReport.shopping_list
            };
            source = 'gemini_ai_spatial';
          }
        }
      } catch (geminiErr) {
        console.warn('[AI Room Analysis] Gemini fallback used:', geminiErr.message);
      }
    }

    res.json({
      status: 'success',
      source,
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
