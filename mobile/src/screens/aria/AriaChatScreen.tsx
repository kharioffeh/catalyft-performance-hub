import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import { ariaService } from '../../services/ai/openai';

export const AriaChatScreen = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setChat(prev => [...prev, `You: ${message}`]);
    const response = await ariaService.chat(message);
    setChat(prev => [...prev, `ARIA: ${response}`]);
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARIA - AI Fitness Coach</Text>
      <ScrollView style={styles.chatArea}>
        {chat.map((msg, idx) => (
          <Text key={idx} style={styles.message}>{msg}</Text>
        ))}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask ARIA anything..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  chatArea: { flex: 1, marginBottom: 20 },
  message: { marginVertical: 5 },
  inputArea: { flexDirection: 'row' },
  input: { flex: 1, borderWidth: 1, padding: 10, marginRight: 10 },
});
