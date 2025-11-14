import { useStore } from '@/store/store';
import { supabase } from '@/utils/supabase';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface SupabaseAuthProviderProps {
  children?: React.ReactNode;
}

export const SupabaseAuthProvider = ({
  children,
}: PropsWithChildren<SupabaseAuthProviderProps>) => {
  const { session, setSession, setProfile } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      }

      setSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(data);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [session, setProfile]);

  if (isLoading) {
    return (
      <View>
        <Text>Logging in!</Text>
      </View>
    );
  }

  return <>{children}</>;
};
