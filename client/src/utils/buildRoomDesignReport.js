const makeReport = ({
  title,
  subtitle,
  analysis,
  tips,
  palette,
  frameColor,
  frameStyle = 'oak',
  plan,
  shoppingList
}) => ({
  concept_title: title,
  concept_subtitle: subtitle,
  harmony_analysis: analysis,
  styling_tips: tips,
  palette,
  recommended_frame_color: frameColor,
  recommended_frame_style: frameStyle,
  room_plan: plan,
  shopping_list: shoppingList,
  recommended_products: shoppingList.slice(0, 3).map((item) => item.item)
});

export const buildRoomDesignReport = (objective, roomScene) => {
  const prompt = String(objective || '').trim();
  const text = prompt.toLowerCase();
  const sceneName = String(roomScene || 'living').replace(/[-_]/g, ' ');
  const gaming = /\b(gam(e|ing)|stream|pc setup|esports|rgb)\b/.test(text);
  const cinema = /\b(movie|cinema|theatre|theater|projector|film)\b/.test(text);
  const reading = /\b(reading|book|library|study nook)\b/.test(text);
  const workout = /\b(gym|workout|fitness|yoga)\b/.test(text);

  if (gaming) {
    return makeReport({
      title: 'Next-Level Gaming Lounge',
      subtitle: 'A focused, immersive setup built for long sessions and clean, cable-free visuals.',
      analysis: `Your brief is for a gaming room: “${prompt}”. Make the desk and display wall the hero zone. Keep the strongest colors behind the monitors and the surrounding walls calm, so RGB lighting feels intentional rather than overwhelming. Prioritize comfort, glare control, airflow and cable management before adding collectibles.`,
      tips: 'Start with charcoal or deep navy, then use electric cyan as the main light accent and a small amount of magenta for contrast. Place dimmable RGB strips behind the desk and monitor—not in your direct eye line. Choose a matte desk surface, ergonomic chair, low-pile rug for sound absorption, and closed storage for controllers and cables. Finish with a few framed game-inspired prints or floating shelves, leaving breathing room around the screens.',
      palette: [
        { name: 'Midnight Graphite', hex: '#202630' },
        { name: 'Electric Cyan', hex: '#27D7F2' },
        { name: 'Deep Indigo', hex: '#4438A8' },
        { name: 'Soft Ice', hex: '#DDEBF1' }
      ],
      frameColor: '#27D7F2',
      frameStyle: 'black',
      plan: [
        { title: 'Command desk', description: 'Center the desk on the main wall; align the primary monitor at eye level and keep clear space for keyboard, mouse and charging dock.' },
        { title: 'Light without screen glare', description: 'Run dimmable RGB strips behind the desk and monitor. Add one warm task lamp to the side and avoid visible bulbs reflecting in screens.' },
        { title: 'Comfort & acoustics', description: 'Use an adjustable ergonomic chair, a soft rug under the desk and fabric acoustic panels behind the setup.' },
        { title: 'Display & storage', description: 'Create one curated shelf for collectibles; hide power strips and spare gear in ventilated drawers or cable trays.' }
      ],
      shoppingList: [
        { item: 'Dimmable RGB light strip', detail: 'Bias lighting behind monitors, controlled by an app or remote.', priority: 'Essential' },
        { item: 'Ergonomic gaming chair', detail: 'Adjustable lumbar support and seat height for longer sessions.', priority: 'Essential' },
        { item: 'Cable tray and desk grommet', detail: 'Route power and display cables underneath the desk.', priority: 'Essential' },
        { item: 'Acoustic wall panels', detail: 'Felt or fabric panels to soften echo without covering every wall.', priority: 'Upgrade' },
        { item: 'Floating display shelf', detail: 'A single considered row for collectibles or gaming artwork.', priority: 'Finishing touch' }
      ]
    });
  }

  if (cinema) {
    return makeReport({
      title: 'Private Cinema Retreat',
      subtitle: 'A cozy, low-glare screening room with layered sound and soft ambient light.',
      analysis: `Your brief points to a movie-focused room: “${prompt}”. Treat the screen as the focal wall, control reflections with matte finishes, and keep seating aligned for a clear view. A dark accent wall works behind the screen; lighter surrounding surfaces help the room feel open.`,
      tips: 'Choose deep navy, warm charcoal and muted burgundy accents. Install dimmable wall sconces beside the seating rather than in front of the screen. Add lined curtains, a dense rug and upholstered seating to soften sound. Keep decor minimal around the screen and use framed film art on side walls.',
      palette: [
        { name: 'Cinema Navy', hex: '#17243B' },
        { name: 'Velvet Charcoal', hex: '#34343A' },
        { name: 'Muted Burgundy', hex: '#8A4654' },
        { name: 'Warm Brass', hex: '#C4A56A' }
      ],
      frameColor: '#C4A56A',
      frameStyle: 'black',
      plan: [
        { title: 'Screen wall', description: 'Use a matte deep-tone finish and keep mirrors or reflective frames away from the screen.' },
        { title: 'Seating & sightlines', description: 'Center seating on the screen and preserve a comfortable walkway behind or beside the sofa.' },
        { title: 'Layered lighting', description: 'Add dimmable side sconces and a soft LED strip behind the screen for low-glare viewing.' },
        { title: 'Sound-softening layers', description: 'Use lined curtains, a thick rug and upholstered pieces to reduce echo.' }
      ],
      shoppingList: [
        { item: 'Blackout curtains', detail: 'Block daylight and reduce screen reflections.', priority: 'Essential' },
        { item: 'Dimmable wall sconces', detail: 'Keep light off the screen while safely lighting pathways.', priority: 'Essential' },
        { item: 'Dense area rug', detail: 'Anchor the seating and soften room acoustics.', priority: 'Upgrade' },
        { item: 'Framed film artwork', detail: 'Create a gallery moment on a side wall.', priority: 'Finishing touch' }
      ]
    });
  }

  if (reading) {
    return makeReport({
      title: 'The Quiet Reading Nook',
      subtitle: 'A restorative corner with task lighting, reachable books and natural texture.',
      analysis: `Your brief is centered on reading: “${prompt}”. Create a compact destination near natural light, positioning the chair so daylight comes from the side rather than directly behind the book. The nook needs a supportive seat, reachable surface, focused lighting and visual calm.`,
      tips: 'Layer warm ivory, muted sage and oak. Choose a supportive lounge chair with a footstool, a narrow side table for tea and an adjustable 2700K reading lamp. Add a short book ledge or compact bookcase, a textured throw and one framed botanical or abstract print above the nook.',
      palette: [
        { name: 'Soft Sage', hex: '#9EAE9A' },
        { name: 'Warm Ivory', hex: '#F4EFE4' },
        { name: 'Natural Oak', hex: '#B78A5A' },
        { name: 'Ink', hex: '#343C39' }
      ],
      frameColor: '#9EAE9A',
      plan: [
        { title: 'Reading seat', description: 'Place a supportive chair near a window with daylight coming from the side.' },
        { title: 'Focused light', description: 'Add an adjustable warm-white lamp that lights the page without glare.' },
        { title: 'Reachable essentials', description: 'Keep a slim side table and compact book ledge within arm’s reach.' },
        { title: 'Soft landing', description: 'Layer a small rug, tactile throw and one calm piece of wall art.' }
      ],
      shoppingList: [
        { item: 'Supportive lounge chair', detail: 'Comfortable seat depth and arm support for longer reading.', priority: 'Essential' },
        { item: 'Adjustable reading lamp', detail: 'Warm 2700K light with a directional shade.', priority: 'Essential' },
        { item: 'Narrow side table', detail: 'A compact surface for books, glasses and a cup.', priority: 'Upgrade' },
        { item: 'Oak book ledge', detail: 'Keep current reads visible without crowding the nook.', priority: 'Finishing touch' }
      ]
    });
  }

  if (workout) {
    return makeReport({
      title: 'Everyday Movement Studio',
      subtitle: 'A flexible, uncluttered wellness zone that makes movement easy to start.',
      analysis: `Your brief describes a movement and wellness space: “${prompt}”. Keep the center of the floor open and make equipment easy to reach but easy to put away. Use a mirror to check form and bounce light, with soft storage and natural textures so the room feels like home, not a commercial gym.`,
      tips: 'Use warm white, eucalyptus green and natural wood. Choose a wipeable floor mat, wall hooks for bands, a lidded basket for small equipment, and a full-length mirror placed away from direct glare. For yoga, add dimmable warm lighting and a small shelf for blocks and towels.',
      palette: [
        { name: 'Eucalyptus', hex: '#819687' },
        { name: 'Warm Chalk', hex: '#F2EFE8' },
        { name: 'Natural Timber', hex: '#B68A63' },
        { name: 'Deep Moss', hex: '#3C5147' }
      ],
      frameColor: '#3C5147',
      plan: [
        { title: 'Clear movement zone', description: 'Reserve an open central area sized for a mat and full range of movement.' },
        { title: 'Mirror & daylight', description: 'Place a full-length mirror on a side wall and keep daylight indirect.' },
        { title: 'Equipment storage', description: 'Use wall hooks, a slim rack and a lidded basket to keep the floor clear.' },
        { title: 'Calm finish', description: 'Add warm dimmable lighting and one motivating framed print.' }
      ],
      shoppingList: [
        { item: 'Non-slip exercise mat', detail: 'Choose grip and thickness to match your training style.', priority: 'Essential' },
        { item: 'Wall hooks and storage basket', detail: 'Store bands, blocks, towels and small equipment.', priority: 'Essential' },
        { item: 'Full-length mirror', detail: 'Support form checks and reflect natural light.', priority: 'Upgrade' },
        { item: 'Dimmable warm light', detail: 'Create a softer mood for stretching and yoga.', priority: 'Finishing touch' }
      ]
    });
  }

  const japandi = /\bjapandi\b/.test(text);
  const boho = /\b(boho|bohemian|earthy|terracotta)\b/.test(text);
  const title = japandi ? 'Japandi Stillness' : boho ? 'Bohemian Earth & Light' : `${sceneName.charAt(0).toUpperCase()}${sceneName.slice(1)} — Thoughtfully Layered`;
  const colors = japandi
    ? [['Oat Linen', '#E8E0D3'], ['Soft Charcoal', '#3C3C38'], ['Moss Green', '#7C8976'], ['Natural Oak', '#B28A60']]
    : boho
      ? [['Terracotta', '#B96042'], ['Sandy Clay', '#D9B98C'], ['Olive Leaf', '#77784C'], ['Warm Cream', '#F3E9D7']]
      : [['Botanical Emerald', '#315C4D'], ['Warm Sand', '#D2B68C'], ['Ivory Mist', '#F4F0E8'], ['Walnut Charcoal', '#393631']];
  const palette = colors.map(([name, hex]) => ({ name, hex }));

  return makeReport({
    title,
    subtitle: 'A practical, polished scheme shaped around your room, light and daily routine.',
    analysis: `Your design brief${prompt ? `, “${prompt},”` : ''} sets the direction for a ${sceneName} space. Keep one clear focal point, repeat two or three materials so the room feels intentional, and leave negative space around the main furniture. The palette balances a grounding shade with warm natural texture and a light neutral to keep the room open.`,
    tips: `Start with ${colors[0][0]} as the anchor, then layer ${colors[1][0]} through wood, textiles or ceramics. Use ${colors[2][0]} on larger surfaces to keep the composition light. Choose one statement artwork sized to the furniture below it, add a warm dimmable lamp for evening, and finish with a natural texture such as linen, jute or oak. Keep small decor grouped rather than scattered.`,
    palette,
    frameColor: colors[0][1],
    plan: [
      { title: 'Create a focal point', description: 'Center one statement artwork above the main furniture and hang it at comfortable seated eye level.' },
      { title: 'Layer the lighting', description: 'Combine daylight, one warm ambient lamp and a focused task light where you need it.' },
      { title: 'Repeat natural textures', description: 'Echo oak, linen or woven texture in at least two places to tie the scheme together.' },
      { title: 'Keep the layout breathable', description: 'Protect clear walking paths and leave a few surfaces intentionally uncluttered.' }
    ],
    shoppingList: [
      { item: 'Statement framed wall art', detail: 'Choose an oak frame and size it to roughly two-thirds the width of the furniture below.', priority: 'Essential' },
      { item: 'Warm dimmable lamp', detail: 'A warm-white bulb helps the room transition into evening.', priority: 'Essential' },
      { item: 'Textured cushion or throw', detail: `Bring in ${colors[1][0]} through a tactile, easy-care fabric.`, priority: 'Upgrade' },
      { item: 'Hand-finished ceramic accent', detail: 'Use one sculptural vase or bowl as a considered finishing detail.', priority: 'Finishing touch' }
    ]
  });
};
