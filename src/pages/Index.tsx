import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VoiceProvider } from '@/components/VoiceProvider';
import { VoiceButton } from '@/components/VoiceButton';
import { CarCard } from '@/components/CarCard';
import { Phone, MapPin, Clock, Star, Search, Car, Users, Award } from 'lucide-react';
import heroCarImage from '@/assets/hero-car.jpg';

const Index = () => {
  // Sample car data
  const featuredCars = [
    {
      id: '1',
      name: 'BMW M4 Competition',
      year: 2024,
      price: 89500,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      mileage: '0 miles',
      fuelType: 'Gas',
      transmission: 'Automatic',
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
      isNew: true,
    },
  ];

  return (
    <VoiceProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">RedLine Motors</h1>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#inventory" className="text-muted-foreground hover:text-foreground transition-colors">
                  Inventory
                </a>
                <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </nav>
              
              <div className="flex items-center space-x-3">
                <VoiceButton />
                <Button>Get Started</Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroCarImage})` }}
          />
          
          <div className="relative z-20 container mx-auto px-4 py-24 lg:py-32">
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                Voice-Controlled Experience
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Find Your
                <span className="text-primary block">Dream Car</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience the future of car shopping with our AI-powered voice assistant. 
                Browse our premium collection and let your voice guide your journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8">
                  Browse Inventory
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Search Cars
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                  <Car className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Vehicles Available</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">15</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Cars */}
        <section id="featured-cars" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Premium Selection
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Featured Vehicles</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked collection of premium vehicles. 
                Use voice commands to explore and find your perfect match.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                View All Inventory
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section id="contact" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Visit Our Showroom</h2>
              <p className="text-xl text-muted-foreground">
                Experience our vehicles in person and talk to our expert team
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    123 Auto Plaza Drive<br />
                    Metro City, MC 12345
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                    <Phone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground">
                    Sales: (555) 123-4567<br />
                    Service: (555) 123-4568
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
                    <Clock className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Hours</h3>
                  <p className="text-muted-foreground">
                    Mon-Sat: 9AM-8PM<br />
                    Sunday: 10AM-6PM
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-background py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Car className="h-6 w-6" />
                <span className="text-lg font-semibold">RedLine Motors</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <span>© 2024 RedLine Motors. All rights reserved.</span>
                <span>|</span>
                <span>Voice-Powered by AI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </VoiceProvider>
  );
};

export default Index;