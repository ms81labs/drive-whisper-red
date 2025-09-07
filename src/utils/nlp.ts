import { CarFilters, VoiceCommand } from '@/types/car';

// Keyword mappings for natural language processing
const KEYWORD_MAPPINGS = {
  makes: {
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    'bmw': 'BMW',
    'mercedes': 'Mercedes',
    'benz': 'Mercedes',
    'audi': 'Audi',
    'toyota': 'Toyota',
    'ford': 'Ford',
    'porsche': 'Porsche',
    'tesla': 'Tesla',
    'lamborghini': 'Lamborghini',
    'ferrari': 'Ferrari',
  },
  
  vehicleTypes: {
    'suv': 'suv',
    'sports utility vehicle': 'suv',
    'off-road': 'suv',
    'pickup': 'suv',
    'saloon': 'saloon',
    'sedan': 'saloon',
    'coupe': 'sports-coupe',
    'sports car': 'sports-coupe',
    'estate': 'estate',
    'wagon': 'estate',
    'small car': 'small-car',
    'hatchback': 'small-car',
    'cabriolet': 'cabriolet',
    'convertible': 'cabriolet',
    'roadster': 'cabriolet',
    'van': 'van',
    'minibus': 'van',
  },
  
  conditions: {
    'new': 'new',
    'used': 'used',
    'second hand': 'used',
    'pre-registration': 'pre-registration',
    'demo': 'demonstration',
    'demonstration': 'demonstration',
    'classic': 'classic',
    'vintage': 'classic',
  },
  
  fuelTypes: {
    'petrol': 'petrol',
    'gas': 'petrol',
    'gasoline': 'petrol',
    'diesel': 'diesel',
    'electric': 'electric',
    'ev': 'electric',
    'hybrid': 'hybrid',
    'plug-in hybrid': 'plug-in-hybrid',
    'phev': 'plug-in-hybrid',
    'hydrogen': 'hydrogen',
    'natural gas': 'cng',
    'cng': 'cng',
    'lpg': 'lpg',
    'ethanol': 'ethanol',
  },
  
  transmissions: {
    'automatic': 'automatic',
    'auto': 'automatic',
    'manual': 'manual',
    'stick shift': 'manual',
    'semi-automatic': 'semi-automatic',
    'semi auto': 'semi-automatic',
  },
  
  driveTypes: {
    'all wheel drive': 'awd',
    'awd': 'awd',
    '4wd': 'awd',
    'front wheel drive': 'fwd',
    'fwd': 'fwd',
    'rear wheel drive': 'rwd',
    'rwd': 'rwd',
  },
  
  features: {
    'heated seats': 'heatedSeats',
    'navigation': 'navigationSystem',
    'nav': 'navigationSystem',
    'gps': 'navigationSystem',
    'sunroof': 'sunroof',
    'panoramic roof': 'sunroof',
    'apple carplay': 'carPlay',
    'android auto': 'carPlay',
    'alloy wheels': 'alloyWheels',
    'led headlights': 'ledHeadlights',
    'led lights': 'ledHeadlights',
    'lane assist': 'laneChangeAssist',
    'emergency brake': 'emergencyBrakeAssist',
    'trailer coupling': 'trailerCoupling',
    'tow bar': 'trailerCoupling',
  },
  
  colors: {
    'black': 'Black',
    'white': 'White',
    'silver': 'Silver',
    'grey': 'Grey',
    'gray': 'Grey',
    'blue': 'Blue',
    'red': 'Red',
    'brown': 'Brown',
    'green': 'Green',
    'orange': 'Orange',
    'yellow': 'Yellow',
    'beige': 'Beige',
    'gold': 'Gold',
    'purple': 'Purple',
  }
};

// Price and number extraction patterns
const PRICE_PATTERNS = [
  /(?:under|less than|below|max|maximum)\s*(?:€|euros?|euro)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
  /(?:over|more than|above|min|minimum)\s*(?:€|euros?|euro)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
  /(?:between|from)\s*(?:€|euros?|euro)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:to|and|-)\s*(?:€|euros?|euro)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
  /(?:€|euros?|euro)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
];

const YEAR_PATTERNS = [
  /(?:from|after|since)\s*(\d{4})/i,
  /(?:before|until)\s*(\d{4})/i,
  /(?:between|from)\s*(\d{4})\s*(?:to|and|-)\s*(\d{4})/i,
  /(\d{4})/i,
];

