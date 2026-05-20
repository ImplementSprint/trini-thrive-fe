'use client';

import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomInput from '@/donor-components/CustomInput';
import GradientButton from '@/donor-components/GradientButton';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const sessionToken = searchParams.get('token') || '';

  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleReset = async () => {
    if (!password) {
      setErrorMessage('Password is required');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionToken, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      console.log('Password updated successfully!');
      router.push('/donor/login');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Forgot Password?</Text>
      
      <Text style={styles.subHeaderText}>Re-enter New Password</Text>

      {errorMessage ? (
        <Text style={{ color: '#E74C3C', textAlign: 'center', marginBottom: 15, fontSize: 13 }}>
          {errorMessage}
        </Text>
      ) : null}

      <CustomInput 
        placeholder="Enter New Password" 
        secureTextEntry={true} // Hides the password text
        value={password}
        onChangeText={setPassword}
        icon={<Text style={styles.icon}>🔑</Text>} 
      />

      <GradientButton 
        title={isLoading ? 'Updating...' : 'Continue'} 
        onPress={handleReset} 
      />

      {/* Standard Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Dont have an account? </Text>
        <Pressable onPress={() => router.push('/donor/signup')}>
          <Text style={styles.signupText}> Sign up here!</Text>
        </Pressable>
        <View style={styles.line} />
      </View>
    </View>
  );
}

export default function ResetPasswordScreen() {
  return (
    <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%', 
    maxWidth: 480,       
    padding: 40,         
    alignItems: 'stretch', 
  } as any,
  headerText: { 
    fontSize: 42,        
    fontWeight: 'bold', 
    color: '#6A1B1B', 
    marginBottom: 50,    
    textAlign: 'center' 
  },
  subHeaderText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#6A1B1B', 
    alignSelf: 'flex-start',
    marginBottom: 20,    
    marginLeft: 5,
  },
  icon: { fontSize: 16, color: '#888' },
  footerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 50,       
    width: '100%' 
  },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 14, color: '#888', marginLeft: 10, textAlign: 'center' },
  signupText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10 },
});