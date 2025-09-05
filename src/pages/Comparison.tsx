import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceProvider } from '@/components/VoiceProvider';
import { VoiceButton } from '@/components/VoiceButton';
import { 
  Car, 
  ArrowLeft, 
  X,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  GitCompare,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';

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
  specs: {
    engine: string;
    horsepower: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    fuelEconomy: string;
    drivetrain: string;
    seatingCapacity: number;
    warranty: string;
  };
  features: string[];
}

// Sample car data for comparison
const availableCars: Car[] = [
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
    specs: {
      engine: '3.0L Twin-Turbo I6',
      horsepower: '503 hp',
      torque: '479 lb-ft',
      acceleration: '0-60 mph in 3.8 seconds',
      topSpeed: '180 mph',
      fuelEconomy: '16 city / 23 highway mpg',
      drivetrain: 'Rear-wheel drive',
      seatingCapacity: 4,
      warranty: '4 years / 50,000 miles'
    },
    features: [
      'M Sport Differential',
      'Carbon Fiber Roof',
      'Harman Kardon Sound',
      'Head-Up Display',
      'Wireless Apple CarPlay',
      'Heated Sport Seats',
      'M Performance Exhaust',
      'Adaptive M Suspension'
    ]
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
    specs: {
      engine: '4.0L Twin-Turbo V8',
      horsepower: '469 hp',
      torque: '479 lb-ft',
      acceleration: '0-60 mph in 3.8 seconds',
      topSpeed: '174 mph',
      fuelEconomy: '17 city / 25 highway mpg',
      drivetrain: 'All-wheel drive',
      seatingCapacity: 5,
      warranty: '4 years / 50,000 miles'
    },
    features: [
      'AMG Performance 4MATIC+',
      'Burmester 3D Sound',
      'AMG Track Pace',
      'MBUX Infotainment',
      'AMG Performance Seats',
      'Panoramic Sunroof',
      'AMG Ride Control',
      'AMG Performance Exhaust'
    ]
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
    specs: {
      engine: '4.0L Twin-Turbo V8',
      horsepower: '591 hp',
      torque: '590 lb-ft',
      acceleration: '0-60 mph in 3.5 seconds',
      topSpeed: '190 mph',
      fuelEconomy: '15 city / 22 highway mpg',
      drivetrain: 'All-wheel drive',
      seatingCapacity: 5,
      warranty: '4 years / 50,000 miles'
    },
    features: [
      'Quattro All-Wheel Drive',
      'RS Sport Suspension Plus',
      'Bang & Olufsen 3D Sound',
      'Virtual Cockpit Plus',
      'RS Sport Exhaust',
      'Carbon Fiber Package',
      'Matrix LED Headlights',
      'RS Performance Mode'
    ]
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
    specs: {
      engine: '3.8L Twin-Turbo Flat-6',
      horsepower: '640 hp',
      torque: '590 lb-ft',
      acceleration: '0-60 mph in 2.6 seconds',
      topSpeed: '205 mph',
      fuelEconomy: '15 city / 20 highway mpg',
      drivetrain: 'All-wheel drive',
      seatingCapacity: 4,
      warranty: '4 years / 50,000 miles'
    },
    features: [
      'Porsche Traction Management',
      'Active Suspension Management',
      'Bose Surround Sound',
      'Sport Chrono Package',
      'Ceramic Composite Brakes',
      'Sport Seats Plus',
      'LED Matrix Headlights',
      'Porsche Communication Management'
    ]
  }
];

