import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';

export default function NutritionScreen() {
  const [scannerModalVisible, setScannerModalVisible] = React.useState(false);
  const [mealModalVisible, setMealModalVisible] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [productRecognized, setProductRecognized] = React.useState(false);
  const [mealName, setMealName] = React.useState('');
  const [calories, setCalories] = React.useState('');
  const [protein, setProtein] = React.useState('');

  const handleBarcodeScanner = () => {
    setScannerModalVisible(true);
    setProductRecognized(false);
    setIsScanning(false);
  };

  const handleMockScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setProductRecognized(true);
    }, 2000);
  };

  const handleAddToLog = () => {
    Alert.alert('Added to Log', 'Protein Bar added to your food log!');
    setScannerModalVisible(false);
    setProductRecognized(false);
  };

  const handleSaveMeal = () => {
    if (mealName && calories) {
      Alert.alert('Meal Saved', `${mealName} (${calories} calories) added to your log!`);
      setMealModalVisible(false);
      setMealName('');
      setCalories('');
      setProtein('');
    }
  };

  const todaysMeals = [
    { id: 1, name: 'Protein Bar', calories: 250, protein: 20 },
    { id: 2, name: 'Chicken Breast', calories: 165, protein: 25 },
  ];

  const dailyMacros = {
    calories: { current: 415, target: 2200 },
    protein: { current: 45, target: 150 },
    carbs: { current: 30, target: 220 },
    fat: { current: 15, target: 75 },
  };

  return (
    <ScrollView style={styles.container} testID="nutrition-container">
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Track your fuel</Text>
      </View>

      {/* Daily Macros Summary */}
      <View style={styles.macrosContainer} testID="daily-macros-updated">
        <Text style={styles.sectionTitle}>Today's Macros</Text>
        <View style={styles.macrosGrid}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Calories</Text>
            <Text style={styles.macroValue}>
              {dailyMacros.calories.current}/{dailyMacros.calories.target}
            </Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>
              {dailyMacros.protein.current}g/{dailyMacros.protein.target}g
            </Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>
              {dailyMacros.carbs.current}g/{dailyMacros.carbs.target}g
            </Text>
          </View>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>
              {dailyMacros.fat.current}g/{dailyMacros.fat.target}g
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleBarcodeScanner}
          testID="barcode-scanner-button"
        >
          <Text style={styles.actionButtonText}>📱 Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setMealModalVisible(true)}
          testID="quick-add-meal"
        >
          <Text style={styles.actionButtonText}>➕ Quick Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Meals */}
      <View style={styles.mealsContainer}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        {todaysMeals.map((meal) => (
          <View 
            key={meal.id} 
            style={styles.mealEntry}
            testID={`meal-entry-${meal.name.toLowerCase().replace(' ', '-')}`}
          >
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDetails}>
                {meal.calories} cal • {meal.protein}g protein
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={scannerModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} testID="barcode-scanner-modal">
            <Text style={styles.modalTitle}>Barcode Scanner</Text>
            
            {!isScanning && !productRecognized && (
              <View style={styles.scannerContainer}>
                <View style={styles.scannerFrame}>
                  <Text style={styles.scannerText}>Point camera at barcode</Text>
                </View>
                <TouchableOpacity 
                  style={styles.mockScanButton}
                  onPress={handleMockScan}
                  testID="mock-barcode-scan"
                >
                  <Text style={styles.buttonText}>Simulate Scan</Text>
                </TouchableOpacity>
              </View>
            )}

            {isScanning && (
              <View style={styles.scanningContainer} testID="scanning-animation">
                <Text style={styles.scanningText}>Scanning...</Text>
                <View style={styles.scanningIndicator} />
              </View>
            )}

            {productRecognized && (
              <View style={styles.productContainer} testID="product-recognition-result">
                <Text style={styles.productTitle} testID="product-name-display">
                  Protein Bar - Chocolate
                </Text>
                
                <View style={styles.nutritionInfo}>
                  <Text style={styles.nutritionTitle}>Nutrition Facts (per bar):</Text>
                  <Text style={styles.nutritionItem} testID="nutrition-calories">
                    Calories: 250
                  </Text>
                  <Text style={styles.nutritionItem} testID="nutrition-protein">
                    Protein: 20g
                  </Text>
                  <Text style={styles.nutritionItem} testID="nutrition-carbs">
                    Carbs: 25g
                  </Text>
                  <Text style={styles.nutritionItem} testID="nutrition-fat">
                    Fat: 8g
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddToLog}
                  testID="add-to-log-button"
                >
                  <Text style={styles.buttonText}>Add to Log</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setScannerModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Quick Add Meal Modal */}
      <Modal
        visible={mealModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Add Meal</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Meal name"
              value={mealName}
              onChangeText={setMealName}
              testID="meal-name-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Calories"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              testID="meal-calories-input"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              testID="meal-protein-input"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveMeal}
                testID="save-meal-button"
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setMealModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  macrosContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  mealsContainer: {
    padding: 20,
  },
  mealEntry: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mealDetails: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scannerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  mockScanButton: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanningContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scanningIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    opacity: 0.7,
  },
  productContainer: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  nutritionInfo: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nutritionItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    flex: 0.4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});