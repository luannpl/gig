import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileBand from '../ProfileBand';
import { getBandByUserId, getReviewsByBand } from '@/src/services/bandas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Mock das dependências
jest.mock('@/src/services/bandas', () => ({
  getBandByUserId: jest.fn(),
  getReviewsByBand: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock dos dados
const mockUser = { id: 'user-1', name: 'Test User' };
const mockBand = {
  id: 1,
  bandName: 'The Mockers',
  genre: 'Test Rock',
  city: 'Mockville',
  members: 4,
  description: 'A mock band for testing.',
  instagram: 'https://instagram.com/mock',
  facebook: null,
  twitter: null,
};
const mockReviews = [
  { id: 1, rating: 5, comment: 'Amazing!', user: { name: 'Fan 1' }, createdAt: new Date().toISOString() },
  { id: 2, rating: 4, comment: 'Great show!', user: { name: 'Fan 2' }, createdAt: new Date().toISOString() },
];

describe('ProfileBand Component', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, replace: mockReplace });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
    (getBandByUserId as jest.Mock).mockResolvedValue(mockBand);
    (getReviewsByBand as jest.Mock).mockResolvedValue(mockReviews);
  });

  it('should render band details and reviews correctly', async () => {
    const { findByText, findAllByText } = render(<ProfileBand />);
    
    expect(await findByText('The Mockers')).toBeTruthy();
    const genreElements = await findAllByText('Test Rock');
    expect(genreElements.length).toBeGreaterThan(0);
    expect(await findByText('Mockville')).toBeTruthy();
    expect(await findByText('A mock band for testing.')).toBeTruthy();
    expect(await findByText('Amazing!')).toBeTruthy();
    expect(await findByText('Great show!')).toBeTruthy();
  });

  it('should navigate to edit profile screen on button press', async () => {
    const { findByText } = render(<ProfileBand />);
    
    const editButton = await findByText('Editar Perfil');
    fireEvent.press(editButton);
    
    expect(mockPush).toHaveBeenCalledWith('/editBandProfile');
  });

  it('should redirect to sign-in if no user data is found', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    render(<ProfileBand />);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/sign-in');
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['token', 'user']);
    });
  });
});
