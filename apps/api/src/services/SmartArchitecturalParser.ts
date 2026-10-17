export interface ExtractedRoom {
  type: string;
  name?: string;
  area: number; // in square mm
}

export interface ExtractedIntent {
  plotWidth: number; // in mm
  plotDepth: number; // in mm
  rooms: ExtractedRoom[];
  preferences: {
    vastu: boolean;
  };
}

export class SmartArchitecturalParser {
  public static parse(prompt: string): ExtractedIntent {
    const text = prompt.toLowerCase();

    // 1. Detect Bedroom / BHK count
    let bedrooms = 2; // Default
    const bhkMatch = text.match(/(\d+)\s*(?:bhk|bed(?:room)?s?|rooms?|kamre|b\b)/i);
    const wordBedMatch = text.match(/\b(one|two|three|four|five|six|seven|eight)\s*(?:bhk|bed(?:room)?s?|rooms?)\b/i);

    const wordToNum: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8
    };

    if (bhkMatch) {
      bedrooms = Math.max(1, Math.min(8, parseInt(bhkMatch[1], 10)));
    } else if (wordBedMatch) {
      bedrooms = wordToNum[wordBedMatch[1].toLowerCase()] || 2;
    } else if (text.includes('big house') || text.includes('luxury') || text.includes('mansion') || text.includes('huge')) {
      bedrooms = 6;
    } else if (text.includes('villa') || text.includes('bungalow') || text.includes('duplex')) {
      bedrooms = 4;
    } else if (text.includes('small house') || text.includes('studio') || text.includes('1bhk')) {
      bedrooms = 1;
    }

    // 2. Detect Bathroom count
    let bathrooms = 2;
    const bathMatch = text.match(/(\d+)\s*(?:bath(?:room)?s?|washrooms?|toilets?)/i);
    if (bathMatch) {
      bathrooms = Math.max(1, Math.min(8, parseInt(bathMatch[1], 10)));
    } else {
      // Architectural standard ratios
      if (bedrooms === 1) bathrooms = 1;
      else if (bedrooms === 2) bathrooms = 2;
      else if (bedrooms === 3) bathrooms = 2;
      else if (bedrooms === 4) bathrooms = 3;
      else if (bedrooms === 5) bathrooms = 4;
      else if (bedrooms >= 6) bathrooms = 5;
    }

    // 3. Detect Specialty Rooms
    const hasPooja = text.includes('pooja') || text.includes('mandir') || text.includes('temple') || text.includes('prayer');
    const hasStudy = text.includes('study') || text.includes('office') || text.includes('library') || text.includes('work') || bedrooms >= 5;
    const hasDining = text.includes('dining') || bedrooms >= 3;
    const hasBalcony = text.includes('balcony') || text.includes('terrace') || text.includes('sitout') || bedrooms >= 4;
    const hasGym = text.includes('gym') || text.includes('fitness') || text.includes('theater') || text.includes('theatre');
    const hasUtility = text.includes('utility') || text.includes('servant') || text.includes('store') || bedrooms >= 5;

    // 4. Calculate Room Areas in mm²
    const rooms: ExtractedRoom[] = [];

    // Grand Living Room
    let livingArea = 25000000; // 25 m² for 2-3 BHK
    if (bedrooms === 1) livingArea = 18000000;
    else if (bedrooms === 4) livingArea = 32000000;
    else if (bedrooms >= 5) livingArea = 42000000; // 42 m² for luxury/6 BHK
    rooms.push({ type: 'LivingRoom', area: livingArea });

    // Kitchen
    let kitchenArea = 12000000; // 12 m²
    if (bedrooms === 1) kitchenArea = 9000000;
    else if (bedrooms >= 4) kitchenArea = 16000000;
    rooms.push({ type: 'Kitchen', area: kitchenArea });

    // Dining Room
    if (hasDining) {
      rooms.push({ type: 'DiningRoom', area: bedrooms >= 5 ? 20000000 : 15000000 });
    }

    // Bedrooms (Master Bedroom is more spacious)
    for (let i = 0; i < bedrooms; i++) {
      if (i === 0) {
        // Master Bedroom
        const masterArea = bedrooms >= 5 ? 24000000 : (bedrooms >= 3 ? 18000000 : 16000000);
        rooms.push({ type: 'Bedroom', area: masterArea });
      } else {
        // Additional Bedrooms
        const bedArea = bedrooms >= 5 ? 16000000 : 14000000;
        rooms.push({ type: 'Bedroom', area: bedArea });
      }
    }

    // Bathrooms
    for (let j = 0; j < bathrooms; j++) {
      // First bath is master attached bath (more spacious)
      const bathArea = j === 0 ? 6000000 : 5000000;
      rooms.push({ type: 'Bathroom', area: bathArea });
    }

    // Optional Specialty Rooms
    if (hasPooja) {
      rooms.push({ type: 'Pooja', area: 6000000 }); // 6 m²
    }
    if (hasStudy) {
      rooms.push({ type: 'Study', area: 12000000 }); // 12 m²
    }
    if (hasBalcony) {
      rooms.push({ type: 'Balcony', area: 10000000 }); // 10 m²
    }
    if (hasGym) {
      rooms.push({ type: 'Gym', area: 15000000 }); // 15 m²
    }
    if (hasUtility) {
      rooms.push({ type: 'Utility', area: 8000000 }); // 8 m²
    }

    // 5. Detect or Compute Plot Dimensions
    let plotWidth = 15000;
    let plotDepth = 20000;

    // Check for explicit plot dimensions in prompt: e.g. "30x40", "15m x 20m", "25 x 30", "15000 x 20000"
    const dimMatch = text.match(/(\d+)(?:\s*m)?\s*(?:x|\*|by)\s*(\d+)(?:\s*m)?/i);
    if (dimMatch) {
      let w = parseInt(dimMatch[1], 10);
      let d = parseInt(dimMatch[2], 10);
      // If numbers are in meters (e.g. 15 x 20)
      if (w < 100) w = w * 1000;
      if (d < 100) d = d * 1000;
      plotWidth = Math.max(8000, w);
      plotDepth = Math.max(8000, d);
    } else {
      // Architectural standard plot dimensions scaled to house requirements
      if (bedrooms === 1) {
        plotWidth = 12000;
        plotDepth = 15000;
      } else if (bedrooms === 2) {
        plotWidth = 15000;
        plotDepth = 20000;
      } else if (bedrooms === 3) {
        plotWidth = 18000;
        plotDepth = 22000;
      } else if (bedrooms === 4) {
        plotWidth = 22000;
        plotDepth = 25000;
      } else if (bedrooms === 5) {
        plotWidth = 25000;
        plotDepth = 28000;
      } else if (bedrooms >= 6) {
        plotWidth = 30000; // 30m x 32m (960 m²) estate plot for 6 BHK
        plotDepth = 32000;
      }
    }

    // Ensure plot is always large enough for total room areas with 30% margin
    const totalRoomArea = rooms.reduce((sum, r) => sum + r.area, 0);
    const minPlotArea = totalRoomArea * 1.35;
    if (plotWidth * plotDepth < minPlotArea) {
      const scaleFactor = Math.sqrt(minPlotArea / (plotWidth * plotDepth));
      plotWidth = Math.ceil((plotWidth * scaleFactor) / 1000) * 1000;
      plotDepth = Math.ceil((plotDepth * scaleFactor) / 1000) * 1000;
    }

    const vastu = text.includes('vastu') || true; // Default vastu enabled for Indian architectural planning

    return {
      plotWidth,
      plotDepth,
      rooms,
      preferences: { vastu }
    };
  }
}
