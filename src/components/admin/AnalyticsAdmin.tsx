import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Eye, 
  MessageSquare, 
  Calendar,
  Award,
  Target
} from "lucide-react";

export const AnalyticsAdmin = () => {
  // Mock analytics data
  const salesData = {
    thisMonth: { sales: 28, revenue: 1240000 },
    lastMonth: { sales: 24, revenue: 1150000 },
    growth: { sales: 16.7, revenue: 7.8 }
  };

  const topModels = [
    { make: "Tesla", model: "Model Y", sold: 8, revenue: 520000 },
    { make: "BMW", model: "X5", sold: 6, revenue: 420000 },
    { make: "Mercedes", model: "GLE", sold: 5, revenue: 375000 },
    { make: "Audi", model: "Q7", sold: 4, revenue: 280000 },
    { make: "Porsche", model: "Cayenne", sold: 3, revenue: 210000 }
  ];

  const customerMetrics = {
    totalCustomers: 2847,
    newCustomers: 156,
    returningCustomers: 89,
    customerSatisfaction: 4.8
  };

  const voiceMetrics = {
    totalInteractions: 1247,
    successfulMatches: 892,
    wishlistCreated: 234,
    averageSessionTime: "3:42"
  };

  const websiteMetrics = {
    uniqueVisitors: 12840,
    pageViews: 45672,
    bounceRate: 24.5,
    avgSessionDuration: "4:23"
  };

  const inventoryMetrics = {
    totalCars: 156,
    soldThisMonth: 28,
    lowStock: 8,
    turnoverRate: 18
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">Track your dealership's performance and insights</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="voice">Voice AI</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(salesData.thisMonth.revenue / 1000000).toFixed(1)}M</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{salesData.growth.revenue}% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.thisMonth.sales}</div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{salesData.growth.sales}% from last month
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voice Interactions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{voiceMetrics.totalInteractions}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((voiceMetrics.successfulMatches / voiceMetrics.totalInteractions) * 100)}% success rate
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.customerSatisfaction}/5.0</div>
                <div className="text-xs text-green-600">
                  Excellent rating
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Models */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topModels.map((model, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{model.make} {model.model}</div>
                      <div className="text-sm text-muted-foreground">
                        {model.sold} sold • ${model.revenue.toLocaleString()} revenue
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{model.sold} units</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Target</span>
                    <span>{salesData.thisMonth.sales}/30</span>
                  </div>
                  <Progress value={(salesData.thisMonth.sales / 30) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue Target</span>
                    <span>${(salesData.thisMonth.revenue / 1500000 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(salesData.thisMonth.revenue / 1500000) * 100} className="mt-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryMetrics.turnoverRate}%</div>
                <p className="text-sm text-muted-foreground">Monthly turnover rate</p>
                <div className="mt-4">
                  <div className="text-sm">Low Stock Alerts</div>
                  <div className="text-2xl font-bold text-orange-600">{inventoryMetrics.lowStock}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Deal Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Math.round(salesData.thisMonth.revenue / salesData.thisMonth.sales).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Per vehicle sold</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.totalCustomers.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.newCustomers}</div>
                <p className="text-xs text-green-600">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Returning Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.returningCustomers}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Satisfaction Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerMetrics.customerSatisfaction}/5.0</div>
                <p className="text-xs text-green-600">⭐⭐⭐⭐⭐</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Voice AI Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Successful Matches</span>
                    <span>{voiceMetrics.successfulMatches}/{voiceMetrics.totalInteractions}</span>
                  </div>
                  <Progress 
                    value={(voiceMetrics.successfulMatches / voiceMetrics.totalInteractions) * 100} 
                    className="mt-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Wishlist Conversions</span>
                    <span>{voiceMetrics.wishlistCreated}/{voiceMetrics.totalInteractions}</span>
                  </div>
                  <Progress 
                    value={(voiceMetrics.wishlistCreated / voiceMetrics.totalInteractions) * 100} 
                    className="mt-2" 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{voiceMetrics.totalInteractions}</div>
                    <p className="text-sm text-muted-foreground">Total voice interactions</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{voiceMetrics.averageSessionTime}</div>
                    <p className="text-sm text-muted-foreground">Average session time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{websiteMetrics.uniqueVisitors.toLocaleString()}</div>
                <p className="text-xs text-green-600">+12% this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Page Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{websiteMetrics.pageViews.toLocaleString()}</div>
                <p className="text-xs text-green-600">+8% this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{websiteMetrics.bounceRate}%</div>
                <p className="text-xs text-green-600">-3% improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg. Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{websiteMetrics.avgSessionDuration}</div>
                <p className="text-xs text-green-600">+15s improvement</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};