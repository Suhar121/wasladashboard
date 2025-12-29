import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const success = login(password);
    
    if (success) {
      toast({
        title: "Welcome!",
        description: "Successfully logged in.",
      });
    } else {
      toast({
        title: "Invalid password",
        description: "Please check your password and try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Coaching Center</CardTitle>
            <CardDescription className="text-base mt-2">
              Finance Dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !password}>
              {isLoading ? "Logging in..." : "Access Dashboard"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Default password: <code className="bg-muted px-2 py-1 rounded text-xs">admin123</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
