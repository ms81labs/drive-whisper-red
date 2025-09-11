import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save, Key, Globe, Bell, Shield } from "lucide-react";

export const SettingsAdmin = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("admin_settings");
    return saved ? JSON.parse(saved) : {
      // ElevenLabs Settings
      elevenLabsApiKey: "",
      elevenLabsVoiceId: "9BWtsMINqrJLrRacOk9x", // Aria default
      elevenLabsModel: "eleven_multilingual_v2",
      
      // Dealership Info
      dealershipName: "DreamCars Auto",
      dealershipAddress: "123 Auto Lane, Carville, CA 90210",
      dealershipPhone: "(555) 123-CARS",
      dealershipEmail: "info@dreamcars.com",
      dealershipHours: "Mon-Sat: 9AM-8PM, Sun: 11AM-6PM",
      
      // Website Settings
      siteName: "DreamCars",
      siteDescription: "Find your dream car with our AI-powered voice assistant",
      
      // Voice Settings
      voiceEnabled: true,
      autoSpeak: true,
      voiceSpeed: 1.0,
      
      // Notifications
      emailNotifications: true,
      pushNotifications: false,
      lowStockAlerts: true,
      newWishlistAlerts: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
  }, [settings]);

  const handleSave = () => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    
    // Trigger event to notify VoiceProvider of API key update
    if (settings.elevenLabsApiKey) {
      window.dispatchEvent(new CustomEvent('elevenlabs-key-updated'));
    }
    
    toast({
      title: "Settings saved",
      description: `Settings updated successfully. ${settings.elevenLabsApiKey ? 'Voice system is now connected!' : ''}`,
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your dealership settings and integrations</p>
      </div>

      {/* ElevenLabs Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            ElevenLabs Voice API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="elevenlabs-key">API Key</Label>
            <div className="relative">
              <Input
                id="elevenlabs-key"
                type={showApiKey ? "text" : "password"}
                value={settings.elevenLabsApiKey}
                onChange={(e) => updateSetting("elevenLabsApiKey", e.target.value)}
                placeholder="Enter your ElevenLabs API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ElevenLabs Dashboard</a>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voice-id">Voice ID</Label>
              <Input
                id="voice-id"
                value={settings.elevenLabsVoiceId}
                onChange={(e) => updateSetting("elevenLabsVoiceId", e.target.value)}
                placeholder="Voice ID"
              />
              <p className="text-xs text-muted-foreground">Default: Aria (9BWtsMINqrJLrRacOk9x)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="voice-model">Model</Label>
              <Input
                id="voice-model"
                value={settings.elevenLabsModel}
                onChange={(e) => updateSetting("elevenLabsModel", e.target.value)}
                placeholder="Model"
              />
              <p className="text-xs text-muted-foreground">Recommended: eleven_multilingual_v2</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealership Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Dealership Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealership-name">Dealership Name</Label>
              <Input
                id="dealership-name"
                value={settings.dealershipName}
                onChange={(e) => updateSetting("dealershipName", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dealership-phone">Phone Number</Label>
              <Input
                id="dealership-phone"
                value={settings.dealershipPhone}
                onChange={(e) => updateSetting("dealershipPhone", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dealership-address">Address</Label>
            <Textarea
              id="dealership-address"
              value={settings.dealershipAddress}
              onChange={(e) => updateSetting("dealershipAddress", e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dealership-email">Email</Label>
              <Input
                id="dealership-email"
                type="email"
                value={settings.dealershipEmail}
                onChange={(e) => updateSetting("dealershipEmail", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dealership-hours">Business Hours</Label>
              <Input
                id="dealership-hours"
                value={settings.dealershipHours}
                onChange={(e) => updateSetting("dealershipHours", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Assistant Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Voice Assistant</Label>
              <p className="text-sm text-muted-foreground">Allow customers to use voice commands</p>
            </div>
            <Switch
              checked={settings.voiceEnabled}
              onCheckedChange={(checked) => updateSetting("voiceEnabled", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-speak Responses</Label>
              <p className="text-sm text-muted-foreground">Automatically speak AI responses</p>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(checked) => updateSetting("autoSpeak", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voice-speed">Voice Speed: {settings.voiceSpeed}x</Label>
            <input
              id="voice-speed"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => updateSetting("voiceSpeed", parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
            </div>
            <Switch
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => updateSetting("lowStockAlerts", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Wishlist Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about new wishlist requests</p>
            </div>
            <Switch
              checked={settings.newWishlistAlerts}
              onCheckedChange={(checked) => updateSetting("newWishlistAlerts", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};