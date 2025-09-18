/**
 * Car Dealership Client Tools for ElevenLabs ConvAI
 * 
 * This module provides specialized client tools for car dealership websites,
 * specifically tailored for the RedLine Motors application. It includes
 * tools for browsing inventory, filtering cars, managing wishlist,
 * comparing vehicles, and other dealership-specific actions.
 * 
 * @module convai/clientTools.carDealership
 */

import { NavigateFunction } from 'react-router-dom';
import { z } from 'zod';
import { validate, schemas } from './validators';
// import { Car } from '@/types/car'; // Import not currently used; commented to avoid build issues

// ==============================
// Types
// ==============================

/**
 * Car search parameters
 */
export interface CarSearchParams {
  /** Search query text */
  query?: string;
  /** Car make (manufacturer) */
  make?: string;
  /** Car model */
  model?: string;
  /** Minimum price */
  minPrice?: number;
  /** Maximum price */
  maxPrice?: number;
  /** Minimum year */
  minYear?: number;
  /** Maximum year */
  maxYear?: number;
  /** Vehicle type (SUV, sedan, etc.) */
  vehicleType?: string;
  /** Fuel type */
  fuelType?: string;
  /** Transmission type */
  transmission?: string;
  /** Minimum number of seats */
  minSeats?: number;
  /** Maximum number of seats */
  maxSeats?: number;
  /** New or used condition */
  condition?: 'new' | 'used' | 'all';
}

/**
 * Car comparison parameters
 */
export interface CarCompareParams {
  /** IDs of cars to compare */
  carIds: string[];
}

/**
 * Test drive scheduling parameters
 */
export interface TestDriveParams {
  /** Car ID to schedule test drive for */
  carId: string;
  /** Preferred date (ISO string) */
  date?: string;
  /** Preferred time */
  time?: string;
  /** Customer name */
  name?: string;
  /** Customer email */
  email?: string;
  /** Customer phone */
  phone?: string;
}

/**
 * Finance calculator parameters
 */
export interface FinanceParams {
  /** Car ID to calculate financing for */
  carId: string;
  /** Down payment amount */
  downPayment?: number;
  /** Loan term in months */
  termMonths?: number;
  /** Annual interest rate (percentage) */
  interestRate?: number;
}

// ==============================
// Validation Schemas
// ==============================

/**
 * Car search validation schema
 */
const carSearchSchema = z.object({
  query: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  minYear: z.number().int().positive().optional(),
  maxYear: z.number().int().positive().optional(),
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  minSeats: z.number().int().positive().optional(),
  maxSeats: z.number().int().positive().optional(),
  condition: z.enum(['new', 'used', 'all']).optional(),
}).refine(data => {
  // If both min and max are provided, ensure min <= max
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  if (data.minYear !== undefined && data.maxYear !== undefined) {
    return data.minYear <= data.maxYear;
  }
  if (data.minSeats !== undefined && data.maxSeats !== undefined) {
    return data.minSeats <= data.maxSeats;
  }
  return true;
}, {
  message: "Minimum values must be less than or equal to maximum values",
});

/**
 * Car comparison validation schema
 */
const carCompareSchema = z.object({
  carIds: z.array(z.string()).min(2).max(4),
});

/**
 * Test drive validation schema
 */
