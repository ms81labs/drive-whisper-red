/**
 * Validation Schemas for ConvAI
 * 
 * This module provides Zod schemas for validating inputs to client tools
 * and a helper function to simplify validation. It includes common primitives
 * and domain-specific schemas for car dealership operations.
 * 
 * @module convai/validators
 */

import { z } from 'zod';

// ==============================
// Error Handling
// ==============================

/**
 * Custom validation error with improved formatting
 */
export class ValidationError extends Error {
  errors: z.ZodError;
  
  constructor(errors: z.ZodError) {
    const message = formatZodError(errors);
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Format a Zod error into a readable message
 * 
 * @param error Zod error object
 * @returns Formatted error message
 */
function formatZodError(error: z.ZodError): string {
  return error.errors
    .map(err => {
      const path = err.path.join('.');
      return `${path ? path + ': ' : ''}${err.message}`;
    })
    .join('; ');
}

// ==============================
// Validation Helper
// ==============================

/**
 * Validate data against a schema
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

// ==============================
// Common Primitive Schemas
// ==============================

/**
 * Common primitive schemas
 */
export const primitives = {
  /**
   * Non-empty string
   */
  nonEmptyString: z.string().min(1, 'Cannot be empty'),
  
  /**
   * Email address
   */
  email: z.string().email('Invalid email address'),
  
  /**
   * Phone number (simple format validation)
   */
  phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format'),
  
  /**
   * URL
   */
  url: z.string().url('Invalid URL'),
  
  /**
   * Date string in ISO format
   */
  isoDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  /**
   * Time string in 24-hour format
   */
  time24: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  
  /**
   * Positive integer
   */
  positiveInt: z.number().int('Must be an integer').positive('Must be positive'),
  
  /**
   * Non-negative integer (zero or positive)
   */
  nonNegativeInt: z.number().int('Must be an integer').nonnegative('Must be zero or positive'),
  
  /**
   * Price (non-negative number with up to 2 decimal places)
   */
  price: z.number()
    .nonnegative('Price must be zero or positive')
    .transform(val => parseFloat(val.toFixed(2))),
  
  /**
   * Year (four-digit positive integer)
   */
  year: z.number()
    .int('Year must be an integer')
    .positive('Year must be positive')
    .refine(val => val >= 1900 && val <= 2100, 'Year must be between 1900 and 2100'),
  
  /**
   * UUID
   */
  uuid: z.string().uuid('Invalid UUID format'),
};

// ==============================
// ID Schemas
// ==============================

/**
 * ID validation schemas
 */
export const id = {
  /**
   * Generic ID (alphanumeric with hyphens)
   */
  genericId: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid ID format'),
  
  /**
   * Car ID
   */
  carId: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid car ID format'),
  
  /**
   * User ID
   */
  userId: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid user ID format'),
  
  /**
   * Order ID
   */
  orderId: z.string().regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid order ID format'),
};

// ==============================
// Car Dealership Schemas
// ==============================

/**
 * Car condition enum
 */
export const carConditionEnum = z.enum(['new', 'used', 'all']);

/**
 * Car transmission enum
 */
export const transmissionEnum = z.enum(['automatic', 'manual', 'semi-automatic', 'any']);

/**
 * Fuel type enum
 */
export const fuelTypeEnum = z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in hybrid', 'any']);

/**
 * Vehicle type enum
 */
export const vehicleTypeEnum = z.enum([
  'sedan', 'suv', 'truck', 'coupe', 'convertible', 
  'hatchback', 'wagon', 'van', 'minivan', 'any'
]);

/**
 * Common car makes
 */
export const carMakeEnum = z.enum([
  'audi', 'bmw', 'chevrolet', 'dodge', 'ferrari', 'ford', 
  'honda', 'hyundai', 'jaguar', 'jeep', 'kia', 'lamborghini', 
  'lexus', 'mazda', 'mercedes', 'nissan', 'porsche', 'subaru', 
  'tesla', 'toyota', 'volkswagen', 'volvo', 'other'
]);

/**
 * Car search parameters schema
 */
export const carSearchSchema = z.object({
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
  condition: carConditionEnum.optional(),
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
 * Car comparison schema
 */
export const carCompareSchema = z.object({
  carIds: z.array(id.carId).min(2, 'Must compare at least 2 cars').max(4, 'Can compare at most 4 cars'),
});

/**
 * Test drive scheduling schema
 */
export const testDriveSchema = z.object({
  carId: id.carId,
  date: primitives.isoDate.optional(),
  time: primitives.time24.optional(),
  name: primitives.nonEmptyString.optional(),
  email: primitives.email.optional(),
  phone: primitives.phone.optional(),
});

/**
 * Finance calculator schema
 */
export const financeSchema = z.object({
  carId: id.carId,
  downPayment: primitives.nonNegativeInt.optional(),
  termMonths: z.number().int().min(12, 'Term must be at least 12 months').max(84, 'Term cannot exceed 84 months').optional(),
  interestRate: z.number().nonnegative().max(30, 'Interest rate cannot exceed 30%').optional(),
});

/**
 * Price range schema
 */
export const priceRangeSchema = z.object({
  minPrice: primitives.nonNegativeInt.optional(),
  maxPrice: primitives.positiveInt.optional(),
}).refine(data => {
  if (data.minPrice !== undefined && data.maxPrice !== undefined) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "Minimum price must be less than or equal to maximum price",
});

/**
 * Year range schema
 */
export const yearRangeSchema = z.object({
  minYear: primitives.year.optional(),
  maxYear: primitives.year.optional(),
}).refine(data => {
  if (data.minYear !== undefined && data.maxYear !== undefined) {
    return data.minYear <= data.maxYear;
  }
  return true;
}, {
  message: "Minimum year must be less than or equal to maximum year",
});

/**
 * Make and model schema
 */
export const makeModelSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().optional(),
});

/**
 * Vehicle filter schema
 */
export const vehicleFilterSchema = z.object({
  vehicleType: vehicleTypeEnum,
});

/**
 * Fuel type filter schema
 */
export const fuelTypeFilterSchema = z.object({
  fuelType: fuelTypeEnum,
});

/**
 * Transmission filter schema
 */
export const transmissionFilterSchema = z.object({
  transmission: transmissionEnum,
});

/**
 * Car search query schema
 */
export const carSearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

// ==============================
// Schema Bundles
// ==============================

/**
 * Car dealership schemas bundle
 */
export const carDealershipSchemas = {
  search: carSearchSchema,
  compare: carCompareSchema,
  testDrive: testDriveSchema,
  finance: financeSchema,
  priceRange: priceRangeSchema,
  yearRange: yearRangeSchema,
  makeModel: makeModelSchema,
  vehicleFilter: vehicleFilterSchema,
  fuelTypeFilter: fuelTypeFilterSchema,
  transmissionFilter: transmissionFilterSchema,
  searchQuery: carSearchQuerySchema,
  condition: carConditionEnum,
  transmission: transmissionEnum,
  fuelType: fuelTypeEnum,
  vehicleType: vehicleTypeEnum,
  carMake: carMakeEnum,
};

// ==============================
// Schema Factory Functions
// ==============================

/**
 * Create a pagination schema
 * 
 * @param maxLimit Maximum items per page
 * @returns Pagination schema
 */
export function createPaginationSchema(maxLimit = 100) {
  return z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(maxLimit).default(20),
  });
}

/**
 * Create a sort schema
 * 
 * @param allowedFields Array of allowed sort fields
 * @returns Sort schema
 */
export function createSortSchema(allowedFields: string[]) {
  return z.object({
    sortBy: z.enum(allowedFields as [string, ...string[]]).default(allowedFields[0]),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  });
}

/**
 * Create a filter schema with type safety
 * 
 * @param filterSchema Base schema to extend with filter options
 * @returns Extended filter schema
 */
export function createFilterSchema<T extends z.ZodRawShape>(filterSchema: z.ZodObject<T>) {
  return filterSchema.extend({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  });
}

// ==============================
// Exports
// ==============================

/**
 * Export all schemas
 */
export const schemas = {
  primitives,
  id,
  carDealership: carDealershipSchemas,
  carCondition: carConditionEnum,
  transmission: transmissionEnum,
  fuelType: fuelTypeEnum,
  vehicleType: vehicleTypeEnum,
  carMake: carMakeEnum,
};

export default {
  validate,
  schemas,
};
