import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { useAuthStore } from '@/lib/authStore';
import { logger } from '@/lib/logger';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { UserRole } from '@shared/types';
import { SlideUp } from '@/components/animations';
import { Toaster, toast } from 'sonner';
import { THEME_COLORS } from '@/theme/colors';
import { RoleButtonGrid } from '@/components/forms/RoleButtonGrid';
import { validateEmail, validatePassword } from '@/utils/validation';
import { RetryDelay } from '@/config/time';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<UserRole | null>(null);

  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const handleLogin = async (role: UserRole) => {
    setShowValidationErrors(true);
    const emailError = validateEmail(email, true);
    const passwordError = validatePassword(password, true);
    if (!email || !password || emailError || passwordError) {
      return;
    }

    setIsLoading(role);
    try {
      await login(email, password, role);
      toast.success(`Logged in as ${role}. Redirecting...`);
      setTimeout(() => {
        navigate(`/portal/${role}/dashboard`);
      }, RetryDelay.ONE_SECOND);
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      logger.error('Login error', error, { email, role });
    } finally {
      setIsLoading(null);
    }
  };

  const emailError = validateEmail(email, showValidationErrors);
  const passwordError = validatePassword(password, showValidationErrors);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: THEME_COLORS.BACKGROUND }}
    >
      <Toaster richColors />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${THEME_COLORS.PRIMARY}10, ${THEME_COLORS.SECONDARY}10)`,
        }}
      ></div>
      <SlideUp>
        <div className="w-full max-w-md z-10">
          <Card>
            <CardHeader className="text-center">
              <Link to="/" className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="h-10 w-10" style={{ color: THEME_COLORS.PRIMARY }} />
                <span className="text-2xl font-bold text-foreground">Akademia Pro</span>
              </Link>
              <CardTitle className="text-2xl">Unified Login</CardTitle>
              <CardDescription>Enter your credentials to access your portal.</CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowValidationErrors(true);
                if (!isLoading && email && password) {
                  toast.error('Please select your role to login.');
                }
              }}
            >
              <CardContent className="space-y-6">
                <FormField
                  id="email"
                  label="Email"
                  helperText="Enter your registered email address"
                  required
                  error={emailError}
                >
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!isLoading}
                  />
                </FormField>
                <FormField
                  id="password"
                  label="Password"
                  helperText="Enter your password"
                  required
                  error={passwordError}
                >
                  <Input
                    type="password"
                    placeholder="•••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={!!isLoading}
                  />
                </FormField>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">Select your role to login:</p>
                <RoleButtonGrid
                  loadingRole={isLoading}
                  onRoleSelect={handleLogin}
                  buttonClassName="w-full"
                />
                <Link
                  to="/"
                  className="text-sm text-primary hover:underline mt-4 flex items-center gap-1"
                >
                  Back to Home <ArrowRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </form>
          </Card>
        </div>
      </SlideUp>
    </div>
  );
}
