import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, Share2, Bell, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { loginWithGoogle } = useAuth();

  const features = [
    { icon: CheckCircle, title: 'Task Management', description: 'Create, organize, and track your tasks efficiently' },
    { icon: Users, title: 'Team Collaboration', description: 'Share tasks and collaborate with team members' },
    { icon: Share2, title: 'Real-time Sync', description: 'Stay updated with instant notifications and real-time updates' },
    { icon: Bell, title: 'Smart Notifications', description: 'Never miss important deadlines with intelligent reminders' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-foreground">TaskFlow</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The modern way to manage tasks, collaborate with teams, and stay productive.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Everything you need to stay organized
              </h2>
              <p className="text-lg text-muted-foreground">
                TaskFlow brings together powerful task management, seamless collaboration, 
                and real-time updates in one beautiful interface.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl">Welcome to TaskFlow</CardTitle>
                <CardDescription>
                  Sign in to start managing your tasks and collaborating with your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={loginWithGoogle}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Built with ❤️ for teams who want to get things done
          </p>
        </div>
      </div>
    </div>
  );
}