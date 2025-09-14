import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';
import { saveProject, generateId } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onProjectAdded: () => void;
}

export function AddProjectDialog({ open, onOpenChange, clientId, onProjectAdded }: AddProjectDialogProps) {
  const [numberOfVideos, setNumberOfVideos] = useState('');
  const [chargePerVideo, setChargePerVideo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const total = (parseFloat(numberOfVideos) || 0) * (parseFloat(chargePerVideo) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numberOfVideos || !chargePerVideo || parseFloat(numberOfVideos) <= 0 || parseFloat(chargePerVideo) <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid numbers for videos and charge per video",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newProject: Project = {
        id: generateId(),
        clientId,
        numberOfVideos: parseInt(numberOfVideos),
        chargePerVideo: parseFloat(chargePerVideo),
        total: total,
        createdAt: new Date()
      };

      await saveProject(newProject);
      
      toast({
        title: "Success",
        description: `Project added successfully (Total: $${total.toFixed(2)})`,
      });

      setNumberOfVideos('');
      setChargePerVideo('');
      onOpenChange(false);
      onProjectAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Add a new video editing project for this client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfVideos">Number of Videos</Label>
              <Input
                id="numberOfVideos"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={numberOfVideos}
                onChange={(e) => setNumberOfVideos(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chargePerVideo">Charge per Video ($)</Label>
              <Input
                id="chargePerVideo"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 100.00"
                value={chargePerVideo}
                onChange={(e) => setChargePerVideo(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {total > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Project Value</p>
              <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              {isLoading ? 'Adding...' : 'Add Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}