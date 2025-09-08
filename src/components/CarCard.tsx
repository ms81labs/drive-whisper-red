import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoice } from './VoiceProvider';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/types/car';

// Simple car interface for backward compatibility
interface SimpleCar {
  id: string;
  name: string;
  year: number;
  price: number;
  image: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  isNew?: boolean;
}

interface CarCardProps {
  car: Car | SimpleCar;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { speak } = useVoice();
  const navigate = useNavigate();

  const handleViewDetails = () => {
    const mileageText = typeof car.mileage === 'string' ? car.mileage : `${car.mileage} km`;
    speak(`Viewing details for ${car.name}. This ${car.year} model is priced at ${formatPrice(car.price)} with ${mileageText}.`);
    navigate(`/car/${car.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img
          src={car.image}
          alt={`${car.year} ${car.name}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {car.isNew && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            NEW
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {car.year} {car.name}
            </h3>
            <p className="text-2xl font-bold text-primary mt-1">
              {formatPrice(car.price)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{typeof car.mileage === 'string' ? car.mileage : `${car.mileage.toLocaleString()} km`}</span>
            <span>•</span>
            <span>{car.fuelType}</span>
            <span>•</span>
            <span>{car.transmission}</span>
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="w-full mt-4"
            variant="outline"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};