import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Theme } from '../../../features/theme/ThemeContext'; // Assuming your theme type

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveImage: (uri: string | null) => void;
  theme: Theme;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ visible, onClose, onSaveImage, theme }) => {
  const [pickedImage, setPickedImage] = useState<string | null>(null);

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
        return false;
      }
      return true;
    }
    return true; // Assume granted on web for simplicity or handle web specific flow
  };

  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need media library permissions to make this work!');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    onSaveImage(pickedImage);
    setPickedImage(null); // Reset for next time
    onClose();
  };

  const handleDelete = () => {
    setPickedImage(null);
    // Optionally, if you want to immediately close or go back to options:
    // onSaveImage(null); 
    // onClose(); 
  };

  const handleRetake = () => {
    setPickedImage(null); // This will show the initial options again
  };

  const handleCloseModal = () => {
    setPickedImage(null); // Reset image if modal is closed without saving
    onClose();
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
            <Ionicons name="close-circle" size={30} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {!pickedImage ? (
            <View style={styles.optionsContainer}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Add Receipt</Text>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera-outline" size={24} color={theme.colors.buttonText} />
                <Text style={[styles.optionText, { color: theme.colors.buttonText }]}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleChooseFromLibrary}
              >
                <Ionicons name="image-outline" size={24} color={theme.colors.buttonText} />
                <Text style={[styles.optionText, { color: theme.colors.buttonText }]}>Upload from Device</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary, marginBottom: 15 }]}>Receipt Preview</Text>
              <Image source={{ uri: pickedImage }} style={styles.previewImage} />
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={28} color={theme.colors.error} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRetake} style={styles.actionButton}>
                  <Ionicons name="refresh-outline" size={28} color={theme.colors.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                  <Ionicons name="save-outline" size={28} color={theme.colors.accent} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.accent }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 250, // Adjust as needed
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionButtonText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default ImagePickerModal;