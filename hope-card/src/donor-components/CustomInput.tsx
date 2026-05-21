import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function CustomInput({ icon, style, ...props }: any) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>{icon}</View>
      <TextInput 
        style={styles.input} // <--- This now includes the black text color!
        placeholderTextColor="#A0A0A0" 
        {...props} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 10, 
    paddingHorizontal: 15, 
    height: 50,          // Balanced height for both screens
    marginBottom: 16,    
    width: '100%',       // Automatically adapts to the container size
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  } as any,
  iconContainer: {
    marginRight: 10,
    width: 24,
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    outlineStyle: 'none',
    fontSize: 15,
    color: '#333'        // <--- THE FIX: This forces the typed text to be dark gray/black globally!
  } as any
});