// Enhanced Car Interface with comprehensive details
export interface Car {
  id: string;
  
  // Basic Data
  make: string;
  model: string;
  name: string; // Display name combining make/model
  
  // Vehicle Type
  vehicleType: 'cabriolet' | 'suv' | 'small-car' | 'van' | 'estate' | 'saloon' | 'sports-coupe' | 'other';
  
  // Capacity
  seats: number;
  doors: number;
  slidingDoor: boolean;
  
  // Type and Condition
  condition: 'new' | 'used' | 'pre-registration' | 'employee' | 'classic' | 'demonstration';
  
  // Purchase Options
  paymentType: 'buy' | 'leasing' | 'finance';
  
  // Vehicle Details
  price: number;
  firstRegistration: number; // Year
  mileage: number; // in km
  huValidMonths: number; // HU validity in months
  numberOfOwners: number;
  fullServiceHistory: boolean;
  roadworthy: boolean;
  newService: boolean;
  
  // Location
  country: string;
  city: string;
  zipCode: string;
  deliveryAvailable: boolean;
  
  // Technical Data
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid' | 'hydrogen' | 'cng' | 'lpg' | 'ethanol';
  power: number; // HP
  cubicCapacity: number; // ccm
  driveType: 'awd' | 'fwd' | 'rwd';
  transmission: 'automatic' | 'semi-automatic' | 'manual';
  
  // Environmental
  emissionClass: 'euro4' | 'euro5' | 'euro6';
  particulateFilter: boolean;
  
  // Exterior
  exteriorColor: string;
  parkingSensors: 'none' | 'front' | 'rear' | '360-camera' | 'self-steering';
  cruiseControl: 'none' | 'cruise' | 'adaptive';
  
  // Interior
  interiorMaterial: 'fabric' | 'part-leather' | 'full-leather' | 'alcantara' | 'velour';
  airConditioning: 'none' | 'manual' | 'automatic' | '2-zone' | '3-plus-zone';
  
  // Features & Extras
  sunroof: boolean;
  trailerCoupling: boolean;
  heatedSeats: boolean;
  navigationSystem: boolean;
  carPlay: boolean;
  alloyWheels: boolean;
  ledHeadlights: boolean;
  laneChangeAssist: boolean;
  emergencyBrakeAssist: boolean;
  
  // Display
  image: string;
  images?: string[];
  year: number; // For compatibility
  isNew?: boolean; // For compatibility
}

// Filter interfaces
export interface CarFilters {
  // Basic Data
  makes: string[];
  models: string[];
  excludeMakes: string[];
  excludeModels: string[];
  
  // Vehicle Type
  vehicleTypes: string[];
  
  // Capacity
  seatsMin: number;
  seatsMax: number;
  doors: 'any' | '2-3' | '4-5';
  slidingDoor: 'any' | 'yes' | 'no';
  
  // Type and Condition
  conditions: string[];
  
  // Purchase Options
  paymentTypes: string[];
  
  // Vehicle Details
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  mileageMin: number;
  mileageMax: number;
  huValidMonths: number;
  numberOfOwners: 'any' | '1' | '2' | '3' | '4+';
  fullServiceHistory: boolean;
  roadworthy: boolean;
  newService: boolean;
  
  // Location
  countries: string[];
  city: string;
  radius: number;
  deliveryAvailable: boolean;
  
  // Technical Data
  fuelTypes: string[];
  powerMin: number;
  powerMax: number;
  cubicCapacityMin: number;
  cubicCapacityMax: number;
  driveTypes: string[];
  transmissions: string[];
  
  // Environmental
  emissionClasses: string[];
  particulateFilter: boolean;
  
  // Exterior
  exteriorColors: string[];
  parkingSensors: string[];
  cruiseControl: string[];
  
  // Interior
  interiorMaterials: string[];
  airConditioning: string[];
  
  // Features & Extras
  sunroof: boolean;
  trailerCoupling: boolean;
  heatedSeats: boolean;
  navigationSystem: boolean;
  carPlay: boolean;
  alloyWheels: boolean;
  ledHeadlights: boolean;
  laneChangeAssist: boolean;
  emergencyBrakeAssist: boolean;
}

// Voice command types
export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}

export interface ConversationState {
  currentStep: string;
  collectedFilters: Partial<CarFilters>;
  pendingConfirmation?: string;
  lastSpoken?: string;
}