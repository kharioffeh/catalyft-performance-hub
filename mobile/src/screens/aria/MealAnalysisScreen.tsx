import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevices, PhotoFile } from 'react-native-vision-camera';
import ImagePicker from 'react-native-image-picker';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../hooks/useAuth';
import { ariaService } from '../../services/ai/openai';
import { Food, Meal } from '../../types/ai';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyzedFood extends Food {
  confidence: number;
  alternatives?: Food[];
}

interface MealAnalysis {
  foods: AnalyzedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealType: string;
  healthScore: number;
  suggestions: string[];
}

const MealAnalysisScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const camera = useRef<Camera>(null);
  
  // State management
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [servingSize, setServingSize] = useState('1');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFood, setSelectedFood] = useState<AnalyzedFood | null>(null);
  
  const devices = useCameraDevices();
  const device = devices.back;
  
  // Meal type detection based on time
  const getMealType = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 17) return 'snack';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'snack';
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    if (!camera.current) return;
    
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'balanced',
      });
      setPhoto(photo);
      setPhotoUri(`file://${photo.path}`);
      setShowCamera(false);
      analyzePhoto(`file://${photo.path}`);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };
  
  // Pick photo from gallery
  const pickFromGallery = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setPhotoUri(asset.uri || null);
          if (asset.uri) {
            analyzePhoto(asset.uri);
          }
        }
      }
    );
  };
  
  // Analyze photo with AI
  const analyzePhoto = async (uri: string) => {
    if (!user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Convert image to base64
      const base64Image = await convertToBase64(uri);
      
      // Send to AI for analysis
      const prompt = `Analyze this meal photo and provide:
        1. List of foods with estimated portions
        2. Calories, protein, carbs, fats for each item
        3. Total nutritional values
        4. Health score (1-10)
        5. Suggestions for improvement`;
      
      const response = await ariaService.chat(user.id, prompt);
      
      // Parse response into structured data
      const mealAnalysis = parseMealAnalysis(response);
      setAnalysis(mealAnalysis);
    } catch (error) {
      console.error('Photo analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze meal. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Convert image to base64
  const convertToBase64 = async (uri: string): Promise<string> => {
    // This would be actual image to base64 conversion
    return `data:image/jpeg;base64,placeholder`;
  };
  
  // Parse AI response into structured data
  const parseMealAnalysis = (response: string): MealAnalysis => {
    // This would parse the actual AI response
    // For now, returning mock data
    return {
      foods: [
        {
          id: '1',
          name: 'Grilled Chicken Breast',
          quantity: 150,
          unit: 'g',
          calories: 248,
          protein: 46,
          carbs: 0,
          fats: 5,
          confidence: 0.92,
        },
        {
          id: '2',
          name: 'Brown Rice',
          quantity: 100,
          unit: 'g',
          calories: 112,
          protein: 2.6,
          carbs: 24,
          fats: 0.9,
          confidence: 0.88,
        },
        {
          id: '3',
          name: 'Steamed Broccoli',
          quantity: 80,
          unit: 'g',
          calories: 27,
          protein: 2.3,
          carbs: 5.6,
          fats: 0.3,
          confidence: 0.95,
        },
      ],
      totalCalories: 387,
      totalProtein: 50.9,
      totalCarbs: 29.6,
      totalFats: 6.2,
      mealType: getMealType(),
      healthScore: 8.5,
      suggestions: [
        'Great protein content! Consider adding healthy fats like avocado.',
        'Good balance of macros. The vegetables provide excellent micronutrients.',
        'Consider adding a small portion of nuts for omega-3 fatty acids.',
      ],
    };
  };
  
  // Save meal to nutrition log
  const saveMeal = async () => {
    if (!analysis || !user) return;
    
    try {
      const meal: Meal = {
        id: `meal_${Date.now()}`,
        name: customNotes || 'Quick Meal',
        time: new Date(),
        calories: analysis.totalCalories,
        protein: analysis.totalProtein,
        carbs: analysis.totalCarbs,
        fats: analysis.totalFats,
        foods: analysis.foods,
        mealType: analysis.mealType as any,
      };
      
      // Save to database
      // await saveMealToDatabase(meal);
      
      Alert.alert('Success', 'Meal logged successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal');
    }
  };
  
  // Adjust food quantity
  const adjustQuantity = (foodId: string, newQuantity: number) => {
    if (!analysis) return;
    
    const updatedFoods = analysis.foods.map(food => {
      if (food.id === foodId) {
        const ratio = newQuantity / food.quantity;
        return {
          ...food,
          quantity: newQuantity,
          calories: Math.round(food.calories * ratio),
          protein: Math.round(food.protein * ratio * 10) / 10,
          carbs: Math.round(food.carbs * ratio * 10) / 10,
          fats: Math.round(food.fats * ratio * 10) / 10,
        };
      }
      return food;
    });
    
    // Recalculate totals
    const totals = updatedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    setAnalysis({
      ...analysis,
      foods: updatedFoods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fats,
    });
  };
  
  // Remove food item
  const removeFood = (foodId: string) => {
    if (!analysis) return;
    
    const updatedFoods = analysis.foods.filter(food => food.id !== foodId);
    
    // Recalculate totals
    const totals = updatedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    setAnalysis({
      ...analysis,
      foods: updatedFoods,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fats,
    });
  };
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return '#34C759';
    if (score >= 6) return '#FFCC00';
    return '#FF3B30';
  };
  
  const renderCamera = () => {
    if (!device) {
      return (
        <View style={styles.cameraPlaceholder}>
          <Text>Camera not available</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={showCamera}
          photo={true}
        />
        
        <View style={styles.cameraOverlay}>
          <View style={styles.captureGuide}>
            <View style={styles.guideCorner} />
            <View style={[styles.guideCorner, styles.guideCornerTR]} />
            <View style={[styles.guideCorner, styles.guideCornerBL]} />
            <View style={[styles.guideCorner, styles.guideCornerBR]} />
          </View>
          <Text style={styles.captureHint}>Center your meal in the frame</Text>
        </View>
        
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() => {
              setShowCamera(false);
              pickFromGallery();
            }}
          >
            <Icon name="images" size={30} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCamera(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderAnalysis = () => {
    if (!analysis) return null;
    
    return (
      <ScrollView style={styles.analysisContainer}>
        {/* Health Score */}
        <View style={styles.healthScoreCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.healthScoreGradient}
          >
            <View style={styles.healthScoreContent}>
              <Text style={styles.healthScoreLabel}>Health Score</Text>
              <View style={styles.healthScoreValue}>
                <Text style={styles.healthScoreNumber}>{analysis.healthScore}</Text>
                <Text style={styles.healthScoreMax}>/10</Text>
              </View>
              <View style={styles.healthScoreBar}>
                <View
                  style={[
                    styles.healthScoreProgress,
                    {
                      width: `${analysis.healthScore * 10}%`,
                      backgroundColor: getHealthScoreColor(analysis.healthScore),
                    },
                  ]}
                />
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Macro Summary */}
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>Nutritional Breakdown</Text>
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Icon name="flame" size={24} color="#FF3B30" />
              <Text style={styles.macroValue}>{analysis.totalCalories}</Text>
              <Text style={styles.macroLabel}>Calories</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="fitness" size={24} color="#007AFF" />
              <Text style={styles.macroValue}>{analysis.totalProtein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="nutrition" size={24} color="#FFCC00" />
              <Text style={styles.macroValue}>{analysis.totalCarbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Icon name="water" size={24} color="#34C759" />
              <Text style={styles.macroValue}>{analysis.totalFats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>
        </View>
        
        {/* Food Items */}
        <View style={styles.foodsSection}>
          <View style={styles.foodsHeader}>
            <Text style={styles.foodsTitle}>Detected Foods</Text>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Icon name={editMode ? 'checkmark' : 'pencil'} size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          {analysis.foods.map((food) => (
            <View key={food.id} style={styles.foodCard}>
              <View style={styles.foodHeader}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <View style={styles.foodQuantity}>
                    {editMode ? (
                      <TextInput
                        style={styles.quantityInput}
                        value={food.quantity.toString()}
                        onChangeText={(text) => {
                          const newQuantity = parseInt(text) || 0;
                          adjustQuantity(food.id, newQuantity);
                        }}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.quantityText}>{food.quantity}</Text>
                    )}
                    <Text style={styles.unitText}>{food.unit}</Text>
                  </View>
                </View>
                {editMode && (
                  <TouchableOpacity onPress={() => removeFood(food.id)}>
                    <Icon name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.foodMacros}>
                <Text style={styles.foodMacro}>{food.calories} cal</Text>
                <Text style={styles.foodMacro}>P: {food.protein}g</Text>
                <Text style={styles.foodMacro}>C: {food.carbs}g</Text>
                <Text style={styles.foodMacro}>F: {food.fats}g</Text>
              </View>
              
              {'confidence' in food && (
                <View style={styles.confidenceBar}>
                  <Text style={styles.confidenceLabel}>
                    Confidence: {Math.round(food.confidence * 100)}%
                  </Text>
                  <View style={styles.confidenceProgress}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${food.confidence * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
        
        {/* AI Suggestions */}
        {analysis.suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionsTitle}>AI Suggestions</Text>
            {analysis.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionCard}>
                <Icon name="bulb-outline" size={20} color="#FFCC00" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Meal Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about this meal..."
            value={customNotes}
            onChangeText={setCustomNotes}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => {
              setPhoto(null);
              setPhotoUri(null);
              setAnalysis(null);
              setShowCamera(true);
            }}
          >
            <Icon name="camera-outline" size={20} color="#667eea" />
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
            <LinearGradient
              colors={['#34C759', '#30B251']}
              style={styles.saveButtonGradient}
            >
              <Icon name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Log Meal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Analysis</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {showCamera && renderCamera()}
      
      {!showCamera && !photoUri && (
        <View style={styles.startContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.illustrationGradient}
          >
            <Icon name="restaurant" size={80} color="#fff" />
          </LinearGradient>
          
          <Text style={styles.startTitle}>AI-Powered Meal Analysis</Text>
          <Text style={styles.startSubtitle}>
            Take a photo of your meal and ARIA will analyze its nutritional content
          </Text>
          
          <TouchableOpacity
            style={styles.cameraStartButton}
            onPress={() => setShowCamera(true)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.cameraStartGradient}
            >
              <Icon name="camera" size={24} color="#fff" />
              <Text style={styles.cameraStartText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.galleryStartButton} onPress={pickFromGallery}>
            <Icon name="images-outline" size={20} color="#667eea" />
            <Text style={styles.galleryStartText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {photoUri && !showCamera && (
        <>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.analyzingText}>Analyzing your meal...</Text>
            </View>
          ) : (
            renderAnalysis()
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  illustrationGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  startSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  cameraStartButton: {
    width: '100%',
    marginBottom: 15,
  },
  cameraStartGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  cameraStartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  galleryStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  galleryStartText: {
    color: '#667eea',
    fontSize: 14,
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureGuide: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    position: 'relative',
  },
  guideCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  guideCornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  guideCornerBL: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  guideCornerBR: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  captureHint: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  galleryButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  closeButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  photoPreview: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  analysisContainer: {
    flex: 1,
  },
  healthScoreCard: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  healthScoreGradient: {
    padding: 20,
  },
  healthScoreContent: {
    alignItems: 'center',
  },
  healthScoreLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  healthScoreValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  healthScoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  healthScoreMax: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
  healthScoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: 15,
    overflow: 'hidden',
  },
  healthScoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  macroCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  foodsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  foodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  foodsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  foodQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 60,
    marginRight: 5,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
  },
  foodMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  foodMacro: {
    fontSize: 12,
    color: '#666',
  },
  confidenceBar: {
    marginTop: 5,
  },
  confidenceLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 3,
  },
  confidenceProgress: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#667eea',
  },
  suggestionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notesSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  retakeButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MealAnalysisScreen;