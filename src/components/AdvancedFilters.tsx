import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CarFilters } from '@/types/car';
import { X, RotateCcw } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: Partial<CarFilters>;
  onFiltersChange: (filters: Partial<CarFilters>) => void;
  onReset: () => void;
}

const makes = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Tesla', 'Lamborghini', 'Ferrari', 'Land Rover', 'Volkswagen', 'Toyota'];
const vehicleTypes = [
  { value: 'cabriolet', label: 'Cabriolet/Roadster' },
  { value: 'suv', label: 'SUV/Off-road' },
  { value: 'small-car', label: 'Small Car' },
  { value: 'van', label: 'Van/Minibus' },
  { value: 'estate', label: 'Estate Car' },
  { value: 'saloon', label: 'Saloon' },
  { value: 'sports-coupe', label: 'Sports Car/Coupe' },
  { value: 'other', label: 'Other' },
];
const conditions = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'pre-registration', label: 'Pre-Registration' },
  { value: 'employee', label: "Employee's car" },
  { value: 'classic', label: 'Classic Vehicle' },
  { value: 'demonstration', label: 'Demonstration Vehicle' },
];
const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
  { value: 'hydrogen', label: 'Hydrogen' },
  { value: 'cng', label: 'Natural Gas (CNG)' },
  { value: 'lpg', label: 'LPG' },
  { value: 'ethanol', label: 'Ethanol' },
];
const transmissions = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'semi-automatic', label: 'Semi-automatic' },
  { value: 'manual', label: 'Manual gearbox' },
];
const colors = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Brown', 'Green', 'Orange', 'Yellow', 'Beige', 'Gold', 'Purple'];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const updateFilter = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof CarFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const removeFilterValue = (key: keyof CarFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    updateFilter(key, currentArray.filter(item => item !== value) as any);
  };

  return (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {Object.keys(filters).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={onReset}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {filters.makes?.map(make => (
                <Badge key={make} variant="secondary" className="text-xs">
                  {make}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeFilterValue('makes', make)}
                  />
                </Badge>
              ))}
              {filters.vehicleTypes?.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {vehicleTypes.find(vt => vt.value === type)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeFilterValue('vehicleTypes', type)}
                  />
                </Badge>
              ))}
              {filters.conditions?.map(condition => (
                <Badge key={condition} variant="secondary" className="text-xs">
                  {conditions.find(c => c.value === condition)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => removeFilterValue('conditions', condition)}
                  />
                </Badge>
              ))}
              {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="text-xs">
                  Price: €{filters.priceMin?.toLocaleString() || '0'} - €{filters.priceMax?.toLocaleString() || '∞'}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => {
                      updateFilter('priceMin', 0);
                      updateFilter('priceMax', 500000);
                    }}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Data */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Make</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {makes.map(make => (
                <div key={make} className="flex items-center space-x-2">
                  <Checkbox
                    id={`make-${make}`}
                    checked={filters.makes?.includes(make) || false}
                    onCheckedChange={() => toggleArrayValue('makes', make)}
                  />
                  <Label htmlFor={`make-${make}`} className="text-sm">{make}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Vehicle Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {vehicleTypes.map(type => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.vehicleTypes?.includes(type.value) || false}
                    onCheckedChange={() => toggleArrayValue('vehicleTypes', type.value)}
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm">{type.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Price Range: €{filters.priceMin?.toLocaleString() || '0'} - €{filters.priceMax?.toLocaleString() || '500,000'}
            </Label>
            <Slider
              value={[filters.priceMin || 0, filters.priceMax || 500000]}
              onValueChange={([min, max]) => {
                updateFilter('priceMin', min);
                updateFilter('priceMax', max);
              }}
              max={500000}
              min={0}
              step={5000}
              className="mb-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year-min" className="text-sm font-medium">Year From</Label>
              <Input
                id="year-min"
                type="number"
                placeholder="2020"
                value={filters.yearMin || ''}
                onChange={(e) => updateFilter('yearMin', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="year-max" className="text-sm font-medium">Year To</Label>
              <Input
                id="year-max"
                type="number"
                placeholder="2024"
                value={filters.yearMax || ''}
                onChange={(e) => updateFilter('yearMax', parseInt(e.target.value) || 2024)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Mileage: {filters.mileageMin?.toLocaleString() || '0'} - {filters.mileageMax?.toLocaleString() || '200,000'} km
            </Label>
            <Slider
              value={[filters.mileageMin || 0, filters.mileageMax || 200000]}
              onValueChange={([min, max]) => {
                updateFilter('mileageMin', min);
                updateFilter('mileageMax', max);
              }}
              max={200000}
              min={0}
              step={1000}
              className="mb-4"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Condition</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {conditions.map(condition => (
                <div key={condition.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition.value}`}
                    checked={filters.conditions?.includes(condition.value) || false}
                    onCheckedChange={() => toggleArrayValue('conditions', condition.value)}
                  />
                  <Label htmlFor={`condition-${condition.value}`} className="text-sm">{condition.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Data */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Fuel Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {fuelTypes.map(fuel => (
                <div key={fuel.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fuel-${fuel.value}`}
                    checked={filters.fuelTypes?.includes(fuel.value) || false}
                    onCheckedChange={() => toggleArrayValue('fuelTypes', fuel.value)}
                  />
                  <Label htmlFor={`fuel-${fuel.value}`} className="text-sm">{fuel.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Transmission</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              {transmissions.map(transmission => (
                <div key={transmission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`transmission-${transmission.value}`}
                    checked={filters.transmissions?.includes(transmission.value) || false}
                    onCheckedChange={() => toggleArrayValue('transmissions', transmission.value)}
                  />
                  <Label htmlFor={`transmission-${transmission.value}`} className="text-sm">{transmission.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">
              Power: {filters.powerMin || 0} - {filters.powerMax || 1000} HP
            </Label>
            <Slider
              value={[filters.powerMin || 0, filters.powerMax || 1000]}
              onValueChange={([min, max]) => {
                updateFilter('powerMin', min);
                updateFilter('powerMax', max);
              }}
              max={1000}
              min={0}
              step={10}
              className="mb-4"
            />
          </div>
        </CardContent>
      </Card>

      {/* Features & Extras */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="heated-seats"
                checked={filters.heatedSeats || false}
                onCheckedChange={(checked) => updateFilter('heatedSeats', !!checked)}
              />
              <Label htmlFor="heated-seats" className="text-sm">Heated Seats</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="navigation"
                checked={filters.navigationSystem || false}
                onCheckedChange={(checked) => updateFilter('navigationSystem', !!checked)}
              />
              <Label htmlFor="navigation" className="text-sm">Navigation System</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="carplay"
                checked={filters.carPlay || false}
                onCheckedChange={(checked) => updateFilter('carPlay', !!checked)}
              />
              <Label htmlFor="carplay" className="text-sm">Apple CarPlay / Android Auto</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sunroof"
                checked={filters.sunroof || false}
                onCheckedChange={(checked) => updateFilter('sunroof', !!checked)}
              />
              <Label htmlFor="sunroof" className="text-sm">Sunroof/Panoramic roof</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alloy-wheels"
                checked={filters.alloyWheels || false}
                onCheckedChange={(checked) => updateFilter('alloyWheels', !!checked)}
              />
              <Label htmlFor="alloy-wheels" className="text-sm">Alloy Wheels</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="led-lights"
                checked={filters.ledHeadlights || false}
                onCheckedChange={(checked) => updateFilter('ledHeadlights', !!checked)}
              />
              <Label htmlFor="led-lights" className="text-sm">LED Headlights</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lane-assist"
                checked={filters.laneChangeAssist || false}
                onCheckedChange={(checked) => updateFilter('laneChangeAssist', !!checked)}
              />
              <Label htmlFor="lane-assist" className="text-sm">Lane Change Assist</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency-brake"
                checked={filters.emergencyBrakeAssist || false}
                onCheckedChange={(checked) => updateFilter('emergencyBrakeAssist', !!checked)}
              />
              <Label htmlFor="emergency-brake" className="text-sm">Emergency Brake Assist</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exterior */}
      <Card>
        <CardHeader>
          <CardTitle>Exterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-sm font-medium">Exterior Colour</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {colors.map(color => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.exteriorColors?.includes(color) || false}
                    onCheckedChange={() => toggleArrayValue('exteriorColors', color)}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm">{color}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};