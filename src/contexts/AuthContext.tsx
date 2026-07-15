import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/profile";

interface SignUpDetails {
  role: "student" | "lecturer";
  registrationNumber?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  // True until we've resolved the initial session AND (if signed in) the profile row.
  loading: boolean;
  // True from the moment a password-recovery link is opened until the user
  // finishes (or abandons) setting a new password. Used to keep a recovery
  // session pinned to /reset-password instead of falling through to a
  // normal dashboard redirect.
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, details: SignUpDetails) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // Row may not exist for a split second right after signup while the
      // handle_new_user trigger runs — treat as "no profile yet" rather
      // than a hard failure.
      setProfile(null);
    } else {
      setProfile(data as Profile);
    }
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // Fired specifically when the session came from a password-recovery
      // link, as opposed to a normal sign-in. Distinguishing this is the
      // whole reason /reset-password can tell "came from the email link"
      // apart from "already logged in and browsed here".
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, details: SignUpDetails) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: details.role,
          registration_number: details.registrationNumber ?? null,
        },
      },
    });

    if (error) return { error: error.message, needsEmailConfirmation: false };

    // If email confirmation is turned on in the Supabase dashboard, signUp
    // succeeds but returns no session until the user clicks the link.
    const needsEmailConfirmation = !data.session;
    return { error: null, needsEmailConfirmation };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  const loading = !sessionLoaded || (!!session?.user && profileLoading && !profile);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updatePassword,
        clearPasswordRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