const Comparison = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [car1, setCar1] = useState<Car | null>(null);
  const [car2, setCar2] = useState<Car | null>(null);

  useEffect(() => {
    const car1Id = searchParams.get('car1');
    const car2Id = searchParams.get('car2');
    
    if (car1Id) {
      const foundCar1 = availableCars.find(car => car.id === car1Id);
      if (foundCar1) setCar1(foundCar1);
    }
    
    if (car2Id) {
      const foundCar2 = availableCars.find(car => car.id === car2Id);
      if (foundCar2) setCar2(foundCar2);
    }
  }, [searchParams]);

  const handleCarSelect = (carId: string, position: 'car1' | 'car2') => {
    const selectedCar = availableCars.find(car => car.id === carId);
    if (!selectedCar) return;

    if (position === 'car1') {
      setCar1(selectedCar);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('car1', carId);
      setSearchParams(newParams);
    } else {
      setCar2(selectedCar);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('car2', carId);
      setSearchParams(newParams);
    }
  };

  const removeCar = (position: 'car1' | 'car2') => {
    if (position === 'car1') {
      setCar1(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('car1');
      setSearchParams(newParams);
    } else {
      setCar2(null);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('car2');
      setSearchParams(newParams);
    }
  };

  const getComparisonIcon = (value1: string | number, value2: string | number, higherIsBetter: boolean = true) => {
    if (!car1 || !car2) return null;
    
    const num1 = typeof value1 === 'string' ? parseFloat(value1.replace(/[^\d.]/g, '')) : value1;
    const num2 = typeof value2 === 'string' ? parseFloat(value2.replace(/[^\d.]/g, '')) : value2;
    
    if (num1 === num2) return null;
    
    const car1Better = higherIsBetter ? num1 > num2 : num1 < num2;
    return car1Better ? 'car1' : 'car2';
  };

  const ComparisonRow = ({ 
    label, 
    car1Value, 
    car2Value, 
    higherIsBetter = true 
  }: { 
    label: string; 
    car1Value: string | number; 
    car2Value: string | number; 
    higherIsBetter?: boolean;
  }) => {
    const winner = getComparisonIcon(car1Value, car2Value, higherIsBetter);
    
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-b-0">
        <div className="flex items-center justify-end pr-4">
          <span className={`${winner === 'car1' ? 'font-semibold text-green-600' : ''}`}>
            {car1Value}
          </span>
          {winner === 'car1' && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
        </div>
        <div className="text-center font-medium text-muted-foreground">
          {label}
        </div>
        <div className="flex items-center justify-start pl-4">
          {winner === 'car2' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
          <span className={`${winner === 'car2' ? 'font-semibold text-green-600' : ''}`}>
            {car2Value}
          </span>
        </div>
      </div>
    );
  };

  return (
    <VoiceProvider agentId="comparison-agent">
      <div className="min-h-screen bg-background" id="comparison-page">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Link to="/" className="flex items-center space-x-2">
                  <Car className="h-6 w-6 text-primary" />
                  <span className="font-bold">RedLine Motors</span>
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">Compare Vehicles</span>
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GitCompare className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-4xl font-bold">Vehicle Comparison</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare up to 2 vehicles side-by-side to find the perfect match for your needs
            </p>
          </div>

          {/* Car Selection */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Car 1 Selection */}
            <Card className={`${car1 ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Vehicle 1</CardTitle>
                  {car1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeCar('car1')}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {car1 ? (
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={car1.image}
                        alt={car1.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{car1.brand}</Badge>
                        {car1.isNew && <Badge className="bg-green-500">NEW</Badge>}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{car1.name}</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${car1.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Select a vehicle to compare</p>
                    <Select onValueChange={(value) => handleCarSelect(value, 'car1')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Vehicle 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCars
                          .filter(car => car.id !== car2?.id)
                          .map(car => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.name} ({car.year})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Car 2 Selection */}
            <Card className={`${car2 ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Vehicle 2</CardTitle>
                  {car2 && (
                    <Button variant="ghost" size="sm" onClick={() => removeCar('car2')}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {car2 ? (
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <img
                        src={car2.image}
                        alt={car2.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{car2.brand}</Badge>
                        {car2.isNew && <Badge className="bg-green-500">NEW</Badge>}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{car2.name}</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${car2.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Select a vehicle to compare</p>
                    <Select onValueChange={(value) => handleCarSelect(value, 'car2')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Vehicle 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCars
                          .filter(car => car.id !== car1?.id)
                          .map(car => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.name} ({car.year})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          {car1 && car2 && (
            <div className="space-y-8" id="comparison-table">
              {/* Specifications Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <ComparisonRow label="Price" car1Value={`$${car1.price.toLocaleString()}`} car2Value={`$${car2.price.toLocaleString()}`} higherIsBetter={false} />
                    <ComparisonRow label="Engine" car1Value={car1.specs.engine} car2Value={car2.specs.engine} />
                    <ComparisonRow label="Horsepower" car1Value={car1.specs.horsepower} car2Value={car2.specs.horsepower} />
                    <ComparisonRow label="Torque" car1Value={car1.specs.torque} car2Value={car2.specs.torque} />
                    <ComparisonRow label="0-60 mph" car1Value={car1.specs.acceleration} car2Value={car2.specs.acceleration} higherIsBetter={false} />
                    <ComparisonRow label="Top Speed" car1Value={car1.specs.topSpeed} car2Value={car2.specs.topSpeed} />
                    <ComparisonRow label="Fuel Economy" car1Value={car1.specs.fuelEconomy} car2Value={car2.specs.fuelEconomy} />
                    <ComparisonRow label="Seating" car1Value={car1.specs.seatingCapacity} car2Value={car2.specs.seatingCapacity} />
                    <ComparisonRow label="Drivetrain" car1Value={car1.specs.drivetrain} car2Value={car2.specs.drivetrain} />
                  </div>
                </CardContent>
              </Card>

              {/* Features Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Features Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4 text-center">{car1.name}</h4>
                      <div className="space-y-2">
                        {car1.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4 text-center">{car2.name}</h4>
                      <div className="space-y-2">
                        {car2.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{car1.name}</h3>
                    <p className="text-muted-foreground mb-4">Ready to learn more?</p>
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => navigate(`/car/${car1.id}`)}>
                        View Details
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Schedule Test Drive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">{car2.name}</h3>
                    <p className="text-muted-foreground mb-4">Ready to learn more?</p>
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => navigate(`/car/${car2.id}`)}>
                        View Details
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Schedule Test Drive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!car1 && !car2 && (
            <div className="text-center py-16">
              <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Start Your Comparison</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Select two vehicles above to see a detailed side-by-side comparison of their specifications and features.
              </p>
              <Button onClick={() => navigate('/inventory')}>
                Browse Inventory
              </Button>
            </div>
          )}
        </div>
      </div>
    </VoiceProvider>
  );
};

export default Comparison;