const testDriveSchema = z.object({
  carId: z.string(),
  date: z.string().optional(),
  time: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

/**
 * Finance calculator validation schema
 */
const financeSchema = z.object({
  carId: z.string(),
  downPayment: z.number().nonnegative().optional(),
  termMonths: z.number().int().positive().optional(),
  interestRate: z.number().nonnegative().optional(),
});

// ==============================
// Helper Functions
// ==============================

/**
 * Build query string from search parameters
 */
function buildSearchQueryString(params: CarSearchParams): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  return queryParams.toString();
}

/**
 * Dispatch a custom event
 */
function dispatchCustomEvent(eventName: string, detail: any = {}): void {
  try {
    const event = new CustomEvent(eventName, { detail, bubbles: true });
    window.dispatchEvent(event);
  } catch (error) {
    console.error(`Error dispatching event "${eventName}":`, error);
  }
}

// ==============================
// Car Dealership Client Tools
// ==============================

/**
 * Create car dealership client tools
 * 
 * @param deps Dependencies required by the tools
 * @returns Object containing all car dealership client tools
 */
export function createCarDealershipTools({ navigate }: { navigate: NavigateFunction }) {
  return {
    /**
     * Browse car inventory with optional filters
     * 
     * @param params Search parameters
     * @returns Success message
     */
    browseInventory: (params: CarSearchParams = {}) => {
      validate(carSearchSchema, params);
      
      const queryString = buildSearchQueryString(params);
      navigate(`/inventory${queryString ? `?${queryString}` : ''}`);
      
      // Build a user-friendly response
      const filters = [];
      if (params.make) filters.push(`${params.make}`);
      if (params.model) filters.push(`${params.model}`);
      if (params.minPrice) filters.push(`above $${params.minPrice}`);
      if (params.maxPrice) filters.push(`under $${params.maxPrice}`);
      if (params.condition) filters.push(params.condition);
      
      const filterText = filters.length > 0 
        ? ` with filters: ${filters.join(', ')}`
        : '';
      
      return `Browsing car inventory${filterText}`;
    },
    
    /**
     * View details of a specific car
     * 
     * @param params Car parameters
     * @returns Success message
     */
    viewCarDetails: (params: { carId: string }) => {
      validate(z.object({ carId: z.string() }), params);
      
      navigate(`/car/${params.carId}`);
      return `Viewing details for car ${params.carId}`;
    },
    
    /**
     * Compare multiple cars
     * 
     * @param params Comparison parameters
     * @returns Success message
     */
    compareCars: (params: CarCompareParams) => {
      validate(carCompareSchema, params);
      
      const queryString = params.carIds.map(id => `ids=${id}`).join('&');
      navigate(`/compare?${queryString}`);
      
      return `Comparing ${params.carIds.length} cars`;
    },
    
    /**
     * Add a car to wishlist
     * 
     * @param params Wishlist parameters
     * @returns Success message
     */
    addToWishlist: (params: { carId: string }) => {
      validate(z.object({ carId: z.string() }), params);
      
      // Dispatch wishlist event for the application to handle
      dispatchCustomEvent('wishlist-add', { carId: params.carId });
      
      return `Added car ${params.carId} to your wishlist`;
    },
    
    /**
     * Remove a car from wishlist
     * 
     * @param params Wishlist parameters
     * @returns Success message
     */
    removeFromWishlist: (params: { carId: string }) => {
      validate(z.object({ carId: z.string() }), params);
      
      // Dispatch wishlist event for the application to handle
      dispatchCustomEvent('wishlist-remove', { carId: params.carId });
      
      return `Removed car ${params.carId} from your wishlist`;
    },
    
    /**
     * View wishlist
     * 
     * @returns Success message
     */
    viewWishlist: () => {
      navigate('/wishlist');
      return 'Opening your wishlist';
    },
    
    /**
     * Schedule a test drive
     * 
     * @param params Test drive parameters
     * @returns Success message
     */
    scheduleTestDrive: (params: TestDriveParams) => {
      validate(testDriveSchema, params);
      
      // Dispatch test drive event for the application to handle
      dispatchCustomEvent('schedule-test-drive', params);
      
      // Could also navigate to a confirmation page
      navigate(`/test-drive-scheduled?carId=${params.carId}`);
      
      return `Test drive scheduled for car ${params.carId}`;
    },
    
    /**
     * Calculate car financing
     * 
     * @param params Finance parameters
     * @returns Success message with monthly payment
     */
    calculateFinancing: (params: FinanceParams) => {
      validate(financeSchema, params);
      
      // In a real implementation, this would call an API or use a formula
      // For demo purposes, we'll just navigate to a finance calculator page
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      navigate(`/finance-calculator?${queryParams.toString()}`);
      
      return `Calculating financing options for car ${params.carId}`;
    },
    
    /**
     * Search for cars by text query
     * 
     * @param params Search parameters
     * @returns Success message
     */
    searchCars: (params: { query: string }) => {
      validate(z.object({ query: z.string().min(1) }), params);
      
      navigate(`/inventory?query=${encodeURIComponent(params.query)}`);
      
      return `Searching for "${params.query}"`;
    },
    
    /**
     * Filter cars by specific criteria
     * 
     * @param params Filter parameters
     * @returns Success message
     */
    filterCars: (params: CarSearchParams) => {
      validate(carSearchSchema, params);
      
      const queryString = buildSearchQueryString(params);
      navigate(`/inventory?${queryString}`);
      
      // Build a descriptive response
      const filters = [];
      if (params.make) filters.push(`make: ${params.make}`);
      if (params.model) filters.push(`model: ${params.model}`);
      if (params.minPrice && params.maxPrice) {
        filters.push(`price: $${params.minPrice} - $${params.maxPrice}`);
      } else if (params.minPrice) {
        filters.push(`price: from $${params.minPrice}`);
      } else if (params.maxPrice) {
        filters.push(`price: up to $${params.maxPrice}`);
      }
      
      return `Filtering cars by ${filters.join(', ')}`;
    },
    
    /**
     * Get directions to the dealership
     * 
     * @returns Success message
     */
    getDealershipDirections: () => {
      // In a real implementation, this might open a maps integration
      // For demo purposes, we'll navigate to a contact page
      navigate('/contact');
      
      return 'Showing directions to our dealership';
    },
    
    /**
     * Contact the dealership
     * 
     * @returns Success message
     */
    contactDealership: () => {
      navigate('/contact');
      return 'Opening contact information for our dealership';
    },
    
    /**
     * View special offers and promotions
     * 
     * @returns Success message
     */
    viewSpecialOffers: () => {
      navigate('/special-offers');
      return 'Showing current special offers and promotions';
    },
    
    /**
     * View new arrivals
     * 
     * @returns Success message
     */
    viewNewArrivals: () => {
      navigate('/inventory?sort=newest');
      return 'Showing our newest vehicles';
    },
    
    /**
     * Filter by price range
     * 
     * @param params Price range parameters
     * @returns Success message
     */
    filterByPriceRange: (params: { minPrice?: number; maxPrice?: number }) => {
      validate(z.object({
        minPrice: z.number().nonnegative().optional(),
        maxPrice: z.number().positive().optional(),
      }), params);
      
      const queryParams = new URLSearchParams();
      if (params.minPrice !== undefined) {
        queryParams.append('minPrice', String(params.minPrice));
      }
      if (params.maxPrice !== undefined) {
        queryParams.append('maxPrice', String(params.maxPrice));
      }
      
      navigate(`/inventory?${queryParams.toString()}`);
      
      // Build a descriptive response
      let message = 'Showing cars';
      if (params.minPrice !== undefined && params.maxPrice !== undefined) {
        message += ` between $${params.minPrice} and $${params.maxPrice}`;
      } else if (params.minPrice !== undefined) {
        message += ` above $${params.minPrice}`;
      } else if (params.maxPrice !== undefined) {
        message += ` under $${params.maxPrice}`;
      }
      
      return message;
    },
    
    /**
     * Filter by vehicle type
     * 
     * @param params Vehicle type parameters
     * @returns Success message
     */
    filterByVehicleType: (params: { vehicleType: string }) => {
      validate(z.object({ vehicleType: z.string() }), params);
      
      navigate(`/inventory?vehicleType=${encodeURIComponent(params.vehicleType)}`);
      
      return `Showing ${params.vehicleType} vehicles`;
    },
    
    /**
     * Filter by make and model
     * 
     * @param params Make and model parameters
     * @returns Success message
     */
    filterByMakeModel: (params: { make: string; model?: string }) => {
      validate(z.object({
        make: z.string(),
        model: z.string().optional(),
      }), params);
      
      const queryParams = new URLSearchParams();
      queryParams.append('make', params.make);
      if (params.model) {
        queryParams.append('model', params.model);
      }
      
      navigate(`/inventory?${queryParams.toString()}`);
      
      return params.model 
        ? `Showing ${params.make} ${params.model} vehicles` 
        : `Showing all ${params.make} vehicles`;
    },
  };
}

/**
 * Export a factory function that creates the car dealership client tools
 * with just the navigate function for simpler usage
 */
export function carDealershipTools({ navigate }: { navigate: NavigateFunction }) {
  return createCarDealershipTools({ navigate });
}

export default carDealershipTools;
