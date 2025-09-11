import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  Download, 
  Upload, 
  X 
} from 'lucide-react';
import { Car } from '@/types/car';
import { useToast } from '@/hooks/use-toast';

interface BulkCarOperationsProps {
  selectedCars: Car[];
  onClearSelection: () => void;
  onBulkDelete: (carIds: string[]) => void;
  onBulkEdit: (carIds: string[]) => void;
  onExport: (cars: Car[]) => void;
}

export const BulkCarOperations: React.FC<BulkCarOperationsProps> = ({
  selectedCars,
  onClearSelection,
  onBulkDelete,
  onBulkEdit,
  onExport
}) => {
  const { toast } = useToast();

  const handleExport = () => {
    onExport(selectedCars);
    toast({
      title: "Export Started",
      description: `Exporting ${selectedCars.length} cars to CSV`,
    });
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedCars.length} cars?`)) {
      onBulkDelete(selectedCars.map(car => car.id));
      toast({
        title: "Cars Deleted",
        description: `${selectedCars.length} cars have been deleted`,
      });
    }
  };

  if (selectedCars.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {selectedCars.length} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBulkEdit(selectedCars.map(car => car.id))}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Selected
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
};