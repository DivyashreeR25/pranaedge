import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Returns headers including Authorization if token exists
export function getAuthHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  // Support both keys: 'access_token' (our default) and 'token' (compat)
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const base: HeadersInit = {
    ...(additionalHeaders || {}),
  };
  if (token) {
    return { ...base, Authorization: `Bearer ${token}` };
  }
  return base;
}

// Interface for trial expired error response
interface TrialExpiredError {
  error: string;
  payment_url: string;
}

// Global error handler for trial expired errors - now shows dialog instead of redirecting
let globalErrorHandler: ((message: string, paymentUrl: string) => void) | null = null;

// Flag to track if a trial expired error has been handled
let trialExpiredHandled = false;

export function setGlobalErrorHandler(handler: (message: string, paymentUrl: string) => void) {
  globalErrorHandler = handler;
}

// Check if a trial expired error has been handled recently
export function wasTrialExpiredHandled(): boolean {
  return trialExpiredHandled;
}

// Reset the trial expired handled flag
export function resetTrialExpiredHandled(): void {
  trialExpiredHandled = false;
}

// Handle trial expired errors
export function handleTrialExpiredError(errorData: TrialExpiredError | unknown) {
  if (
    typeof errorData === 'object' && 
    errorData !== null && 
    'error' in errorData && 
    'payment_url' in errorData &&
    (errorData as TrialExpiredError).error === "Trial expired. Please upgrade to premium."
  ) {
    const trialError = errorData as TrialExpiredError;
    if (globalErrorHandler) {
      // Set the flag that this error has been handled
      trialExpiredHandled = true;
      // Use the global error handler to show dialog
      globalErrorHandler(trialError.error, trialError.payment_url);
    } else {
      // Fallback to alert and redirect if no handler is set
      alert("Trial expired. Please upgrade to premium.");
      window.location.href = trialError.payment_url;
    }
    return true; // Indicates error was handled
  }
  return false; // Indicates error was not handled
}

// Convenience fetch wrapper that adds Authorization header and handles 403 errors
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = getAuthHeaders(init?.headers);
  const response = await fetch(input, { ...init, headers });
  
  // Handle 403 errors specifically for trial expired
  if (response.status === 403) {
    try {
      const errorData = await response.json();
      if (handleTrialExpiredError(errorData)) {
        // Error was handled, return a rejected promise to prevent further processing
        throw new Error("Trial expired - showing payment dialog");
      }
    } catch (parseError) {
      // If we can't parse the error response, just continue with normal error handling
      console.warn("Could not parse 403 error response:", parseError);
    }
  }
  
  return response;
}
