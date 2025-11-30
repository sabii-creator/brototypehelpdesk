import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      
      // If no profile exists, create one automatically
      if (!profileData) {
        console.log("No profile found, creating one...");
        
        // Get user data from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
              email: user.email || "",
              email_verified: user.user_metadata?.email_verified || false,
            })
            .select()
            .single();
            
          if (createError) {
            console.error("Failed to create profile:", createError);
            toast({
              title: "Setup Required",
              description: "Please contact an administrator to complete your account setup.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          setProfile(newProfile);
          
          toast({
            title: "Profile Created",
            description: "Your account has been set up successfully!",
          });
        } else {
          setLoading(false);
          return;
        }
      } else {
        setProfile(profileData);
      }

      // UI-ONLY: Check admin role for client-side rendering
      // SECURITY: Actual authorization is enforced server-side via RLS policies
      // This flag only controls UI visibility - all data access is protected by RLS
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;
      setIsAdmin(!!roleData);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      navigate("/auth");
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    profile,
    isAdmin,
    loading,
    signOut,
  };
};
