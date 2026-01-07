import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/authStore';
import { logger } from '@/lib/logger';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { UserRole } from '@shared/types';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<UserRole | null>(null);
  const handleLogin = async (role: UserRole) => {
    // In a real app, you'd validate credentials here.
    // For this mock, we just log in with the selected role.
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }
    
    setIsLoading(role);
    try {
      await login(email, password, role);
      toast.success(`Logged in as ${role}. Redirecting...`);
      setTimeout(() => {
        navigate(`/portal/${role}/dashboard`);
      }, 1000);
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      logger.error('Login error', error, { email, role });
    } finally {
      setIsLoading(null);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] p-4">
      <Toaster richColors />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D47A1]/10 to-[#00ACC1]/10"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card>
          <CardHeader className="text-center">
            <Link to="/" className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-10 w-10 text-[#0D47A1]" />
              <span className="text-2xl font-bold text-foreground">Akademia Pro</span>
            </Link>
            <CardTitle className="text-2xl">Unified Login</CardTitle>
            <CardDescription>Enter your credentials to access your portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!isLoading}
                aria-required="true"
                aria-invalid={email !== '' && !/^\S+@\S+\.\S+$/.test(email)}
              />
              <p className="text-xs text-muted-foreground">Enter your registered email address</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive" aria-label="required">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!!isLoading}
                aria-required="true"
                aria-invalid={password !== '' && password.length < 6}
              />
              <p className="text-xs text-muted-foreground">Enter your password</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Select your role to login:</p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                onClick={() => handleLogin('student')} 
                className="w-full bg-[#0D47A1] hover:bg-[#0b3a8a]" 
                disabled={isLoading === 'student'}
              >
                {isLoading === 'student' ? 'Logging in...' : 'Student'}
              </Button>
              <Button 
                onClick={() => handleLogin('teacher')} 
                className="w-full bg-[#00ACC1] hover:bg-[#008a99]" 
                disabled={isLoading === 'teacher'}
              >
                {isLoading === 'teacher' ? 'Logging in...' : 'Teacher'}
              </Button>
              <Button 
                onClick={() => handleLogin('parent')} 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                disabled={isLoading === 'parent'}
              >
                {isLoading === 'parent' ? 'Logging in...' : 'Parent'}
              </Button>
              <Button 
                onClick={() => handleLogin('admin')} 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                disabled={isLoading === 'admin'}
              >
                {isLoading === 'admin' ? 'Logging in...' : 'Admin'}
              </Button>
            </div>
            <Link to="/" className="text-sm text-primary hover:underline mt-4 flex items-center gap-1">
              Back to Home <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}