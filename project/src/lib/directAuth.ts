import { supabase } from './supabase';

// This function attempts to directly authenticate a user without email verification
export async function directPasswordReset(email: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    // Try to sign in with the current password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!signInError && signInData.session) {
      // If we can sign in, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      
      if (updateError) {
        return { 
          success: false, 
          message: `Failed to update password: ${updateError.message}` 
        };
      }
      
      return { 
        success: true, 
        message: 'Password updated successfully.' 
      };
    }
    
    // If we can't sign in, try to create a new account
    const { data, error: createError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    
    if (createError) {
      return { 
        success: false, 
        message: `Failed to create account: ${createError.message}` 
      };
    }
    
    if (data.user?.identities && data.user.identities.length === 0) {
      // This means the user already exists
      return { 
        success: false, 
        message: "This email is already registered. Please try signing in or contact support for password recovery." 
      };
    }
    
    return { 
      success: true, 
      message: 'Account created successfully. You can now sign in.' 
    };
    
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}