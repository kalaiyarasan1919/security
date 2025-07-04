import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  provider: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch('/auth/user', {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        return response.json();
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
      window.location.href = '/';
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const loginWithGoogle = () => {
    window.location.href = '/auth/google';
  };

  return {
    user,
    loading,
    error,
    logout,
    loginWithGoogle,
    isAuthenticated: !!user,
  };
}