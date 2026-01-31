import { useState, useEffect, useCallback } from 'react';
import { setGlobalErrorHandler } from '@/lib/utils';
import { useTrialError } from '@/contexts/TrialErrorContext';

export function useTrialErrorHandler() {
  const [showTrialExpiredDialog, setShowTrialExpiredDialog] = useState(false);
  const [trialErrorData, setTrialErrorData] = useState<{
    message: string;
    paymentUrl: string;
  } | null>(null);
  
  const { stopAnalysis } = useTrialError();

  // Callback to stop analysis when dialog is closed
  const handleClose = useCallback(() => {
    // Stop the analysis when the dialog is closed
    stopAnalysis();
  }, [stopAnalysis]);

  useEffect(() => {
    const handleTrialExpired = (message: string, paymentUrl: string) => {
      // Set the error data and show the dialog
      setTrialErrorData({ message, paymentUrl });
      setShowTrialExpiredDialog(true);
    };

    // Set the global error handler
    setGlobalErrorHandler(handleTrialExpired);

    // Cleanup function
    return () => {
      setGlobalErrorHandler(null);
    };
  }, []);

  return {
    showTrialExpiredDialog,
    setShowTrialExpiredDialog,
    trialErrorData,
    onClose: handleClose,
  };
}
