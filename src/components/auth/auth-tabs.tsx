import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { useAuth } from '@/lib/stores/auth-store';

export function AuthTabs() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <LoginForm />
        </div>
      </TabsContent>
      <TabsContent value="register">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
            <p className="text-muted-foreground">
              Enter your information to create a new account
            </p>
          </div>
          <RegisterForm />
        </div>
      </TabsContent>
    </Tabs>
  );
}