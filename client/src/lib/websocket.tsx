import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Authenticate with the server
        wsRef.current?.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id,
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (user && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'authenticated':
        console.log('WebSocket authenticated for user:', data.userId);
        break;

      case 'task_created':
        // Invalidate tasks query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        
        toast({
          title: "New Task Created",
          description: `Task "${data.data.title}" has been created.`,
        });
        break;

      case 'task_updated':
        // Update specific task and invalidate lists
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', data.data.id] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        
        toast({
          title: "Task Updated",
          description: `Task "${data.data.title}" has been updated.`,
        });
        break;

      case 'task_deleted':
        // Remove from cache and refresh lists
        queryClient.removeQueries({ queryKey: ['task', data.data.id] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        
        toast({
          title: "Task Deleted",
          description: "A task has been deleted.",
          variant: "destructive",
        });
        break;

      case 'task_shared':
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', data.data.taskId] });
        
        toast({
          title: "Task Shared With You",
          description: `${data.data.sharedBy.firstName || data.data.sharedBy.email} shared a task with you.`,
        });
        break;

      case 'task_unshared':
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.removeQueries({ queryKey: ['task', data.data.taskId] });
        
        toast({
          title: "Task Access Removed",
          description: "Your access to a shared task has been removed.",
          variant: "destructive",
        });
        break;

      case 'comment_added':
        queryClient.invalidateQueries({ queryKey: ['task', data.data.taskId] });
        
        toast({
          title: "New Comment",
          description: `${data.data.user.firstName || data.data.user.email} commented on a task.`,
        });
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}