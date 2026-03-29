export const LOCATIONS = {
  MSC: {
    id: 'MSC',
    name: 'Marshall Student Center',
    elevation: 3,
    description: 'The campus hub. Hours ago this place was full of students. Now the halls echo.',
    gradient: 'from-slate-800 to-slate-900',
    areas: [
      {
        id: 'msc_breakroom',
        name: 'Break Room Cabinet',
        description: 'The break room smells of stale coffee. A cabinet door hangs open.',
        lootTable: [{ itemId: 'food_can', chance: 0.7 }],
      },
      {
        id: 'msc_security',
        name: 'Security Desk',
        description: 'The security desk has been abandoned. Equipment is scattered across it.',
        lootTable: [
          { itemId: 'radio', chance: 1 },
          { itemId: 'flashlight', chance: 1 },
        ],
      },
      {
        id: 'msc_bulletin',
        name: 'Bulletin Board',
        description: 'A cluttered bulletin board. Flyers and notices overlap each other.',
        lootTable: [{ itemId: 'campus_map', chance: 1 }],
      },
      {
        id: 'msc_vending',
        name: 'Vending Machine',
        description: 'The vending machine hums faintly. The power could go any moment.',
        lootTable: [{ itemId: 'energy_bar', chance: 1 }],
      },
      {
        id: 'msc_lostandfound',
        name: 'Lost & Found Bin',
        description: 'A plastic bin overflowing with forgotten student belongings.',
        lootTable: [
          { itemId: 'lanyard', chance: 0.8 },
          { itemId: 'sunglasses', chance: 0.6 },
        ],
      },
    ],
  },
  LIBRARY: {
    id: 'LIBRARY',
    name: 'USF Library',
    elevation: 5,
    description: 'The library towers above campus. The top floors are safe ground -- the basement is a death trap.',
    gradient: 'from-emerald-950 to-slate-900',
    areas: [
      {
        id: 'library_office',
        name: "Librarian's Office (Top Floor)",
        description: 'The office door is unlocked. Whoever was here left in a hurry.',
        lootTable: [
          { itemId: 'first_aid_kit', chance: 1 },
          { itemId: 'knowledge_binder', chance: 1 },
        ],
      },
      {
        id: 'library_supply',
        name: 'Supply Closet (Top Floor)',
        description: 'A narrow closet packed with supplies.',
        lootTable: [{ itemId: 'battery_pack', chance: 1 }],
      },
      {
        id: 'library_reading',
        name: 'Reading Room Shelf',
        description: 'Rows of bookshelves. Something useful might be wedged between the volumes.',
        lootTable: [
          { itemId: 'food_can', chance: 0.5 },
          { itemId: 'textbook', chance: 0.7 },
        ],
      },
      {
        id: 'library_study',
        name: 'Study Room Cabinet',
        description: 'A group study room. The cabinet underneath has seen better days.',
        lootTable: [
          { itemId: 'flashlight', chance: 0.5 },
          { itemId: 'usb_drive', chance: 0.6 },
        ],
      },
      {
        id: 'library_basement',
        name: 'Basement Storage (FLOOD RISK)',
        description: 'The basement is dark and the floor is already damp. Water is seeping in.',
        lootTable: [{ itemId: 'sandbags', chance: 0.7 }],
        isRisky: true,
      },
    ],
  },
  MUMA: {
    id: 'MUMA',
    name: 'Muma College of Business',
    elevation: 1,
    description: 'Low ground. The lobby is already showing signs of flooding. Move fast.',
    gradient: 'from-amber-950 to-slate-900',
    areas: [
      {
        id: 'muma_maintenance',
        name: 'Maintenance Closet',
        description: 'Heavy-duty supplies for building maintenance.',
        lootTable: [
          { itemId: 'sandbags', chance: 1 },
          { itemId: 'tarp', chance: 1 },
        ],
      },
      {
        id: 'muma_office',
        name: 'Faculty Office',
        description: 'Someone left in a hurry. Papers are scattered everywhere.',
        lootTable: [{ itemId: 'phone_charger', chance: 0.8 }],
      },
    ],
  },
  CHICKFILA: {
    id: 'CHICKFILA',
    name: 'Chick-fil-A',
    elevation: 3,
    description: 'The campus Chick-fil-A. Closed, but the supplies are still inside.',
    gradient: 'from-red-950 to-slate-900',
    areas: [
      {
        id: 'chickfila_counter',
        name: 'Service Counter',
        description: 'Behind the counter, supplies are still stocked.',
        lootTable: [
          { itemId: 'water_gallon', chance: 1 },
          { itemId: 'food_can', chance: 1 },
        ],
      },
      {
        id: 'chickfila_freezer',
        name: 'Back Freezer',
        description: 'The walk-in freezer. Still cold, for now.',
        lootTable: [{ itemId: 'energy_bar', chance: 1 }],
      },
      {
        id: 'chickfila_staff',
        name: 'Staff Room',
        description: 'A small break area behind the kitchen.',
        lootTable: [{ itemId: 'whistle', chance: 1 }],
      },
    ],
  },
  BEARD: {
    id: 'BEARD',
    name: 'Beard Garage (Floors 3-8)',
    elevation: 5,
    description: 'The parking garage rises above the flood line. High ground. Safe for vehicles.',
    gradient: 'from-gray-800 to-gray-900',
    areas: [
      {
        id: 'beard_top',
        name: 'Top Level Lookout',
        description: 'From up here, you can see the storm approaching across the bay.',
        lootTable: [],
        flavorText: 'Nothing to scavenge, but the view is sobering. The storm wall is visible on the horizon.',
      },
    ],
  },
  PIZZO: {
    id: 'PIZZO',
    name: 'Pizzo Elementary',
    elevation: 3,
    description: 'The on-campus FEMA shelter. Other people are already here.',
    gradient: 'from-blue-950 to-slate-900',
    hidden: true,
    areas: [
      {
        id: 'pizzo_supplies',
        name: 'Emergency Supply Room',
        description: 'FEMA-stocked supplies for the shelter.',
        lootTable: [
          { itemId: 'water_gallon', chance: 1 },
          { itemId: 'first_aid_kit', chance: 0.5 },
        ],
      },
      {
        id: 'pizzo_office',
        name: 'School Office',
        description: 'The front office. Emergency contact lists are posted on the wall.',
        lootTable: [{ itemId: 'battery_pack', chance: 0.7 }],
      },
    ],
  },
}
