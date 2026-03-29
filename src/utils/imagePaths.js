export function getLocationImagePath(locationId, phase, timeUntilLandfall) {
  const loc = locationId.toLowerCase();

  if (locationId === 'BEARD') {
    return '/locations/placeholders/beard parking clean.jpg';
  }
  if (locationId === 'PIZZO') {
    return '/locations/placeholders/pizzo clean.png';
  }

  if (phase === 'gauntlet') {
    if (['msc', 'library', 'muma'].includes(loc)) {
      return `/locations/Gauntlet - shelter images/${loc} gauntlet shelter.png`;
    }
    return null;
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
