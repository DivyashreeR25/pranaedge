import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

// Validation functions
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email) return { isValid: false, message: "Email is required" };
  if (!EMAIL_REGEX.test(email)) return { isValid: false, message: "Please enter a valid email address" };
  return { isValid: true, message: "Valid email" };
};

const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) return { isValid: false, message: "Password is required" };
  if (password.length < 8) return { isValid: false, message: "Password must be at least 8 characters long" };
  if (!/[A-Z]/.test(password)) return { isValid: false, message: "Password must contain at least one uppercase letter" };
  if (!/[a-z]/.test(password)) return { isValid: false, message: "Password must contain at least one lowercase letter" };
  if (!/[0-9]/.test(password)) return { isValid: false, message: "Password must contain at least one number" };
  if (!/[@$!%*?&]/.test(password)) return { isValid: false, message: "Password must contain at least one special character (@$!%*?&)" };
  return { isValid: true, message: "Strong password" };
};

export function SignupDialog({ open, onOpenChange, onSwitchToLogin }: SignupDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { signup } = useAuth();
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const validation = validateEmail(value);
    setEmailError(validation.isValid ? '' : validation.message);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const validation = validatePassword(value);
    setPasswordError(validation.isValid ? '' : validation.message);
    
    // Also validate confirm password when password changes
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError("Passwords don't match");
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    const success = await signup(email, password);
    
    if (success) {
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });
      onSwitchToLogin();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setEmailError('');
      setPasswordError('');
      setConfirmPasswordError('');
    } else {
      toast({
        title: "Signup failed",
        description: "Please try again with different credentials.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Create Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className={emailError ? "border-red-500" : ""}
              required
            />
            {emailError && (
              <p className="text-sm text-red-500">{emailError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? "border-red-500" : ""}
              required
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={confirmPasswordError ? "border-red-500" : ""}
              required
            />
            {confirmPasswordError && (
              <p className="text-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            variant="wellness" 
            disabled={isLoading || !!emailError || !!passwordError || !!confirmPasswordError}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}