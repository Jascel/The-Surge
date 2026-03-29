export const GAUNTLET_EVENTS = [
  {
    id: 'power_out',
    title: 'The Power Goes Out',
    description: 'The building plunges into darkness. A crash -- someone trips and goes down hard.',
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
  },
  {
    id: 'surge_breach',
    title: 'Surge Breach',
    description: 'Water seeps under the door. The first floor is flooding fast.',
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
  },
  {
    id: 'medical_emergency',
    title: 'Medical Emergency',
    description: 'A fellow student is struck by debris. They need treatment now. {name}, what do you do?',
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
  },
  {
    id: 'radio_call',
    title: 'Emergency Broadcast',
    description: 'A faint signal warns of a second surge spike in 30 minutes.',
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
  },
  {
    id: 'debris_impact',
    title: 'Window Impact',
    description: 'Flying debris shatters a window. Wind and rain pour in.',
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
  },
  {
    id: 'dehydration',
    title: 'Dehydration Crisis',
    description: 'Hours in. Thirst is becoming dangerous.',
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
  },
  {
    id: 'whistle_rescue',
    title: 'Rescue Opportunity',
    description: 'A rescue boat passes outside. It will be gone in seconds.',
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
  },
  {
    id: 'final_surge',
    title: 'The Final Surge',
    description: 'Surge Level peaks. The ground floor is fully submerged. Dawn is 2 hours away.',
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
  },
]