const MILEAGE_PATTERNS = [
  /(?:under|less than|below)\s*(\d+(?:,\d{3})*)\s*(?:km|kilometers?|miles?|mi)?/i,
  /(?:over|more than|above)\s*(\d+(?:,\d{3})*)\s*(?:km|kilometers?|miles?|mi)?/i,
  /(\d+(?:,\d{3})*)\s*(?:km|kilometers?|miles?|mi)/i,
];

export function parseVoiceCommand(text: string): VoiceCommand {
  const normalizedText = text.toLowerCase().trim();
  const entities: Record<string, any> = {};
  
  // Extract makes
  const makes = extractKeywords(normalizedText, KEYWORD_MAPPINGS.makes);
  if (makes.length > 0) entities.makes = makes;
  
  // Extract vehicle types
  const vehicleTypes = extractKeywords(normalizedText, KEYWORD_MAPPINGS.vehicleTypes);
  if (vehicleTypes.length > 0) entities.vehicleTypes = vehicleTypes;
  
  // Extract conditions
  const conditions = extractKeywords(normalizedText, KEYWORD_MAPPINGS.conditions);
  if (conditions.length > 0) entities.conditions = conditions;
  
  // Extract fuel types
  const fuelTypes = extractKeywords(normalizedText, KEYWORD_MAPPINGS.fuelTypes);
  if (fuelTypes.length > 0) entities.fuelTypes = fuelTypes;
  
  // Extract transmissions
  const transmissions = extractKeywords(normalizedText, KEYWORD_MAPPINGS.transmissions);
  if (transmissions.length > 0) entities.transmissions = transmissions;
  
  // Extract drive types
  const driveTypes = extractKeywords(normalizedText, KEYWORD_MAPPINGS.driveTypes);
  if (driveTypes.length > 0) entities.driveTypes = driveTypes;
  
  // Extract features
  const features = extractFeatures(normalizedText);
  if (Object.keys(features).length > 0) entities.features = features;
  
  // Extract colors
  const colors = extractKeywords(normalizedText, KEYWORD_MAPPINGS.colors);
  if (colors.length > 0) entities.colors = colors;
  
  // Extract price range
  const priceRange = extractPriceRange(normalizedText);
  if (priceRange) entities.priceRange = priceRange;
  
  // Extract year range
  const yearRange = extractYearRange(normalizedText);
  if (yearRange) entities.yearRange = yearRange;
  
  // Extract mileage
  const mileage = extractMileage(normalizedText);
  if (mileage) entities.mileage = mileage;
  
  // Determine intent
  const intent = determineIntent(normalizedText, entities);
  
  return {
    intent,
    entities,
    confidence: calculateConfidence(entities, normalizedText),
  };
}

function extractKeywords(text: string, keywordMap: Record<string, string>): string[] {
  const found: string[] = [];
  
  for (const [keyword, value] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      found.push(value);
    }
  }
  
  return [...new Set(found)]; // Remove duplicates
}

function extractFeatures(text: string): Record<string, boolean> {
  const features: Record<string, boolean> = {};
  
  for (const [keyword, feature] of Object.entries(KEYWORD_MAPPINGS.features)) {
    if (text.includes(keyword)) {
      features[feature] = true;
    }
  }
  
  return features;
}

function extractPriceRange(text: string): { min?: number; max?: number } | null {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (text.includes('under') || text.includes('less than') || text.includes('below') || text.includes('max')) {
        return { max: parseNumber(match[1]) };
      } else if (text.includes('over') || text.includes('more than') || text.includes('above') || text.includes('min')) {
        return { min: parseNumber(match[1]) };
      } else if (match[2]) {
        return { min: parseNumber(match[1]), max: parseNumber(match[2]) };
      } else {
        return { max: parseNumber(match[1]) }; // Default to max if single number
      }
    }
  }
  return null;
}

function extractYearRange(text: string): { min?: number; max?: number } | null {
  for (const pattern of YEAR_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      if (text.includes('from') || text.includes('after') || text.includes('since')) {
        return { min: parseInt(match[1]) };
      } else if (text.includes('before') || text.includes('until')) {
        return { max: parseInt(match[1]) };
      } else if (match[2]) {
        return { min: parseInt(match[1]), max: parseInt(match[2]) };
      } else {
        return { min: parseInt(match[1]) };
      }
    }
  }
  return null;
}

