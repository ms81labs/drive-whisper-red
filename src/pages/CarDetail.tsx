import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VoiceProvider } from '@/components/VoiceProvider';
import { VoiceButton } from '@/components/VoiceButton';
import { 
  Car, 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Shield, 
  Phone,
  MessageSquare,
  GitCompare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CarDetails {
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
  description: string;
  features: string[];
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
  images: string[];
}

// Extended car data with detailed specifications
const carDetailsData: Record<string, CarDetails> = {
  '1': {
    id: '1',
    name: 'BMW M4 Competition',
    year: 2024,
    price: 89500,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    mileage: '0 miles',
    fuelType: 'Gas',
    transmission: 'Automatic',
    bodyType: 'Coupe',
    brand: 'BMW',
    isNew: true,
    description: 'The BMW M4 Competition represents the pinnacle of BMW\'s performance engineering. With its twin-turbo S58 engine and track-tuned suspension, this coupe delivers an uncompromising driving experience that balances everyday usability with track-day capability.',
    features: [
      'M Sport Differential',
      'Carbon Fiber Roof',
      'Harman Kardon Surround Sound',
      'Head-Up Display',
      'Wireless Apple CarPlay',
      'Heated Sport Seats',
      'M Performance Exhaust',
      'Adaptive M Suspension'
    ],
    specs: {
      engine: '3.0L Twin-Turbo I6',
      horsepower: '503 hp',
      torque: '479 lb-ft',
      acceleration: '0-60 mph in 3.8 seconds',
      topSpeed: '180 mph (electronically limited)',
      fuelEconomy: '16 city / 23 highway mpg',
      drivetrain: 'Rear-wheel drive',
      seatingCapacity: 4,
      warranty: '4 years / 50,000 miles'
    },
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop'
    ]
  },
  '2': {
    id: '2',
    name: 'Mercedes-AMG C63',
    year: 2023,
    price: 75900,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    mileage: '12,500 miles',
    fuelType: 'Gas',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    brand: 'Mercedes',
    description: 'The Mercedes-AMG C63 combines luxury with raw performance. Featuring AMG\'s handcrafted biturbo V8 engine and advanced 4MATIC+ all-wheel drive system, this sedan delivers exceptional power and handling in any weather condition.',
    features: [
      'AMG Performance 4MATIC+',
      'Burmester 3D Surround Sound',
      'AMG Track Pace',
      'MBUX Infotainment',
      'AMG Performance Seats',
      'Panoramic Sunroof',
      'AMG Ride Control Suspension',
      'AMG Performance Exhaust'
    ],
    specs: {
      engine: '4.0L Twin-Turbo V8',
      horsepower: '469 hp',
      torque: '479 lb-ft',
      acceleration: '0-60 mph in 3.8 seconds',
      topSpeed: '174 mph (electronically limited)',
      fuelEconomy: '17 city / 25 highway mpg',
      drivetrain: 'All-wheel drive (4MATIC+)',
      seatingCapacity: 5,
      warranty: '4 years / 50,000 miles'
    },
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ]
  },
  // Add more car details for other cars...
  '3': {
    id: '3',
    name: 'Audi RS6 Avant',
    year: 2024,
    price: 118000,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    mileage: '0 miles',
    fuelType: 'Gas',
    transmission: 'Automatic',
    bodyType: 'Wagon',
    brand: 'Audi',
    isNew: true,
    description: 'The Audi RS6 Avant is the ultimate performance wagon, combining supercar-level performance with practical everyday usability. Its twin-turbo V8 and quattro all-wheel drive system deliver exceptional performance in all conditions.',
    features: [
      'Quattro All-Wheel Drive',
      'RS Sport Suspension Plus',
      'Bang & Olufsen 3D Sound',
      'Virtual Cockpit Plus',
      'RS Sport Exhaust',
      'Carbon Fiber Exterior Package',
      'Matrix LED Headlights',
      'RS Performance Mode'
    ],
    specs: {
      engine: '4.0L Twin-Turbo V8',
      horsepower: '591 hp',
      torque: '590 lb-ft',
      acceleration: '0-60 mph in 3.5 seconds',
      topSpeed: '190 mph (with Dynamic Plus)',
      fuelEconomy: '15 city / 22 highway mpg',
      drivetrain: 'All-wheel drive (quattro)',
      seatingCapacity: 5,
      warranty: '4 years / 50,000 miles'
    },
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop'
    ]
  }
};

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const carDetail = id ? carDetailsData[id] : null;

  if (!carDetail) {
    return (
      <VoiceProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="p-8">
              <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The vehicle you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/inventory')}>
                Back to Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </VoiceProvider>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Car details link copied to clipboard!",
    });
  };

  const handleCompare = () => {
    navigate(`/compare?car1=${carDetail.id}`);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `${carDetail.name} ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
    });
  };

  return (
    <VoiceProvider agentId="car-detail-agent">
      <div className="min-h-screen bg-background" id="car-detail-page">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Link to="/" className="flex items-center space-x-2">
                  <Car className="h-6 w-6 text-primary" />
                  <span className="font-bold">RedLine Motors</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-3">
                <VoiceButton />
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleFavorite}>
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4" id="car-images">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img
                  src={carDetail.images[selectedImageIndex]}
                  alt={`${carDetail.name} - View ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {carDetail.isNew && (
                  <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600">
                    NEW
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {carDetail.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-primary' 
                        : 'border-muted hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${carDetail.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Car Details */}
            <div className="space-y-8" id="car-info">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-sm">
                    {carDetail.brand} • {carDetail.bodyType}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary">
                    {carDetail.year}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-4">{carDetail.name}</h1>
                <div className="text-3xl font-bold text-primary mb-4">
                  ${carDetail.price.toLocaleString()}
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {carDetail.description}
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Year</div>
                  <div className="font-semibold">{carDetail.year}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Gauge className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Mileage</div>
                  <div className="font-semibold">{carDetail.mileage}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Fuel className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Fuel</div>
                  <div className="font-semibold">{carDetail.fuelType}</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Settings className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Transmission</div>
                  <div className="font-semibold">{carDetail.transmission}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Test Drive
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Dealer
                </Button>
                <Button variant="outline" size="lg" onClick={handleCompare}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="mt-16 grid lg:grid-cols-2 gap-8">
            {/* Specifications */}
            <Card id="specifications">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(carDetail.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card id="features">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {carDetail.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="mt-8 bg-muted/50" id="contact-section">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Drive Home This Beauty?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our expert sales team is ready to help you with financing options, trade-in evaluations, 
                and scheduling your test drive. Contact us today!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <Button size="lg" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call (555) 123-CARS
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VoiceProvider>
  );
};

export default CarDetail;