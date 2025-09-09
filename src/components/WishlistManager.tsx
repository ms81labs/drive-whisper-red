import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WishlistItem, OrderRequest } from '@/types/wishlist';
import { Heart, Search, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WishlistManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitWishlist: (item: Partial<WishlistItem>) => void;
  onRequestExternalSearch: (specifications: any) => void;
}

export const WishlistManager: React.FC<WishlistManagerProps> = ({
  isOpen,
  onClose,
  onSubmitWishlist,
  onRequestExternalSearch,
}) => {
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [specifications, setSpecifications] = useState({
    make: '',
    model: '',
    vehicleType: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    fuelType: '',
    transmission: '',
    features: [] as string[],
    additionalRequirements: '',
  });

  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [timeline, setTimeline] = useState<'asap' | '1-month' | '3-months' | '6-months' | 'flexible'>('flexible');

  const handleSubmitToWishlist = () => {
    if (!clientInfo.name || !clientInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least name and email.",
        variant: "destructive",
      });
      return;
    }

    const wishlistItem: Partial<WishlistItem> = {
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      desiredSpecs: {
        make: specifications.make || undefined,
        model: specifications.model || undefined,
        vehicleType: specifications.vehicleType || undefined,
        condition: specifications.condition || undefined,
        priceRange: {
          min: specifications.priceMin ? parseInt(specifications.priceMin) : undefined,
          max: specifications.priceMax ? parseInt(specifications.priceMax) : undefined,
        },
        yearRange: {
          min: specifications.yearMin ? parseInt(specifications.yearMin) : undefined,
          max: specifications.yearMax ? parseInt(specifications.yearMax) : undefined,
        },
        fuelType: specifications.fuelType || undefined,
        transmission: specifications.transmission || undefined,
        features: specifications.features,
        additionalRequirements: specifications.additionalRequirements || undefined,
      },
      priority,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSubmitWishlist(wishlistItem);
    
    toast({
      title: "Added to Wishlist",
      description: "We'll search for matching vehicles and contact you when we find something!",
    });

    onClose();
  };

  const handleExternalSearch = () => {
    onRequestExternalSearch({
      ...specifications,
      clientInfo,
      timeline,
    });

    toast({
      title: "External Search Initiated",
      description: "We're searching external sources and will contact you with results!",
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Car Request & Wishlist</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for? Let us help! We'll search our network and external sources.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Your Name *</Label>
              <Input
                id="clientName"
                value={clientInfo.name}
                onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email Address *</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientInfo.email}
                onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clientPhone">Phone Number (Optional)</Label>
              <Input
                id="clientPhone"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Vehicle Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Desired Vehicle Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make/Brand</Label>
                <Input
                  id="make"
                  value={specifications.make}
                  onChange={(e) => setSpecifications(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="e.g., BMW, Mercedes, Audi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={specifications.model}
                  onChange={(e) => setSpecifications(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., X5, C-Class, A4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select value={specifications.vehicleType} onValueChange={(value) => setSpecifications(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="saloon">Saloon</SelectItem>
                    <SelectItem value="estate">Estate</SelectItem>
                    <SelectItem value="cabriolet">Cabriolet</SelectItem>
                    <SelectItem value="sports-coupe">Sports Coupe</SelectItem>
                    <SelectItem value="small-car">Small Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price Range (EUR)</Label>
                <div className="flex space-x-2">
                  <Input
                    value={specifications.priceMin}
                    onChange={(e) => setSpecifications(prev => ({ ...prev, priceMin: e.target.value }))}
                    placeholder="Min price"
                    type="number"
                  />
                  <Input
                    value={specifications.priceMax}
                    onChange={(e) => setSpecifications(prev => ({ ...prev, priceMax: e.target.value }))}
                    placeholder="Max price"
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Year Range</Label>
                <div className="flex space-x-2">
                  <Input
                    value={specifications.yearMin}
                    onChange={(e) => setSpecifications(prev => ({ ...prev, yearMin: e.target.value }))}
                    placeholder="From year"
                    type="number"
                  />
                  <Input
                    value={specifications.yearMax}
                    onChange={(e) => setSpecifications(prev => ({ ...prev, yearMax: e.target.value }))}
                    placeholder="To year"
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={specifications.condition} onValueChange={(value) => setSpecifications(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="pre-registration">Pre-Registration</SelectItem>
                    <SelectItem value="demonstration">Demonstration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select value={specifications.fuelType} onValueChange={(value) => setSpecifications(prev => ({ ...prev, fuelType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="plug-in-hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select value={specifications.transmission} onValueChange={(value) => setSpecifications(prev => ({ ...prev, transmission: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalRequirements">Additional Requirements</Label>
              <Textarea
                id="additionalRequirements"
                value={specifications.additionalRequirements}
                onChange={(e) => setSpecifications(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                placeholder="Any specific features, colors, or requirements you have in mind..."
                rows={3}
              />
            </div>
          </div>

          {/* Priority and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Just browsing</SelectItem>
                  <SelectItem value="medium">Medium - Actively looking</SelectItem>
                  <SelectItem value="high">High - Need soon</SelectItem>
                  <SelectItem value="urgent">Urgent - Need ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Select value={timeline} onValueChange={(value: any) => setTimeline(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asap">ASAP</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                  <SelectItem value="flexible">Flexible timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button 
              onClick={handleSubmitToWishlist}
              className="flex-1"
              size="lg"
            >
              <Heart className="h-4 w-4 mr-2" />
              Add to Wishlist
            </Button>
            
            <Button 
              onClick={handleExternalSearch}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Search className="h-4 w-4 mr-2" />
              Search External Sources
            </Button>
            
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• We'll search our inventory and partner network</li>
              <li>• Check external automotive marketplaces</li>
              <li>• Contact manufacturers for special orders if needed</li>
              <li>• You'll receive updates via email and phone</li>
              <li>• No obligation - we'll present options when found</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};