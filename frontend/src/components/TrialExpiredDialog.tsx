import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { resetTrialExpiredHandled } from '@/lib/utils';

interface TrialExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  paymentUrl: string;
  onClose?: () => void; // Callback to stop analysis when dialog is closed
}

export function TrialExpiredDialog({ open, onOpenChange, errorMessage, paymentUrl, onClose }: TrialExpiredDialogProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleMakePayment = () => {
    setIsRedirecting(true);
    // Reset the trial expired handled flag before redirecting
    resetTrialExpiredHandled();
    // Redirect to payment URL
    window.location.href = paymentUrl;
  };

  const handleClose = () => {
    // Reset the trial expired handled flag
    resetTrialExpiredHandled();
    // Call the onClose callback to stop analysis if provided
    if (onClose) {
      onClose();
    }
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Trial Expired
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <p className="text-sm text-muted-foreground">
              To continue using our premium features, please upgrade your account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleMakePayment}
              disabled={isRedirecting}
              className="flex-1"
              variant="wellness"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isRedirecting ? 'Redirecting...' : 'Make Payment Now'}
            </Button>
            
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
