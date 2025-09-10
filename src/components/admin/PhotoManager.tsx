import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Trash2, Eye, Search } from "lucide-react";
import { sampleCars as cars } from "@/data/cars";

export const PhotoManager = () => {
  const [selectedCar, setSelectedCar] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock photo data
  const [photos] = useState([
    { id: "1", carId: "1", url: "/src/assets/hero-car.jpg", alt: "BMW M3 Front View", isPrimary: true },
    { id: "2", carId: "1", url: "/src/assets/hero-car.jpg", alt: "BMW M3 Interior", isPrimary: false },
    { id: "3", carId: "2", url: "/src/assets/hero-car.jpg", alt: "Tesla Model S Side View", isPrimary: true },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Photos uploaded",
        description: `${files.length} photo(s) uploaded successfully`,
      });
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    toast({
      title: "Photo deleted",
      description: "Photo has been removed from the gallery",
    });
  };

  const filteredCars = cars.filter(car =>
    car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPhotosForCar = (carId: string) => {
    return photos.filter(photo => photo.carId === carId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Photo Manager</h1>
        <p className="text-muted-foreground">Upload and manage car photos</p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="car-select">Select Car</Label>
              <Select value={selectedCar} onValueChange={setSelectedCar}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.year} {car.make} {car.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo-upload">Upload Photos</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Photos
                </Button>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Supported formats: JPG, PNG, WebP. Max file size: 10MB per photo.
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cars to view photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery by Car */}
      <div className="space-y-6">
        {filteredCars.map((car) => {
          const carPhotos = getPhotosForCar(car.id);
          if (carPhotos.length === 0) return null;

          return (
            <Card key={car.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{car.year} {car.make} {car.model}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {carPhotos.length} photo(s)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {carPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {photo.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <Button variant="secondary" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* Add Photo Placeholder */}
                  <div className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Add Photo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{photos.length}</div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{cars.length}</div>
              <div className="text-sm text-muted-foreground">Cars with Photos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(photos.length / cars.length)}</div>
              <div className="text-sm text-muted-foreground">Avg Photos per Car</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};