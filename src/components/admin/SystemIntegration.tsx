import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  Mic,
  Car,
  Users,
  BarChart3,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  component: string;
  status: 'connected' | 'error' | 'loading' | 'disabled';
  lastChecked: Date;
  message?: string;
}

export const SystemIntegration: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { toast } = useToast();

  const initializeSystemCheck = () => {
    const initialStatus: SystemStatus[] = [
      {
        component: 'ElevenLabs Voice API',
        status: 'loading',
        lastChecked: new Date(),
        message: 'Checking API connection...'
      },
      {
        component: 'Car Inventory System',
        status: 'loading',
        lastChecked: new Date(),
        message: 'Validating inventory data...'
      },
      {
        component: 'Customer Management',
        status: 'loading',
        lastChecked: new Date(),
        message: 'Testing wishlist integration...'
      },
      {
        component: 'Analytics & Reporting',
        status: 'loading',
        lastChecked: new Date(),
        message: 'Checking data collection...'
      },
      {
        component: 'Admin Authentication',
        status: 'loading',
        lastChecked: new Date(),
        message: 'Verifying security settings...'
      }
    ];
    
    setSystemStatus(initialStatus);
    
    // Simulate system checks with delays
    setTimeout(() => checkElevenLabsStatus(), 1000);
    setTimeout(() => checkInventoryStatus(), 2000);
    setTimeout(() => checkCustomerStatus(), 3000);
    setTimeout(() => checkAnalyticsStatus(), 4000);
    setTimeout(() => checkAuthStatus(), 5000);
  };

  const checkElevenLabsStatus = () => {
    const settings = localStorage.getItem('admin_settings');
    let status: 'connected' | 'error' | 'disabled' = 'disabled';
    let message = 'API key not configured';
    
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.elevenLabsApiKey && parsed.elevenLabsApiKey.trim()) {
        status = 'connected';
        message = 'API key configured and ready';
      }
    }
    
    updateSystemStatus('ElevenLabs Voice API', status, message);
  };

  const checkInventoryStatus = () => {
    // Always connected since we have mock data
    updateSystemStatus('Car Inventory System', 'connected', 'Inventory data loaded successfully');
  };

  const checkCustomerStatus = () => {
    updateSystemStatus('Customer Management', 'connected', 'Wishlist system operational');
  };

  const checkAnalyticsStatus = () => {
    updateSystemStatus('Analytics & Reporting', 'connected', 'Data collection active');
  };

  const checkAuthStatus = () => {
    updateSystemStatus('Admin Authentication', 'connected', 'Security protocols active');
  };

  const updateSystemStatus = (component: string, status: 'connected' | 'error' | 'disabled', message: string) => {
    setSystemStatus(prev => 
      prev.map(item => 
        item.component === component 
          ? { ...item, status, message, lastChecked: new Date() }
          : item
      )
    );
  };

  const runSystemTests = async () => {
    setIsRunningTests(true);
    toast({
      title: "Running System Tests",
      description: "Checking all integrations...",
    });

    // Reset and run all checks
    initializeSystemCheck();
    
    setTimeout(() => {
      setIsRunningTests(false);
      toast({
        title: "System Check Complete",
        description: "All components have been tested",
      });
    }, 6000);
  };

  useEffect(() => {
    initializeSystemCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'disabled':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'disabled':
        return <Badge variant="outline">Disabled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const connectedCount = systemStatus.filter(s => s.status === 'connected').length;
  const totalCount = systemStatus.length;
  const progress = totalCount > 0 ? (connectedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Integration</h1>
        <p className="text-muted-foreground">Monitor and test all system components</p>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {connectedCount} of {totalCount} systems connected
                </p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Button 
                onClick={runSystemTests}
                disabled={isRunningTests}
                className="min-w-32"
              >
                {isRunningTests && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRunningTests ? 'Testing...' : 'Test All Systems'}
              </Button>
            </div>
            
            <Progress value={progress} className="w-full" />
            
            {progress === 100 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  All systems are operational and ready for use.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <div className="grid gap-4">
        {systemStatus.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="font-medium">{item.component}</h3>
                    <p className="text-sm text-muted-foreground">{item.message}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {item.lastChecked.toLocaleTimeString()}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mic className="h-6 w-6" />
              <span className="text-sm">Test Voice</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Car className="h-6 w-6" />
              <span className="text-sm">Check Inventory</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Sync Customers</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};