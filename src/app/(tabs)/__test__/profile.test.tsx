import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Profile from '../profile';
import { getMe } from '@/src/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock das dependências
jest.mock('@/src/services/auth', () => ({
  getMe: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// Mock dos componentes filhos para renderizar um texto identificável
jest.mock('@/src/components/profiles/ProfileBand', () => {
  const { Text } = require('react-native');
  return () => <Text>ProfileBandComponent</Text>;
});
jest.mock('@/src/components/profiles/ProfileVenue', () => {
  const { Text } = require('react-native');
  return () => <Text>ProfileVenueComponent</Text>;
});

describe('Profile Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ProfileBand when user role is "band"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fake-token');
    (getMe as jest.Mock).mockResolvedValue({ role: 'band' });

    const { findByText, queryByText } = render(<Profile />);
    
    expect(await findByText('ProfileBandComponent')).toBeTruthy();
    expect(queryByText('ProfileVenueComponent')).toBeNull();
  });

  it('should render ProfileVenue when user role is "venue"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fake-token');
    (getMe as jest.Mock).mockResolvedValue({ role: 'venue' });

    const { findByText, queryByText } = render(<Profile />);
    
    expect(await findByText('ProfileVenueComponent')).toBeTruthy();
    expect(queryByText('ProfileBandComponent')).toBeNull();
  });

  it('should render nothing if user role is not band or venue', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('fake-token');
    (getMe as jest.Mock).mockResolvedValue({ role: 'user' });

    const { queryByText } = render(<Profile />);
    
    await waitFor(() => {
        expect(queryByText('ProfileBandComponent')).toBeNull();
        expect(queryByText('ProfileVenueComponent')).toBeNull();
    });
  });
});
