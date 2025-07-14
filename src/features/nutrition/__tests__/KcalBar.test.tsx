import React from 'react';
import { render } from '@testing-library/react';
import { KcalBar } from '../KcalBar';
import { useTargets } from '@/hooks/useTargets';
import { useNutritionDay } from '@/hooks/useNutritionDay';

// Mock the hooks
jest.mock('@/hooks/useTargets');
jest.mock('@/hooks/useNutritionDay');

const mockUseTargets = useTargets as jest.MockedFunction<typeof useTargets>;
const mockUseNutritionDay = useNutritionDay as jest.MockedFunction<typeof useNutritionDay>;

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Add missing mocks
  Reanimated.default.View = Reanimated.View;
  Reanimated.interpolateColor = jest.fn((value, inputRange, outputRange) => outputRange[0]);
  
  return Reanimated;
});

describe('KcalBar Snapshots', () => {
  const mockTargets = {
    kcalTarget: 2200,
    proteinTarget: 120,
    carbTarget: 250,
    fatTarget: 80,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTargets.mockReturnValue(mockTargets);
  });

  it('renders correctly at 0% progress', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 0,
      protein: 0,
      carb: 0,
      fat: 0,
    });

    const tree = render(<KcalBar />);
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly at 100% progress', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 2200,
      protein: 120,
      carb: 250,
      fat: 80,
    });

    const tree = render(<KcalBar />);
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly at 150% progress (over target)', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 3300,
      protein: 180,
      carb: 375,
      fat: 120,
    });

    const tree = render(<KcalBar />);
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly at 50% progress', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 1100,
      protein: 60,
      carb: 125,
      fat: 40,
    });

    const tree = render(<KcalBar />);
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly at 120% progress (slightly over)', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 2640,
      protein: 144,
      carb: 300,
      fat: 96,
    });

    const tree = render(<KcalBar />);
    expect(tree).toMatchSnapshot();
  });
});

describe('KcalBar Functionality', () => {
  const mockTargets = {
    kcalTarget: 2000,
    proteinTarget: 100,
    carbTarget: 200,
    fatTarget: 70,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTargets.mockReturnValue(mockTargets);
  });

  it('calculates percentage correctly for various intake levels', () => {
    // Test 0%
    mockUseNutritionDay.mockReturnValue({
      kcal: 0,
      protein: 0,
      carb: 0,
      fat: 0,
    });

    const { container } = render(<KcalBar />);
    expect(container.textContent).toContain('0 / 2000 kcal');
    expect(container.textContent).toContain('0.0%');
  });

  it('shows over target message when exceeding 100%', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 2500,
      protein: 125,
      carb: 250,
      fat: 87,
    });

    const { container } = render(<KcalBar />);
    expect(container.textContent).toContain('2500 / 2000 kcal');
    expect(container.textContent).toContain('125.0%');
    expect(container.textContent).toContain('Over target');
  });

  it('rounds percentage to one decimal place', () => {
    mockUseNutritionDay.mockReturnValue({
      kcal: 1333, // This should give 66.65% which rounds to 66.7%
      protein: 67,
      carb: 133,
      fat: 47,
    });

    const { container } = render(<KcalBar />);
    expect(container.textContent).toContain('66.7%');
  });

  it('handles zero target gracefully', () => {
    mockUseTargets.mockReturnValue({
      kcalTarget: 0,
      proteinTarget: 0,
      carbTarget: 0,
      fatTarget: 0,
    });

    mockUseNutritionDay.mockReturnValue({
      kcal: 1000,
      protein: 50,
      carb: 100,
      fat: 35,
    });

    const { container } = render(<KcalBar />);
    expect(container.textContent).toContain('1000 / 0 kcal');
    expect(container.textContent).toContain('0.0%'); // Should default to 0% when target is 0
  });

  it('reacts to changes in both hooks', () => {
    const { rerender } = render(<KcalBar />);

    // Initial state
    mockUseTargets.mockReturnValue(mockTargets);
    mockUseNutritionDay.mockReturnValue({ kcal: 1000, protein: 50, carb: 100, fat: 35 });

    rerender(<KcalBar />);
    expect(document.body.textContent).toContain('50.0%');

    // Change nutrition day
    mockUseNutritionDay.mockReturnValue({ kcal: 1500, protein: 75, carb: 150, fat: 52 });

    rerender(<KcalBar />);
    expect(document.body.textContent).toContain('75.0%');

    // Change targets
    mockUseTargets.mockReturnValue({
      kcalTarget: 3000,
      proteinTarget: 150,
      carbTarget: 300,
      fatTarget: 105,
    });

    rerender(<KcalBar />);
    expect(document.body.textContent).toContain('50.0%'); // 1500/3000 = 50%
  });
});