export function getLocationImagePath(locationId, phase, timeUntilLandfall) {
  const loc = locationId.toLowerCase();

  if (loc === 'pizzo') {
    return '/locations/placeholders/pizzo clean.png';
  }

  if (phase === 'gauntlet') {
    if (['msc', 'library', 'muma'].includes(loc)) {
      return `/locations/Gauntlet - shelter images/${loc} gauntlet shelter.png`;
    }
    // Fallback for gauntlet if no specific image exists
    return `/locations/Gathering - stage 3 images/${loc} stage 3.png`;
  }

  // Gathering or Sprint phase
  let stage = 1;
  if (timeUntilLandfall < 4) {
    stage = 3;
  } else if (timeUntilLandfall <= 7) {
    stage = 2;
  }

  if (stage === 3 && loc === 'muma') {
    return `/locations/Gathering - stage 3 images/Muma stage 3.png`;
  }

  return `/locations/Gathering - stage ${stage} images/${loc} stage ${stage}.png`;
}

export function getLocationOverlayStyle(locationId, phase, timeUntilLandfall) {
  const loc = locationId?.toLowerCase();
  if (loc !== 'pizzo') return {};

  if (phase === 'gauntlet') {
    return { filter: 'brightness(0.3) contrast(1.2) sepia(0.4) hue-rotate(180deg)' };
  }

  let stage = 1;
  if (timeUntilLandfall < 4) {
    stage = 3;
  } else if (timeUntilLandfall <= 7) {
    stage = 2;
  }

  if (stage === 1) {
    return { filter: 'brightness(0.85) contrast(1.05)' };
  } else if (stage === 2) {
    return { filter: 'brightness(0.5) contrast(1.1) sepia(0.2) hue-rotate(180deg)' };
  } else if (stage === 3) {
    return { filter: 'brightness(0.35) contrast(1.2) sepia(0.4) hue-rotate(180deg)' };
  }

  return {};
}
