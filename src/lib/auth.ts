import { supabase } from './supabase';
import type { User } from '@/types';

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.username || profile.email.split('@')[0],
    role: profile.email === 'hajaraldhaheri2016@gmail.com' ? 'owner' : 'customer',
    createdAt: user.created_at || new Date().toISOString()
  };
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const isOwner = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'owner';
};

// تسجيل الدخول للمالك
export const loginOwner = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('فشل تسجيل الدخول');

    const user = await getCurrentUser();
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// تسجيل عميل جديد
export const registerCustomer = async (email: string, name: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    // إرسال OTP إلى البريد الإلكتروني
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          username: name,
          full_name: name
        }
      }
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// التحقق من OTP وتسجيل الدخول
export const verifyOTP = async (email: string, token: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) throw error;
    if (!data.user) throw new Error('فشل التحقق من الرمز');

    const user = await getCurrentUser();
    
    // إنشاء سجل العميل في جدول customers
    if (user && user.role === 'customer') {
      await supabase
        .from('customers')
        .upsert({ 
          id: user.id,
          phone: '',
          address: ''
        }, { onConflict: 'id' });
    }

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

// نسيت كلمة المرور - إرسال رمز استعادة
export const resetPassword = async (email: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// تحديث كلمة المرور
export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// مزامنة بيانات المستخدم
export const syncCurrentUser = (): Promise<User | null> => {
  return getCurrentUser();
};
