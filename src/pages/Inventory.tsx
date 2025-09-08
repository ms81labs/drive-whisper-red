import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Search, Filter, Grid3x3, List, ChevronLeft, ChevronRight, Car as CarIcon, Fuel, Settings, X, Mic } from 'lucide-react';
import { VoiceProvider } from '@/components/VoiceProvider';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceSearchAssistant } from '@/components/VoiceSearchAssistant';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { Link } from 'react-router-dom';
import { CarCardSkeleton } from '@/components/ui/skeleton';
import { LoadingOverlay } from '@/components/ui/loading-spinner';
import { useLoading, simulateNetworkDelay } from '@/hooks/use-loading';
import { toast } from '@/hooks/use-toast';
import { sampleCars } from '@/data/cars';
import { Car, CarFilters } from '@/types/car';

const Inventory = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [filters, setFilters] = useState<Partial<CarFilters>>({
    priceMin: 0,
    priceMax: 500000,
    makes: [],
    vehicleTypes: [],
    conditions: [],
    fuelTypes: [],
    transmissions: [],
  });
  const { isLoading, withLoading } = useLoading();
  const [initialLoad, setInitialLoad] = useState(true);

  const allCars = sampleCars;

  // Enhanced search functionality with NLP
  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      // Text search
      if (searchTerm) {
        const searchText = `${car.name} ${car.make} ${car.vehicleType} ${car.year}`.toLowerCase();
        if (!searchText.includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Apply filters
      if (filters.priceMin && car.price < filters.priceMin) return false;
      if (filters.priceMax && car.price > filters.priceMax) return false;
      if (filters.makes && filters.makes.length > 0 && !filters.makes.includes(car.make)) return false;
      if (filters.vehicleTypes && filters.vehicleTypes.length > 0 && !filters.vehicleTypes.includes(car.vehicleType)) return false;
      if (filters.fuelTypes && filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(car.fuelType)) return false;
      if (filters.transmissions && filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) return false;
      if (filters.conditions && filters.conditions.length > 0) {
        const condition = car.condition === 'new' ? 'New' : 'Used';
        if (!filters.conditions.includes(condition)) return false;
      }

      return true;
    });
  }, [allCars, searchTerm, filters]);

  const handleFiltersChange = useCallback((newFilters: Partial<CarFilters>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      priceMin: 0,
      priceMax: 500000,
      makes: [],
      vehicleTypes: [],
      conditions: [],
      fuelTypes: [],
      transmissions: [],
    });
    setSearchTerm('');
    setCurrentPage(1);
    toast({
      title: "Filters Reset",
      description: "All search filters have been cleared.",
    });
  }, []);

  const carsPerPage = 9;
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  const currentCars = filteredCars.slice(
    (currentPage - 1) * carsPerPage,
    currentPage * carsPerPage
  );

  // Enhanced search with loading
  const handleSearch = useCallback(async (term: string) => {
    await withLoading(async () => {
      await simulateNetworkDelay(300);
      setSearchTerm(term);
      setCurrentPage(1);
    });
  }, [withLoading]);

  // Simulate initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      await simulateNetworkDelay(800);
      setInitialLoad(false);
    };
    loadInitialData();
  }, []);

  return (
    <VoiceProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex items-center space-x-2">
                  <CarIcon className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold">RedLine Motors</h1>
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-lg font-medium">Inventory</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVoiceSearch(true)}
                  className="animate-pulse-glow"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Search
                </Button>
                <VoiceButton />
                <Button>Contact Sales</Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Vehicle Inventory</h1>
                <p className="text-muted-foreground text-lg">
                  Browse our premium collection of {allCars.length} vehicles
                </p>
              </div>
              
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Voice Search Available
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Advanced Filters Sidebar */}
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={resetFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <p className="text-muted-foreground">
                    {filteredCars.length} vehicles found
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <p className="text-sm text-muted-foreground">
                    Sort by: Price, Year, Name
                  </p>

                  {/* View Toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="p-2"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="p-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cars Grid/List */}
              {currentCars.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-4'
                }>
                  {currentCars.map((car, index) => (
                    <Card 
                      key={car.id} 
                      className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          {car.isNew && (
                            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-primary to-accent animate-pulse-glow">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{car.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{car.year}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-bold text-primary">
                              ${car.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {car.mileage} mi
                            </span>
                          </div>
                          <Link to={`/car/${car.id}`}>
                            <Button className="w-full" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Reset Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Voice Search Assistant */}
        <VoiceSearchAssistant
          isOpen={showVoiceSearch}
          onClose={() => setShowVoiceSearch(false)}
          onFiltersUpdate={handleFiltersChange}
          currentFilters={filters}
          onSearch={() => {
            toast({
              title: "Voice Search Complete",
              description: `Found ${filteredCars.length} vehicles matching your criteria.`,
            });
          }}
        />
      </div>
    </VoiceProvider>
  );
};

export default Inventory;