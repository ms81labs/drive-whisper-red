export interface WishlistItem {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  desiredSpecs: {
    make?: string;
    model?: string;
    vehicleType?: string;
    condition?: string;
    priceRange?: { min?: number; max?: number };
    yearRange?: { min?: number; max?: number };
    fuelType?: string;
    transmission?: string;
    features?: string[];
    additionalRequirements?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'sourcing' | 'found' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  estimatedPrice?: number;
}

export interface ExternalSearchResult {
  id: string;
  source: string; // 'AutoTrader', 'Cars.com', 'CarGurus', etc.
  url: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  dealer: string;
  availability: 'available' | 'pending' | 'sold';
  images?: string[];
  description?: string;
  features?: string[];
}

export interface OrderRequest {
  id: string;
  wishlistItemId: string;
  clientId: string;
  requestType: 'stock_search' | 'custom_order' | 'external_source';
  specifications: Record<string, any>;
  budget: { min?: number; max?: number };
  timeline: 'asap' | '1-month' | '3-months' | '6-months' | 'flexible';
  status: 'pending' | 'searching' | 'found' | 'ordered' | 'delivered' | 'cancelled';
  assignedTo?: string; // Staff member
  createdAt: Date;
  notes?: string[];
}