import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices, VideoFile } from 'react-native-vision-camera';
import Video from 'react-native-video';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { ariaService } from '../../services/ai/openai';
import { FormAnalysis, FormIssue } from '../../types/ai';
import { useAuth } from '../../hooks/useAuth';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FormAnalyzerProps {
  exercise: string;
  onComplete?: (analysis: FormAnalysis) => void;
}

const FormAnalyzer: React.FC<FormAnalyzerProps> = ({ exercise, onComplete }) => {
  const { user } = useAuth();
  const camera = useRef<Camera>(null);
  const videoPlayer = useRef<Video>(null);
  
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<VideoFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<FormIssue | null>(null);
  
  const devices = useCameraDevices();
  const device = cameraPosition === 'back' ? devices.back : devices.front;
  
  // Recording controls
  const startRecording = async () => {
    if (!camera.current) return;
    
    try {
      setIsRecording(true);
      const video = await camera.current.startRecording({
        onRecordingFinished: (video) => {
          setRecordedVideo(video);
          setIsRecording(false);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          setIsRecording(false);
          Alert.alert('Recording Error', 'Failed to record video');
        },
      });
    } catch (error) {
      console.error('Start recording error:', error);
      setIsRecording(false);
    }
  };
  
  const stopRecording = async () => {
    if (!camera.current) return;
    
    try {
      await camera.current.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };
  
  const flipCamera = () => {
    setCameraPosition(prev => prev === 'back' ? 'front' : 'back');
  };
  
  // Extract frames for analysis
  const extractFrames = async (videoPath: string): Promise<string[]> => {
    // In a real implementation, this would extract frames from the video
    // For now, returning placeholder base64 strings
    const frames: string[] = [];
    const frameCount = 5; // Extract 5 key frames
    
    for (let i = 0; i < frameCount; i++) {
      // This would be actual frame extraction logic
      frames.push(`data:image/jpeg;base64,placeholder_frame_${i}`);
    }
    
    return frames;
  };
  
  // Analyze form with AI
  const analyzeForm = async () => {
    if (!recordedVideo || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Extract frames from video
      const frames = await extractFrames(recordedVideo.path);
      
      // Send to AI for analysis
      const formAnalysis = await ariaService.analyzeForm(frames, exercise);
      
      // Add additional analysis data
      const enhancedAnalysis: FormAnalysis = {
        ...formAnalysis,
        id: `analysis_${Date.now()}`,
        exercise,
        date: new Date(),
        videoUrl: recordedVideo.path,
        frames,
        overallScore: calculateOverallScore(formAnalysis),
      };
      
      setAnalysis(enhancedAnalysis);
      
      if (onComplete) {
        onComplete(enhancedAnalysis);
      }
    } catch (error) {
      console.error('Form analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze form. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const calculateOverallScore = (analysis: FormAnalysis): number => {
    // Calculate score based on issues severity
    let score = 100;
    
    analysis.issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'moderate':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  };
  
  const retakeVideo = () => {
    setRecordedVideo(null);
    setAnalysis(null);
    setSelectedIssue(null);
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#FF3B30';
      case 'major':
        return '#FF9500';
      case 'moderate':
        return '#FFCC00';
      case 'minor':
        return '#34C759';
      default:
        return '#666';
    }
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
          isActive={!recordedVideo}
          video={true}
          audio={true}
        />
        
        {showOverlay && (
          <View style={styles.overlayContainer}>
            <View style={styles.overlayGuide}>
              <View style={styles.guideCorner} />
              <View style={[styles.guideCorner, styles.guideCornerTR]} />
              <View style={[styles.guideCorner, styles.guideCornerBL]} />
              <View style={[styles.guideCorner, styles.guideCornerBR]} />
            </View>
            <Text style={styles.overlayText}>
              Position yourself in frame
            </Text>
          </View>
        )}
        
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.flipButton} onPress={flipCamera}>
            <Icon name="camera-reverse" size={30} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <View style={styles.stopIcon} />
            ) : (
              <View style={styles.recordIcon} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.overlayToggle}
            onPress={() => setShowOverlay(!showOverlay)}
          >
            <Icon name={showOverlay ? 'grid' : 'grid-outline'} size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        )}
      </View>
    );
  };
  
  const renderVideoPlayer = () => {
    if (!recordedVideo) return null;
    
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={videoPlayer}
          source={{ uri: recordedVideo.path }}
          style={styles.video}
          paused={isPaused}
          rate={playbackSpeed}
          onLoad={(data) => setDuration(data.duration)}
          onProgress={(data) => setCurrentTime(data.currentTime)}
          resizeMode="contain"
          repeat={true}
        />
        
        <View style={styles.videoControls}>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={() => setIsPaused(!isPaused)}
          >
            <Icon name={isPaused ? 'play' : 'pause'} size={30} color="#fff" />
          </TouchableOpacity>
          
          <Slider
            style={styles.progressSlider}
            value={currentTime}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={(value) => {
              if (videoPlayer.current) {
                videoPlayer.current.seek(value);
              }
            }}
            minimumTrackTintColor="#667eea"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="#fff"
          />
          
          <Text style={styles.timeText}>
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </Text>
        </View>
        
        <View style={styles.speedControls}>
          <Text style={styles.speedLabel}>Speed:</Text>
          {[0.5, 1.0, 1.5, 2.0].map(speed => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedButton,
                playbackSpeed === speed && styles.speedButtonActive
              ]}
              onPress={() => setPlaybackSpeed(speed)}
            >
              <Text style={[
                styles.speedButtonText,
                playbackSpeed === speed && styles.speedButtonTextActive
              ]}>
                {speed}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderAnalysis = () => {
    if (!analysis) return null;
    
    return (
      <ScrollView style={styles.analysisContainer}>
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={
              analysis.overallScore >= 80 ? ['#34C759', '#30B251'] :
              analysis.overallScore >= 60 ? ['#FFCC00', '#FFB800'] :
              ['#FF3B30', '#FF2D20']
            }
            style={styles.scoreGradient}
          >
            <Text style={styles.scoreValue}>{analysis.overallScore}</Text>
            <Text style={styles.scoreLabel}>Form Score</Text>
          </LinearGradient>
        </View>
        
        {analysis.goodPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ What You're Doing Well</Text>
            {analysis.goodPoints.map((point, index) => (
              <View key={index} style={styles.pointItem}>
                <Icon name="checkmark-circle" size={20} color="#34C759" />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}
        
        {analysis.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Areas to Improve</Text>
            {analysis.issues.map((issue, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.issueCard,
                  selectedIssue === issue && styles.issueCardSelected
                ]}
                onPress={() => setSelectedIssue(issue)}
              >
                <View style={styles.issueHeader}>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(issue.severity) }
                  ]}>
                    <Text style={styles.severityText}>
                      {issue.severity.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.issueBodyPart}>{issue.bodyPart}</Text>
                </View>
                <Text style={styles.issueDescription}>{issue.issue}</Text>
                {selectedIssue === issue && (
                  <View style={styles.issueDetails}>
                    <Text style={styles.correctionTitle}>How to Fix:</Text>
                    <Text style={styles.correctionText}>{issue.correction}</Text>
                    {issue.timestamp && (
                      <TouchableOpacity
                        style={styles.jumpToButton}
                        onPress={() => {
                          if (videoPlayer.current) {
                            videoPlayer.current.seek(issue.timestamp);
                            setIsPaused(false);
                          }
                        }}
                      >
                        <Icon name="play-circle" size={20} color="#667eea" />
                        <Text style={styles.jumpToText}>
                          Jump to {issue.timestamp}s
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Recommendations</Text>
            {analysis.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <Icon name="bulb" size={20} color="#FFCC00" />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={retakeVideo}>
            <Icon name="camera" size={20} color="#667eea" />
            <Text style={styles.retakeButtonText}>Retake Video</Text>
          </TouchableOpacity>
          
          {showComparison && (
            <TouchableOpacity style={styles.compareButton}>
              <Icon name="git-compare" size={20} color="#667eea" />
              <Text style={styles.compareButtonText}>Compare with Pro</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exercise}</Text>
        <Text style={styles.subtitle}>Form Analysis</Text>
      </View>
      
      {!recordedVideo && renderCamera()}
      {recordedVideo && !analysis && (
        <>
          {renderVideoPlayer()}
          <View style={styles.analyzeSection}>
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeForm}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.analyzeGradient}
              >
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="analytics" size={24} color="#fff" />
                    <Text style={styles.analyzeButtonText}>Analyze Form</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.retakeSmallButton} onPress={retakeVideo}>
              <Text style={styles.retakeSmallText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {analysis && (
        <>
          {renderVideoPlayer()}
          {renderAnalysis()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayGuide: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.5,
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
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
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
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
  },
  recordIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF3B30',
  },
  stopIcon: {
    width: 25,
    height: 25,
    backgroundColor: '#FF3B30',
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  overlayToggle: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  recordingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    height: screenHeight * 0.4,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  videoControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseButton: {
    marginRight: 15,
  },
  progressSlider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 10,
  },
  speedControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 5,
  },
  speedLabel: {
    color: '#fff',
    fontSize: 12,
    marginRight: 10,
    marginLeft: 5,
  },
  speedButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  speedButtonActive: {
    backgroundColor: '#667eea',
  },
  speedButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  speedButtonTextActive: {
    fontWeight: 'bold',
  },
  analyzeSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  analyzeButton: {
    marginBottom: 10,
  },
  analyzeGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  retakeSmallButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  retakeSmallText: {
    color: '#667eea',
    fontSize: 14,
  },
  analysisContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scoreCard: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 30,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  issueCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  issueCardSelected: {
    borderColor: '#667eea',
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  issueBodyPart: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  issueDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  issueDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  correctionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  correctionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  jumpToButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  jumpToText: {
    color: '#667eea',
    fontSize: 14,
    marginLeft: 5,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  compareButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FormAnalyzer;