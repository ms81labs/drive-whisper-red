import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Heart, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, Clock, AlertTriangle, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export const AdminDashboard = () => {
  const [systemStatus, setSystemStatus] = useState<'checking' | 'ready' | 'issues'>('checking');
  
  useEffect(() => {
    // Check system status
    setTimeout(() => {
      const settings = localStorage.getItem('admin_settings');
      const hasElevenLabsKey = settings && JSON.parse(settings).elevenLabsApiKey;
      setSystemStatus(hasElevenLabsKey ? 'ready' : 'issues');
    }, 1000);
  }, []);
  const stats = [
    { title: "Total Cars", value: "156", icon: Car, color: "text-blue-600" },
    { title: "Wishlist Items", value: "23", icon: Heart, color: "text-red-600" },
    { title: "Monthly Revenue", value: "$1.2M", icon: DollarSign, color: "text-green-600" },
    { title: "Active Customers", value: "892", icon: Users, color: "text-purple-600" },
  ];

  const recentActivity = [
    { type: "sale", message: "2023 Tesla Model Y sold to John Doe", time: "2 hours ago" },
    { type: "wishlist", message: "New wishlist request for BMW M3", time: "4 hours ago" },
    { type: "inventory", message: "Added 2024 Mercedes C-Class to inventory", time: "1 day ago" },
    { type: "customer", message: "New customer registration: Jane Smith", time: "2 days ago" },
  ];

  const lowStockAlerts = [
    { make: "Tesla", model: "Model S", stock: 2 },
    { make: "BMW", model: "X5", stock: 1 },
    { make: "Audi", model: "A4", stock: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening at your dealership.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <NavLink to="/admin/analytics">View All Activity</NavLink>
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{alert.make} {alert.model}</p>
                  <p className="text-sm text-muted-foreground">Only {alert.stock} left</p>
                </div>
                <Badge variant={alert.stock <= 1 ? "destructive" : "secondary"}>
                  {alert.stock} left
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <NavLink to="/admin/inventory">Manage Inventory</NavLink>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild>
              <NavLink to="/admin/inventory">Add New Car</NavLink>
            </Button>
            <Button variant="outline" asChild>
              <NavLink to="/admin/wishlist">View Wishlist</NavLink>
            </Button>
            <Button variant="outline" asChild>
              <NavLink to="/admin/photos">Upload Photos</NavLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};