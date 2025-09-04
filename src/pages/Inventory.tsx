import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { VoiceProvider } from '@/components/VoiceProvider';
import { VoiceButton } from '@/components/VoiceButton';
import { CarCard } from '@/components/CarCard';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Car, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Car {
  id: string;
  name: string;
  year: number;
  price: number;
  image: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  brand: string;
  isNew?: boolean;
}

const Inventory = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedBodyType, setSelectedBodyType] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Sample expanded inventory data
  const allCars: Car[] = [
    {
      id: '1',
      name: 'BMW M4 Competition',
      year: 2024,
      price: 89500,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      mileage: '0 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      brand: 'BMW',
      isNew: true,
    },
    {
      id: '2',
      name: 'Mercedes-AMG C63',
      year: 2023,
      price: 75900,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop',
      mileage: '12,500 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      brand: 'Mercedes',
    },
    {
      id: '3',
      name: 'Audi RS6 Avant',
      year: 2024,
      price: 118000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
      mileage: '0 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Wagon',
      brand: 'Audi',
      isNew: true,
    },
    {
      id: '4',
      name: 'Porsche 911 Turbo S',
      year: 2023,
      price: 195000,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop',
      mileage: '5,200 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      brand: 'Porsche',
    },
    {
      id: '5',
      name: 'Tesla Model S Plaid',
      year: 2024,
      price: 129990,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop',
      mileage: '0 miles',
      fuelType: 'Electric',
      transmission: 'Automatic',
      bodyType: 'Sedan',
      brand: 'Tesla',
      isNew: true,
    },
    {
      id: '6',
      name: 'Lamborghini Huracán',
      year: 2022,
      price: 285000,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop',
      mileage: '8,900 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      brand: 'Lamborghini',
    },
    {
      id: '7',
      name: 'Range Rover Sport',
      year: 2023,
      price: 95000,
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
      mileage: '15,000 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'SUV',
      brand: 'Land Rover',
    },
    {
      id: '8',
      name: 'Ferrari 488 GTB',
      year: 2021,
      price: 325000,
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop',
      mileage: '12,400 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
      bodyType: 'Coupe',
      brand: 'Ferrari',
    },
  ];

  const brands = ['all', ...Array.from(new Set(allCars.map(car => car.brand)))];
  const bodyTypes = ['all', ...Array.from(new Set(allCars.map(car => car.bodyType)))];

  const filteredCars = allCars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1];
    const matchesBrand = selectedBrand === 'all' || car.brand === selectedBrand;
    const matchesBodyType = selectedBodyType === 'all' || car.bodyType === selectedBodyType;
    
    return matchesSearch && matchesPrice && matchesBrand && matchesBodyType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'year-desc': return b.year - a.year;
      case 'year-asc': return a.year - b.year;
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const carsPerPage = 9;
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  const currentCars = filteredCars.slice(
    (currentPage - 1) * carsPerPage,
    currentPage * carsPerPage
  );

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setPriceRange([0, 200000]);
    setSelectedBrand('all');
    setSelectedBodyType('all');
    setSortBy('price-asc');
    setCurrentPage(1);
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
                  <Car className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold">RedLine Motors</h1>
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-lg font-medium">Inventory</span>
              </div>
              
              <div className="flex items-center space-x-3">
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
            {/* Filters Sidebar */}
            <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search cars..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={400000}
                        min={0}
                        step={5000}
                        className="mb-4"
                      />
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Brand</label>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>
                              {brand === 'all' ? 'All Brands' : brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Body Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Body Type</label>
                      <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type === 'all' ? 'All Types' : type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  
                  <p className="text-muted-foreground">
                    {filteredCars.length} vehicles found
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="year-desc">Year: Newest First</SelectItem>
                      <SelectItem value="year-asc">Year: Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="p-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
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
                  {currentCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
      </div>
    </VoiceProvider>
  );
};

export default Inventory;