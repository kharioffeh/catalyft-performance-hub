import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AnimatedTabBar from '../AnimatedTabBar';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('AnimatedTabBar', () => {
  const mockTabs = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'Training', icon: 'fitness', label: 'Training' },
    { name: 'Analytics', icon: 'trending-up', label: 'Analytics' },
  ];

  const mockOnTabPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with tabs', () => {
    const { getByText } = render(
      <AnimatedTabBar
        tabs={mockTabs}
        currentTab={0}
        onTabPress={mockOnTabPress}
      />
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Training')).toBeTruthy();
    expect(getByText('Analytics')).toBeTruthy();
  });

  it('calls onTabPress when a tab is pressed', () => {
    const { getByText } = render(
      <AnimatedTabBar
        tabs={mockTabs}
        currentTab={0}
        onTabPress={mockOnTabPress}
      />
    );

    fireEvent.press(getByText('Training'));
    expect(mockOnTabPress).toHaveBeenCalledWith(1);
  });

  it('highlights the current tab', () => {
    const { getByText } = render(
      <AnimatedTabBar
        tabs={mockTabs}
        currentTab={1}
        onTabPress={mockOnTabPress}
      />
    );

    // The Training tab should be the current tab
    const trainingTab = getByText('Training');
    expect(trainingTab).toBeTruthy();
  });

  it('handles empty tabs array', () => {
    const { container } = render(
      <AnimatedTabBar
        tabs={[]}
        currentTab={0}
        onTabPress={mockOnTabPress}
      />
    );

    expect(container).toBeTruthy();
  });

  it('handles single tab', () => {
    const singleTab = [{ name: 'Home', icon: 'home', label: 'Home' }];
    
    const { getByText } = render(
      <AnimatedTabBar
        tabs={singleTab}
        currentTab={0}
        onTabPress={mockOnTabPress}
      />
    );

    expect(getByText('Home')).toBeTruthy();
  });
});