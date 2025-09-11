import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  User, 
  Star, 
  Calendar,
  DollarSign,
  Car,
  Plus
} from 'lucide-react';
import { WishlistItem } from '@/types/wishlist';

interface CustomerLead extends WishlistItem {
  leadScore: number;
  lastContact?: Date;
  nextFollowUp?: Date;
  potentialValue: number;
}

interface CustomerLeadManagerProps {
  wishlistItems: WishlistItem[];
}

export const CustomerLeadManager: React.FC<CustomerLeadManagerProps> = ({ wishlistItems }) => {
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);
  const [notes, setNotes] = useState('');

  // Convert wishlist items to leads with scoring
  const leads: CustomerLead[] = wishlistItems.map(item => ({
    ...item,
    leadScore: calculateLeadScore(item),
    potentialValue: item.estimatedPrice || 0,
    lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000)
  }));

  function calculateLeadScore(item: WishlistItem): number {
    let score = 50; // Base score
    
    // Priority scoring
    if (item.priority === 'urgent') score += 30;
    else if (item.priority === 'high') score += 20;
    else if (item.priority === 'medium') score += 10;
    
    // Status scoring
    if (item.status === 'sourcing') score += 15;
    else if (item.status === 'found') score += 25;
    
    // Budget scoring
    if (item.estimatedPrice && item.estimatedPrice > 50000) score += 15;
    else if (item.estimatedPrice && item.estimatedPrice > 25000) score += 10;
    
    // Contact info completeness
    if (item.clientPhone) score += 5;
    if (item.clientEmail) score += 5;
    
    return Math.min(100, score);
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lead List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads
              .sort((a, b) => b.leadScore - a.leadScore)
              .map((lead) => (
              <div
                key={lead.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{lead.clientName}</h4>
                    <p className="text-sm text-muted-foreground">{lead.clientEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreColor(lead.leadScore)}`} />
                    <span className="text-sm font-medium">{lead.leadScore}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getPriorityColor(lead.priority) as any}>
                    {lead.priority}
                  </Badge>
                  <Badge variant="outline">{lead.status}</Badge>
                  {lead.potentialValue > 0 && (
                    <Badge variant="secondary">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {lead.potentialValue.toLocaleString()}
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Looking for: {lead.desiredSpecs.make} {lead.desiredSpecs.model || 'Any Model'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lead Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Lead Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedLead ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{selectedLead.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Lead Score</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getScoreColor(selectedLead.leadScore)}`} />
                    <span className="text-sm">{selectedLead.leadScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-sm text-muted-foreground">{selectedLead.clientEmail}</p>
                </div>
                
                {selectedLead.clientPhone && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </label>
                    <p className="text-sm text-muted-foreground">{selectedLead.clientPhone}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Desired Vehicle
                </label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    <strong>Make:</strong> {selectedLead.desiredSpecs.make || 'Any'}<br/>
                    <strong>Model:</strong> {selectedLead.desiredSpecs.model || 'Any'}<br/>
                    <strong>Type:</strong> {selectedLead.desiredSpecs.vehicleType || 'Any'}<br/>
                    {selectedLead.desiredSpecs.priceRange && (
                      <>
                        <strong>Budget:</strong> ${selectedLead.desiredSpecs.priceRange.min?.toLocaleString()} - ${selectedLead.desiredSpecs.priceRange.max?.toLocaleString()}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Follow-up Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Lead
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a lead to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};