function extractMileage(text: string): { min?: number; max?: number } | null {
  for (const pattern of MILEAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = parseNumber(match[1]);
      if (text.includes('under') || text.includes('less than') || text.includes('below')) {
        return { max: value };
      } else if (text.includes('over') || text.includes('more than') || text.includes('above')) {
        return { min: value };
      } else {
        return { max: value }; // Default to max for single number
      }
    }
  }
  return null;
}

function parseNumber(str: string): number {
  return parseInt(str.replace(/,/g, ''));
}

function determineIntent(text: string, entities: Record<string, any>): string {
  if (text.includes('find') || text.includes('search') || text.includes('show') || text.includes('looking for')) {
    return 'search_cars';
  } else if (text.includes('compare') || text.includes('comparison')) {
    return 'compare_cars';
  } else if (text.includes('detail') || text.includes('more info') || text.includes('tell me about')) {
    return 'car_details';
  } else if (text.includes('reset') || text.includes('clear') || text.includes('start over')) {
    return 'reset_filters';
  } else if (text.includes('yes') || text.includes('correct') || text.includes('right')) {
    return 'confirm';
  } else if (text.includes('no') || text.includes('wrong') || text.includes('change')) {
    return 'deny';
  } else if (Object.keys(entities).length > 0) {
    return 'specify_filters';
  } else {
    return 'unknown';
  }
}

function calculateConfidence(entities: Record<string, any>, text: string): number {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on number of recognized entities
  confidence += Object.keys(entities).length * 0.1;
  
  // Increase confidence for specific keywords
  const confidenceKeywords = ['find', 'search', 'looking for', 'want', 'need', 'show me'];
  for (const keyword of confidenceKeywords) {
    if (text.toLowerCase().includes(keyword)) {
      confidence += 0.2;
      break;
    }
  }
  
  return Math.min(confidence, 1.0);
}

// Apply parsed entities to filters
export function applyEntitiesToFilters(entities: Record<string, any>, currentFilters: Partial<CarFilters>): Partial<CarFilters> {
  const updatedFilters = { ...currentFilters };
  
  if (entities.makes) {
    updatedFilters.makes = [...(updatedFilters.makes || []), ...entities.makes];
  }
  
  if (entities.vehicleTypes) {
    updatedFilters.vehicleTypes = [...(updatedFilters.vehicleTypes || []), ...entities.vehicleTypes];
  }
  
  if (entities.conditions) {
    updatedFilters.conditions = [...(updatedFilters.conditions || []), ...entities.conditions];
  }
  
  if (entities.fuelTypes) {
    updatedFilters.fuelTypes = [...(updatedFilters.fuelTypes || []), ...entities.fuelTypes];
  }
  
  if (entities.transmissions) {
    updatedFilters.transmissions = [...(updatedFilters.transmissions || []), ...entities.transmissions];
  }
  
  if (entities.driveTypes) {
    updatedFilters.driveTypes = [...(updatedFilters.driveTypes || []), ...entities.driveTypes];
  }
  
  if (entities.colors) {
    updatedFilters.exteriorColors = [...(updatedFilters.exteriorColors || []), ...entities.colors];
  }
  
  if (entities.features) {
    Object.entries(entities.features).forEach(([key, value]) => {
      (updatedFilters as any)[key] = value;
    });
  }
  
  if (entities.priceRange) {
    if (entities.priceRange.min !== undefined) {
      updatedFilters.priceMin = entities.priceRange.min;
    }
    if (entities.priceRange.max !== undefined) {
      updatedFilters.priceMax = entities.priceRange.max;
    }
  }
  
  if (entities.yearRange) {
    if (entities.yearRange.min !== undefined) {
      updatedFilters.yearMin = entities.yearRange.min;
    }
    if (entities.yearRange.max !== undefined) {
      updatedFilters.yearMax = entities.yearRange.max;
    }
  }
  
  if (entities.mileage) {
    if (entities.mileage.min !== undefined) {
      updatedFilters.mileageMin = entities.mileage.min;
    }
    if (entities.mileage.max !== undefined) {
      updatedFilters.mileageMax = entities.mileage.max;
    }
  }
  
  return updatedFilters;
}