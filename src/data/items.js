export const ITEMS = {
  water_gallon: {
    id: 'water_gallon',
    name: 'Water Gallon',
    emoji: '\u{1F4A7}',
    weight: 1,
    guide: {
      use: 'Essential hydration supply for emergency survival.',
      howTo: 'Store in cool, dark place. Rotate every 6 months. Keep sealed until needed.',
      femaRef: 'FEMA recommends 1 gallon of water per person per day for at least 3 days.',
    },
  },
  food_can: {
    id: 'food_can',
    name: 'Canned Food',
    emoji: '\u{1F96B}',
    weight: 1,
    guide: {
      use: 'Non-perishable food source lasting 2-5 years.',
      howTo: 'Choose high-calorie, low-sodium options. Keep a manual can opener in your kit.',
      femaRef: 'FEMA 72-hour kit: include at least a 3-day supply of non-perishable food.',
    },
  },
  energy_bar: {
    id: 'energy_bar',
    name: 'Energy Bar',
    emoji: '\u{1F36B}',
    weight: 1,
    guide: {
      use: 'Compact emergency calories ideal for bug-out bags.',
      howTo: 'High energy density in minimal space. Good supplement to main food supply.',
      femaRef: 'FEMA: Include high-energy foods like granola bars in your emergency kit.',
    },
  },
  first_aid_kit: {
    id: 'first_aid_kit',
    name: 'First Aid Kit',
    emoji: '\u{1FA79}',
    weight: 2,
    guide: {
      use: 'Medical supplies for treating injuries during emergencies.',
      howTo: 'Include bandages, antiseptic, gauze, gloves, and pain relievers.',
      femaRef: 'FEMA says every household needs a first aid kit. Take a first aid class.',
    },
  },
  sandbags: {
    id: 'sandbags',
    name: 'Sandbags (x3)',
    emoji: '\u{1F9F1}',
    weight: 3,
    guide: {
      use: 'Flood defense barrier to redirect water flow away from structures.',
      howTo: 'Fill 2/3 full with sand or soil. Place seam-side down. Stagger like bricks.',
      femaRef: 'NFIP reimburses up to $1,000 for loss-avoidance supplies including sandbags.',
    },
  },
  tarp: {
    id: 'tarp',
    name: 'Emergency Tarp',
    emoji: '\u{1F9E2}',
    weight: 1,
    guide: {
      use: 'Waterproof cover to protect against wind-driven rain and debris.',
      howTo: '6-mil poly tarps stop wind-driven rain. Secure with rope or sandbags along edges.',
      femaRef: 'FEMA: Cover broken windows and damaged roofs immediately to prevent further damage.',
    },
  },
  radio: {
    id: 'radio',
    name: 'Emergency Radio',
    emoji: '\u{1F4FB}',
    weight: 2,
    guide: {
      use: 'Required to access the Emergency Oracle dispatcher.',
      howTo: 'NOAA Weather Radio broadcasts 24/7 emergency alerts on dedicated frequencies.',
      femaRef: 'FEMA: A battery-powered or hand-crank radio is essential for receiving emergency alerts.',
    },
  },
  battery_pack: {
    id: 'battery_pack',
    name: 'Battery Pack',
    emoji: '\u{1F50B}',
    weight: 1,
    guide: {
      use: 'Recharges devices for communication and light.',
      howTo: 'Keep electronics charged 3 days before a storm warning. Conserve power.',
      femaRef: 'FEMA: Keep cell phones and backup batteries charged before severe weather.',
    },
  },
  campus_map: {
    id: 'campus_map',
    name: 'Campus Map',
    emoji: '\u{1F5FA}\u{FE0F}',
    weight: 1,
    guide: {
      use: 'Reveals Pizzo Elementary as the on-campus official FEMA shelter.',
      howTo: 'Know your evacuation routes and shelter locations before a storm.',
      femaRef: 'FEMA: Identify shelters and evacuation routes in your area before an emergency.',
    },
  },
  knowledge_binder: {
    id: 'knowledge_binder',
    name: 'Emergency Binder',
    emoji: '\u{1F4CB}',
    weight: 1,
    guide: {
      use: 'Contains copies of ID, insurance, contacts, and emergency protocols.',
      howTo: 'Keep in waterproof container. Include copies of all important documents.',
      femaRef: 'FEMA recommends a "Go Kit" binder with ID, insurance, and medical records for every family.',
    },
  },
  flashlight: {
    id: 'flashlight',
    name: 'Flashlight',
    emoji: '\u{1F526}',
    weight: 1,
    guide: {
      use: 'Critical for navigation during power outages.',
      howTo: 'LED flashlights last 40+ hours. Keep spare batteries. Avoid candles (fire risk).',
      femaRef: 'FEMA 72-hour kit: Include a flashlight with extra batteries.',
    },
  },
  whistle: {
    id: 'whistle',
    name: 'Emergency Whistle',
    emoji: '\u{1F4E2}',
    weight: 2,
    guide: {
      use: 'Signal for help when voice cannot carry. Universal distress signal: 3 short blasts.',
      howTo: 'A Fox 40 pealess whistle carries 100+ decibels and works when wet.',
      femaRef: 'FEMA: Include a whistle in your emergency kit to signal for help.',
    },
  },
  // === JUNK ITEMS (no survival value) ===
  usb_drive: {
    id: 'usb_drive',
    name: 'USB Drive',
    emoji: '\u{1F4BE}',
    weight: 1,
    isJunk: true,
    guide: {
      use: 'Contains someone\'s old homework files. Completely useless in a hurricane.',
      howTo: 'You could throw it, I guess.',
      femaRef: 'FEMA does not recommend backing up your essays as a survival strategy.',
    },
  },
  sunglasses: {
    id: 'sunglasses',
    name: 'Broken Sunglasses',
    emoji: '\u{1F576}\u{FE0F}',
    weight: 1,
    isJunk: true,
    guide: {
      use: 'One lens is cracked and the other is missing. Peak fashion during a Category 4.',
      howTo: 'Wear them if you want to look cool while being swept away.',
      femaRef: 'FEMA: Sunglasses are not on any emergency preparedness checklist.',
    },
  },
  textbook: {
    id: 'textbook',
    name: 'Soaked Textbook',
    emoji: '\u{1F4D5}',
    weight: 3,
    isJunk: true,
    guide: {
      use: 'An Introduction to Organic Chemistry, now an introduction to paper mache.',
      howTo: 'Could be used as a doorstop. That\'s about it.',
      femaRef: 'FEMA: Knowledge is power, but not this kind. Not right now.',
    },
  },
  lanyard: {
    id: 'lanyard',
    name: 'USF Lanyard',
    emoji: '\u{1F3AB}',
    weight: 1,
    isJunk: true,
    guide: {
      use: 'Shows your school spirit. Does nothing else.',
      howTo: 'Wear it around your neck so rescuers know your alma mater.',
      femaRef: 'FEMA: University merchandise is not part of any disaster preparedness plan.',
    },
  },
  phone_charger: {
    id: 'phone_charger',
    name: 'Phone Charger (No Phone)',
    emoji: '\u{1F50C}',
    weight: 1,
    isJunk: true,
    guide: {
      use: 'A Lightning cable. Your phone died 3 hours ago and there\'s no outlet in sight.',
      howTo: 'Coil it up neatly. Feels productive. Accomplishes nothing.',
      femaRef: 'FEMA: Keep devices charged BEFORE the storm. This cable won\'t help now.',
    },
  },
}

export const WEIGHT_LIMIT = 8
