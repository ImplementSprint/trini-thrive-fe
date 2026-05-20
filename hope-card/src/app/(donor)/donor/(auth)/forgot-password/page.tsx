'use client';

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';
import CustomInput from '@/donor-components/CustomInput';
import GradientButton from '@/donor-components/GradientButton';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSendOtp = async () => {
    if (!email) {
      setErrorMessage('Email is required');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/auth/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      // Success, route to OTP screen and pass the email so they know who it belongs to
      router.push(`/otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.headerText}>Forgot Password?</Text>
      
      <Text style={styles.subHeaderText}>Find your account</Text>

      {errorMessage ? (
        <Text style={{ color: '#E74C3C', textAlign: 'center', marginBottom: 15, fontSize: 13 }}>
          {errorMessage}
        </Text>
      ) : null}

      <CustomInput 
        placeholder="Enter your email" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        icon={<Text style={styles.icon}>✉️</Text>} 
      />

      <GradientButton 
        title={isLoading ? 'Sending...' : 'Continue'} 
        onPress={handleSendOtp} 
      />

      {/* Footer updated to match the mockup */}
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
    marginBottom: 50, // Pushed down slightly to give the top more breathing room    
    textAlign: 'center' 
  },
  subHeaderText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#6A1B1B', 
    alignSelf: 'flex-start', // Left aligned to match mockup
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