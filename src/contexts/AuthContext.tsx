import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { name: string; companyName: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard');
        }
        
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error('Erro no login: ' + error.message);
    } else {
      toast.success('Login realizado com sucesso!');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, userData: { name: string; companyName: string }) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: userData.name,
        }
      }
    });

    if (error) {
      toast.error('Erro no cadastro: ' + error.message);
      return { error };
    }

    if (data.user && !data.session) {
      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      return { error: null };
    }

    // Create company record if user is immediately signed in
    if (data.user && data.session) {
      try {
        await supabase
          .from('empresas')
          .insert([
            {
              user_id: data.user.id,
              name: userData.companyName
            }
          ]);
        
        toast.success('Cadastro realizado com sucesso!');
      } catch (companyError) {
        console.error('Error creating company:', companyError);
        toast.error('Erro ao criar empresa. Entre em contato com o suporte.');
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Logout realizado com sucesso!');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}