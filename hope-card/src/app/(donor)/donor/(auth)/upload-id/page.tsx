'use client';

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';
import GradientButton from '@/donor-components/GradientButton';

export default function UploadIDScreen() {
  const router = useRouter();
  
  // 1. We added state to track which tab is currently active ('front' or 'back')
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (activeTab === 'front') {
        setFrontFile(e.target.files[0]);
      } else {
        setBackFile(e.target.files[0]);
      }
    }
    // reset input value so selecting the same file again works
    e.target.value = '';
  };

  return (
    <View style={styles.formContainer}>
      {/* Page Headers */}
      <Text style={styles.mainHeader}>Sign up</Text>
      <Text style={styles.subHeader}>Upload ID for Verification</Text>

      {/* The Floating White Card */}
      <View style={styles.uploadCard}>
        
        {/* Tab Navigation Area */}
        <View style={styles.tabContainer}>
          {/* Active Tab (Front) - Now Clickable */}
          <Pressable 
            style={[styles.tab, activeTab === 'front' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('front')}
          >
            <Text style={activeTab === 'front' ? styles.activeTabText : styles.inactiveTabText}>
              <Text style={activeTab === 'front' ? styles.tabNumberActive : styles.tabNumberInactive}>1 </Text> 
              Front page of ID
            </Text>
          </Pressable>
          
          {/* Inactive Tab (Back) - Now Clickable */}
          <Pressable 
            style={[styles.tab, activeTab === 'back' ? styles.activeTab : styles.inactiveTab]}
            onPress={() => setActiveTab('back')}
          >
            <Text style={activeTab === 'back' ? styles.activeTabText : styles.inactiveTabText}>
              <Text style={activeTab === 'back' ? styles.tabNumberActive : styles.tabNumberInactive}>2 </Text> 
              Back page of ID
            </Text>
          </Pressable>
        </View>

        {/* The Grey Dropzone Area - Updates dynamically based on the active tab */}
        <Pressable 
          style={({ pressed }: { pressed: boolean }) => [
            styles.dropzone,
            pressed && { backgroundColor: '#E8E8E8' }
          ]}
          onPress={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🪪</Text>
          </View>
          
          {/* Dynamically changing the text based on the active tab */}
          {(activeTab === 'front' ? frontFile : backFile) ? (
            <Text style={[styles.dropzoneText, { fontWeight: 'bold', color: '#6A1B1B' }]}>
              Selected: {(activeTab === 'front' ? frontFile : backFile)?.name}
            </Text>
          ) : (
            <>
              <Text style={styles.dropzoneText}>
                Upload a copy of the <Text style={{fontWeight: 'bold', color: '#6A1B1B'}}>{activeTab}</Text> of your valid identification in
              </Text>
              <Text style={styles.dropzoneText}>PNG, JPEG or PDF format</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Next Button outside the card */}
      <GradientButton title="Next" onPress={() => console.log('Next step...')} />

      {/* Footer link back to Login */}
      <View style={styles.footerContainer}>
        <View style={styles.line} />
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={() => router.push('/donor/login')}>
          <Text style={styles.loginText}> Login here!</Text>
        </Pressable>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%', 
    maxWidth: 550,      
    padding: 40, 
    alignItems: 'center',
  } as any,
  
  mainHeader: { fontSize: 42, fontWeight: 'bold', color: '#6A1B1B', marginBottom: 40, textAlign: 'center' },
  subHeader: { fontSize: 22, fontWeight: '700', color: '#6A1B1B', alignSelf: 'flex-start', marginBottom: 15, marginLeft: 10 },

  uploadCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    boxShadow: '0px 15px 35px rgba(0, 0, 0, 0.15)',
  } as any,

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    marginHorizontal: 10,
    cursor: 'pointer', // Makes it feel clickable on web
  } as any,
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#6A1B1B', 
  },
  inactiveTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D3D3D3', 
  },
  activeTabText: { fontSize: 14, fontWeight: '600', color: '#6A1B1B', textAlign: 'center' },
  inactiveTabText: { fontSize: 14, fontWeight: '500', color: '#A0A0A0', textAlign: 'center' },
  tabNumberActive: { fontWeight: 'bold', color: '#6A1B1B', fontSize: 16 },
  tabNumberInactive: { fontWeight: 'bold', color: '#A0A0A0', fontSize: 16 },

  dropzone: {
    width: '100%',
    height: 220,
    backgroundColor: '#F7F7F7', 
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    padding: 20,
    boxShadow: 'inset 0px 4px 15px rgba(0, 0, 0, 0.08)', 
  } as any,
  
  iconContainer: { marginBottom: 20 },
  icon: { fontSize: 70, color: '#888', opacity: 0.7 },
  dropzoneText: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  footerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#D9B3B3' },
  footerText: { fontSize: 14, color: '#888', marginLeft: 10, textAlign: 'center' },
  loginText: { fontSize: 14, fontWeight: 'bold', color: '#6A1B1B', marginRight: 10 },
});