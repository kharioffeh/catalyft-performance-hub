import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ExampleComponentProps {
  title: string;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ title }) => {
  return (
    <View style={styles.container} testID="exampleComponent">
      <Text style={styles.title} testID="exampleTitle">{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ExampleComponent;
