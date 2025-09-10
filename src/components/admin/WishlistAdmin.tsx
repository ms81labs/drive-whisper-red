import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, Search, CheckCircle, XCircle, ExternalLink, Calendar } from "lucide-react";

export const WishlistAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock wishlist data
  const [wishlistItems] = useState([
    {
      id: "1",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "(555) 123-4567",
      make: "BMW",
      model: "M3",
      year: 2024,
      maxPrice: 85000,
      preferredColor: "Alpine White",
      transmission: "Manual",
      fuelType: "Gasoline",
      additionalRequests: "Looking for Competition Package",
      status: "pending",
      priority: "high",
      createdAt: "2024-01-15",
      estimatedDelivery: "2-4 weeks"
    },
    {
      id: "2",
      customerName: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      customerPhone: "(555) 987-6543",
      make: "Tesla",
      model: "Model Y",
      year: 2024,
      maxPrice: 65000,
      preferredColor: "Pearl White",
      transmission: "Automatic",
      fuelType: "Electric",
      additionalRequests: "Long Range version preferred",
      status: "sourcing",
      priority: "medium",
      createdAt: "2024-01-10",
      estimatedDelivery: "1-2 weeks"
    },
    {
      id: "3",
      customerName: "Mike Wilson",
      customerEmail: "mike@example.com",
      customerPhone: "(555) 456-7890",
      make: "Porsche",
      model: "911",
      year: 2023,
      maxPrice: 120000,
      preferredColor: "Guards Red",
      transmission: "Manual",
      fuelType: "Gasoline",
      additionalRequests: "Prefer Carrera S or GTS",
      status: "completed",
      priority: "high",
      createdAt: "2024-01-05",
      estimatedDelivery: "Delivered"
    }
  ]);

  const filteredItems = wishlistItems.filter(item =>
    item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${item.make} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = (itemId: string, newStatus: string) => {
    toast({
      title: "Status updated",
      description: `Wishlist item status changed to ${newStatus}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "sourcing":
        return <Badge variant="outline">Sourcing</Badge>;
      case "completed":
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="outline">Medium</Badge>;
      case "low":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const stats = {
    total: wishlistItems.length,
    pending: wishlistItems.filter(item => item.status === "pending").length,
    sourcing: wishlistItems.filter(item => item.status === "sourcing").length,
    completed: wishlistItems.filter(item => item.status === "completed").length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wishlist & Orders</h1>
        <p className="text-muted-foreground">Manage customer wishlist requests and special orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sourcing</CardTitle>
            <Search className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sourcing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or car..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wishlist Requests ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Max Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-sm text-muted-foreground">{item.customerEmail}</div>
                      <div className="text-sm text-muted-foreground">{item.customerPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.year} {item.make} {item.model}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.preferredColor} • {item.transmission} • {item.fuelType}
                      </div>
                      {item.additionalRequests && (
                        <div className="text-sm text-muted-foreground mt-1">
                          "{item.additionalRequests}"
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${item.maxPrice.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">
                        ETA: {item.estimatedDelivery}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {item.status === "pending" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(item.id, "sourcing")}
                        >
                          Start Sourcing
                        </Button>
                      )}
                      {item.status === "sourcing" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusUpdate(item.id, "completed")}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};