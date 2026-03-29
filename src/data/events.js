export const GAUNTLET_EVENTS = [
  {
    id: 'power_out',
    title: 'The Power Goes Out',
    description: 'The building plunges into darkness. A crash -- someone trips and goes down hard.',
    dispatchContext: 'Power is out. People are panicking in the dark. Someone fell and may be hurt.',
    choices: [
      {
        text: 'Use your flashlight to light the way.',
        requiresItem: 'flashlight',
        onSuccess: { health: 0, morale: 10, note: '{name} lights the room. Panic fades. People hold it together.' },
        onFail: { health: -10, morale: -20, note: '{name} stumbles in the dark. A painful fall. Without light, panic spreads.' },
      },
      {
        text: 'Try to calm everyone and tell them to sit down.',
        requiresItem: null,
        outcome: { health: -5, morale: -10, note: 'Someone still moves. Another fall. Darkness is dangerous.' },
      },
    ],
    improvise: {
      text: 'Improvise a light source.',
      useItems: ['battery_pack', 'radio'],
      outcomes: {
        battery_pack: { health: 0, morale: 5, note: '{name} holds up the battery pack — the charging LED casts a dim glow. Not much, but enough to stop the panic.' },
        radio: { health: 0, morale: 3, note: '{name} cranks the radio dial light. A faint green glow. People gather around it like a campfire.' },
      },
      fallback: { health: -10, morale: -15, note: '{name} tries to improvise but has nothing useful. The darkness wins.' },
    },
  },
  {
    id: 'surge_breach',
    title: 'Surge Breach',
    description: 'Water seeps under the door. The first floor is flooding fast.',
    dispatchContext: 'Water is breaching under the door. First floor flooding. Need to stop or slow it.',
    choices: [
      {
        text: 'Deploy your sandbags against the door.',
        requiresItem: 'sandbags',
        onSuccess: { health: 0, morale: 5, note: '{name} slows the flood. Good call.' },
        onFail: { health: -30, morale: -10, note: 'Water rushes in. {name} retreats upstairs, soaked and shaken.' },
      },
      {
        text: 'Retreat to the highest floor immediately.',
        requiresItem: null,
        outcome: { health: -10, morale: 0, note: 'You make it, but the exposure costs you.' },
      },
    ],
    improvise: {
      text: 'Improvise a barrier.',
      useItems: ['tarp', 'textbook'],
      outcomes: {
        tarp: { health: -5, morale: 3, note: '{name} presses the tarp against the gap under the door and weighs it down. Slows the flow — buys time to retreat.' },
        textbook: { health: -10, morale: 0, note: '{name} jams the soaked textbook under the door. It absorbs water for a minute before falling apart. Barely enough time to get upstairs.' },
      },
      fallback: { health: -25, morale: -10, note: '{name} tries to block the water with bare hands. The surge doesn\'t care. Forced retreat, soaked through.' },
    },
  },
  {
    id: 'medical_emergency',
    title: 'Medical Emergency',
    description: 'A fellow student is struck by debris. They need treatment now. {name}, what do you do?',
    dispatchContext: 'Someone is injured by debris. Bleeding, possible concussion. No professional medical help available.',
    choices: [
      {
        text: 'Use your first aid kit.',
        requiresItem: 'first_aid_kit',
        onSuccess: { health: 10, morale: 20, note: 'You save them. Real leadership, {name}.' },
        onFail: { health: -10, morale: -30, note: 'Nothing you could do. It weighs on you.' },
      },
      {
        text: 'Improvise with available materials.',
        requiresItem: null,
        outcome: { health: -5, morale: -10, note: 'Barely stabilized. They need real care.' },
      },
    ],
    improvise: {
      text: 'Improvise medical care.',
      useItems: ['water_gallon', 'knowledge_binder', 'tarp'],
      outcomes: {
        water_gallon: { health: 0, morale: 5, note: '{name} cleans the wound with clean water. Not ideal, but infection risk drops. The student stabilizes.' },
        knowledge_binder: { health: 5, morale: 10, note: '{name} flips to the emergency medical section. Follows the pressure and elevation steps exactly. The bleeding slows.' },
        tarp: { health: -5, morale: 0, note: '{name} tears strips from the tarp for makeshift bandages. Crude, but it holds.' },
      },
      fallback: { health: -10, morale: -20, note: '{name} tries to help but has nothing to work with. The student\'s condition worsens.' },
    },
  },
  {
    id: 'radio_call',
    title: 'Emergency Broadcast',
    description: 'A faint signal warns of a second surge spike in 30 minutes.',
    dispatchContext: 'Incoming broadcast warns of second surge spike. Need to signal location for rescue coordination.',
    choices: [
      {
        text: 'Broadcast your location for rescue.',
        requiresItem: 'radio',
        onSuccess: { health: 0, morale: 15, note: "Dispatcher acknowledges {name}'s signal. Help is on the way." },
        onFail: { health: 0, morale: -15, note: '{name} has no way to call out. Isolation sets in.' },
      },
      {
        text: 'Conserve energy and wait.',
        requiresItem: null,
        outcome: { health: 0, morale: -5, note: 'Quiet dread. But {name} conserves energy.' },
      },
    ],
    improvise: {
      text: 'Improvise a signal.',
      useItems: ['whistle', 'flashlight'],
      outcomes: {
        whistle: { health: 0, morale: 10, note: '{name} blasts three short bursts — the universal distress signal. It carries over the wind. Someone out there might have heard.' },
        flashlight: { health: 0, morale: 8, note: '{name} flashes SOS from the window. Long-short-long. A helicopter searchlight sweeps nearby. They may have seen it.' },
      },
      fallback: { health: 0, morale: -10, note: '{name} shouts into the storm. The wind swallows every word.' },
    },
  },
  {
    id: 'debris_impact',
    title: 'Window Impact',
    description: 'Flying debris shatters a window. Wind and rain pour in.',
    dispatchContext: 'Window shattered by debris. Wind and rain flooding in. Need to seal the opening.',
    choices: [
      {
        text: 'Use your emergency tarp to cover the opening.',
        requiresItem: 'tarp',
        onSuccess: { health: 0, morale: 10, note: '{name} seals it. Smart prep.' },
        onFail: { health: -20, morale: -10, note: 'Exposure takes its toll on {name}.' },
      },
      {
        text: 'Move everyone away from the window.',
        requiresItem: null,
        outcome: { health: -5, morale: 0, note: 'Safer position, but still exposed.' },
      },
    ],
    improvise: {
      text: 'Improvise a window cover.',
      useItems: ['sandbags', 'textbook'],
      outcomes: {
        sandbags: { health: -5, morale: 5, note: '{name} stacks sandbags below the window frame. The wind still howls through, but the rain is mostly blocked.' },
        textbook: { health: -10, morale: -5, note: '{name} wedges the thick textbook into the broken frame. It holds for a minute before the wind rips it out. Brief relief.' },
      },
      fallback: { health: -15, morale: -10, note: '{name} tries to block the window with furniture. The wind is too strong. Everyone gets soaked.' },
    },
  },
  {
    id: 'dehydration',
    title: 'Dehydration Crisis',
    description: 'Hours in. Thirst is becoming dangerous.',
    dispatchContext: 'Group is severely dehydrated. No clean water supply. People getting weak.',
    choices: [
      {
        text: 'Share your water gallon.',
        requiresItem: 'water_gallon',
        onSuccess: { thirst: 20, morale: 20, note: '{name} came prepared. FEMA standard: 1 gallon/person/day.' },
        onFail: { health: -15, morale: -15, note: '{name} had nothing. The FEMA standard is 1 gallon per person per day.' },
      },
      {
        text: 'Ration what little moisture is available.',
        requiresItem: null,
        outcome: { health: -10, morale: -5, note: 'Barely surviving.' },
      },
    ],
    improvise: {
      text: 'Improvise a water source.',
      useItems: ['food_can', 'energy_bar'],
      outcomes: {
        food_can: { thirst: 10, morale: 5, note: '{name} cracks open the canned food. The brine inside isn\'t much, but it\'s liquid. People sip from the can. Better than nothing.' },
        energy_bar: { health: -5, morale: 0, note: '{name} splits the energy bar. The sugar helps with energy but makes the thirst worse. A trade-off.' },
      },
      fallback: { health: -15, morale: -10, note: '{name} has nothing to offer. Mouths go dry. Morale plummets.' },
    },
  },
  {
    id: 'whistle_rescue',
    title: 'Rescue Opportunity',
    description: 'A rescue boat passes outside. It will be gone in seconds.',
    dispatchContext: 'Rescue boat spotted nearby but moving fast. Need to attract attention immediately.',
    choices: [
      {
        text: 'Signal with your emergency whistle.',
        requiresItem: 'whistle',
        onSuccess: { health: 20, morale: 30, note: '{name} is spotted. Rescued.' },
        onFail: { morale: -20, note: 'They pass by. {name} was invisible.' },
      },
      {
        text: 'Shout and wave from the window.',
        requiresItem: null,
        outcome: { health: -5, morale: 10, note: '{name} leans out dangerously far, waving. They might have seen you... the effort costs you, but hope is worth something.' },
      },
    ],
    improvise: {
      text: 'Improvise a signal for the boat.',
      useItems: ['flashlight', 'radio'],
      outcomes: {
        flashlight: { health: 0, morale: 20, note: '{name} aims the flashlight at the boat and flashes rapidly. The beam cuts through the rain. The boat slows — they saw you!' },
        radio: { health: 0, morale: 15, note: '{name} broadcasts on emergency frequency. "Survivor at {location}, requesting pickup." The boat changes course.' },
      },
      fallback: { morale: -15, note: '{name} bangs on the wall, screams into the wind. The boat drifts past without stopping.' },
    },
  },
  {
    id: 'final_surge',
    title: 'The Final Surge',
    description: 'Surge Level peaks. The ground floor is fully submerged. Dawn is 2 hours away.',
    dispatchContext: 'Peak surge. Ground floor underwater. Need to manage morale and plan for post-storm survival.',
    choices: [
      {
        text: 'Review your emergency binder for post-storm protocol.',
        requiresItem: 'knowledge_binder',
        onSuccess: { morale: 15, note: '{name} knows what comes next. Prepared mind, prepared outcome.' },
        onFail: { morale: -5, note: 'Uncertainty gnaws at {name}.' },
      },
      {
        text: 'Keep watch and monitor water levels.',
        requiresItem: null,
        outcome: { morale: 5, note: 'Vigilant. Every inch counts.' },
      },
    ],
    improvise: {
      text: 'Improvise a plan for dawn.',
      useItems: ['radio', 'campus_map', 'flashlight'],
      outcomes: {
        radio: { morale: 10, note: '{name} tunes into the emergency frequency. NOAA confirms the eye is passing — surge will recede by dawn. Knowing is half the battle.' },
        campus_map: { morale: 8, note: '{name} studies the map, planning escape routes for when the water drops. Having a plan calms the group.' },
        flashlight: { morale: 5, note: '{name} sweeps the flashlight across the water below, tracking the level. It\'s holding. Dawn will come.' },
      },
      fallback: { morale: -5, note: 'Nothing to do but wait and hope. The longest hours of {name}\'s life.' },
    },
  },
]
