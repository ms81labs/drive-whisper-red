import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Car as CarIcon,
  Filter,
  Download,
  Upload,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cars as sampleCars } from '@/data/cars';
import { Car } from '@/types/car';
import { BulkCarOperations } from './BulkCarOperations';
import { useToast } from '@/hooks/use-toast';

export const EnhancedCarInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [carList, setCarList] = useState<Car[]>(sampleCars);
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterByMake, setFilterByMake] = useState<string>('all');
  const [filterByCondition, setFilterByCondition] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Get unique makes for filter dropdown
  const uniqueMakes = Array.from(new Set(sampleCars.map(car => car.make))).sort();

  const filteredCars = carList
    .filter(car => {
      const matchesSearch = 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMake = filterByMake === 'all' || car.make === filterByMake;
      const matchesCondition = filterByCondition === 'all' || car.condition === filterByCondition;
      
      return matchesSearch && matchesMake && matchesCondition;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'mileage':
          aValue = a.mileage;
          bValue = b.mileage;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

  const handleDeleteCar = (carId: string) => {
    setCarList(prev => prev.filter(car => car.id !== carId));
  };

  const handleBulkDelete = (carIds: string[]) => {
    setCarList(prev => prev.filter(car => !carIds.includes(car.id)));
    setSelectedCars([]);
  };

  const handleBulkEdit = (carIds: string[]) => {
    toast({
      title: "Bulk Edit",
      description: `Opening bulk editor for ${carIds.length} cars`,
    });
  };

  const handleExport = (cars: Car[]) => {
    const csvContent = [
      ['ID', 'Make', 'Model', 'Year', 'Price', 'Condition', 'Mileage', 'Fuel Type'].join(','),
      ...cars.map(car => [
        car.id, 
        car.make, 
        car.model, 
        car.year, 
        car.price, 
        car.condition,
        car.mileage,
        car.fuelType
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'car-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectCar = (car: Car, checked: boolean) => {
    if (checked) {
      setSelectedCars(prev => [...prev, car]);
    } else {
      setSelectedCars(prev => prev.filter(c => c.id !== car.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCars(filteredCars);
    } else {
      setSelectedCars([]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterByMake('all');
    setFilterByCondition('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Car Inventory</h1>
        <p className="text-muted-foreground">Advanced inventory management with filtering and bulk operations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CarIcon className="h-5 w-5" />
            Inventory Management ({filteredCars.length} cars)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters {showFilters && <X className="ml-2 h-3 w-3" />}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport(carList)}>
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Car
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 border rounded-lg mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Make</label>
                <Select value={filterByMake} onValueChange={setFilterByMake}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Makes</SelectItem>
                    {uniqueMakes.map(make => (
                      <SelectItem key={make} value={make}>{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Condition</label>
                <Select value={filterByCondition} onValueChange={setFilterByCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="pre-registration">Pre-registration</SelectItem>
                    <SelectItem value="demonstration">Demonstration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="mileage">Mileage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Operations */}
          <BulkCarOperations
            selectedCars={selectedCars}
            onClearSelection={() => setSelectedCars([])}
            onBulkDelete={handleBulkDelete}
            onBulkEdit={handleBulkEdit}
            onExport={handleExport}
          />

          {/* Cars Grid */}
          <div className="rounded-md border">
            <div className="p-4 border-b bg-muted/50">
              <div className="grid grid-cols-12 gap-4 font-medium text-sm">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedCars.length === filteredCars.length && filteredCars.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="col-span-3">Vehicle</div>
                <div className="col-span-2">Year</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-2">Condition</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
            </div>
            
            <div className="divide-y max-h-96 overflow-y-auto">
              {filteredCars.map((car) => (
                <div key={car.id} className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedCars.some(c => c.id === car.id)}
                        onCheckedChange={(checked) => handleSelectCar(car, checked as boolean)}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <img 
                        src={car.image} 
                        alt={car.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-sm text-muted-foreground">{car.make}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-sm">{car.year}</div>
                    <div className="col-span-2 text-sm">${car.price.toLocaleString()}</div>
                    <div className="col-span-2">
                      <Badge variant="secondary">{car.condition}</Badge>
                    </div>
                    <div className="col-span-1">
                      <Badge variant="default">In Stock</Badge>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCar(car.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};