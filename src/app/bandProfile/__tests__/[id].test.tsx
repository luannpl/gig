import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import ProfileBand from '../[id]';
import { getBandById, getReviewsByBand } from '@/src/services/bandas';
import { createReview } from '@/src/services/reviews';
import createContract, { getVenueByUserId } from '@/src/services/contracts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';

// Mock das dependências
jest.mock('@/src/services/bandas', () => ({
  getBandById: jest.fn(),
  getReviewsByBand: jest.fn(),
}));
jest.mock('@/src/services/reviews', () => ({
  createReview: jest.fn(),
}));
jest.mock('@/src/services/contracts', () => ({
  __esModule: true,
  default: jest.fn(),
  getVenueByUserId: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.spyOn(Alert, 'alert');

// Mock dos dados
const mockBand = {
  id: 1,
  bandName: 'The Public Mockers',
  genre: 'Public Rock',
  city: 'Publicville',
  members: 3,
  description: 'A public mock band.',
};
const mockReviews = [
  { id: 1, rating: 5, comment: 'Public amazing!', user: { name: 'Fan 1' }, createdAt: new Date().toISOString() },
];
const mockUser = { id: 'user-venue', name: 'Venue Owner', role: 'venue' };
const mockVenue = { id: 'venue-1', name: 'The Mock Venue' };

describe('Public ProfileBand Screen', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
    (getBandById as jest.Mock).mockResolvedValue(mockBand);
    (getReviewsByBand as jest.Mock).mockResolvedValue(mockReviews);
    (getVenueByUserId as jest.Mock).mockResolvedValue(mockVenue);
    (createReview as jest.Mock).mockResolvedValue({ ...mockReviews[0], id: 2, comment: 'New review!' });
    ((createContract as unknown) as jest.Mock).mockResolvedValue({});
  });

  it('should render public band details', async () => {
    const { findByText, findAllByText } = render(<ProfileBand />);
    expect(await findByText('The Public Mockers')).toBeTruthy();
    
    // Verifica se "Public Rock" aparece duas vezes
    const rockElements = await findAllByText('Public Rock');
    expect(rockElements).toHaveLength(2);
    
    expect(await findByText('Publicville')).toBeTruthy();
    expect(await findByText('Public amazing!')).toBeTruthy();
  });

  it('should allow a venue user to open and submit a review', async () => {
    const { findByText, getByPlaceholderText } = render(<ProfileBand />);

    // Abre o modal de avaliação
    const reviewButton = await findByText('Avaliar');
    fireEvent.press(reviewButton);
    
    // Localiza o modal pelo título
    const modalTitle = await findByText(`Avaliar ${mockBand.bandName}`);
    
    // Usa 'within' para buscar elementos apenas dentro do modal
    const withinModal = within(modalTitle.parent.parent);
    
    // Preenche o formulário
    const commentInput = withinModal.getByPlaceholderText('Escreva seu comentário...');
    fireEvent.changeText(commentInput, 'New review!');
    
    // Encontra e clica na quarta estrela
    const touchables = withinModal.UNSAFE_getAllByType(TouchableOpacity);
    const stars = touchables.slice(0, 5); // As 5 primeiras são as estrelas
    fireEvent.press(stars[3]);

    // Envia a avaliação
    const submitButton = withinModal.getByText('Enviar');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith(expect.objectContaining({
        comment: 'New review!',
        rating: 4,
        bandId: mockBand.id,
        userId: mockUser.id,
      }));
      expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Avaliação enviada!');
    });

    // Verifica se a nova avaliação aparece na lista
    expect(await findByText('New review!')).toBeTruthy();
  });

  it('should allow a venue user to open and submit a contract request', async () => {
    const { findByText, getByPlaceholderText, getByText } = render(<ProfileBand />);

    // Abre o modal de contratação
    const hireButton = await findByText('Contratar Banda');
    fireEvent.press(hireButton);

    // Preenche o formulário
    fireEvent.changeText(getByPlaceholderText('Nome do Evento'), 'Test Gig');
    fireEvent.changeText(getByPlaceholderText('Data do Evento (YYYY-MM-DD)'), '2025-12-25');
    fireEvent.changeText(getByPlaceholderText('Início (ex: 18:00)'), '20:00');
    fireEvent.changeText(getByPlaceholderText('Término (ex: 22:30)'), '23:00');
    fireEvent.changeText(getByPlaceholderText('Tipo de Evento'), 'Concert');
    fireEvent.changeText(getByPlaceholderText('Orçamento (ex: 2500.75)'), '3000');
    
    // Envia a proposta
    const submitButton = getByText('Enviar Pedido');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createContract).toHaveBeenCalledWith(expect.objectContaining({
        eventName: 'Test Gig',
        budget: 3000,
        providerId: mockBand.id,
        requesterId: mockVenue.id,
      }));
      expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Pedido de contratação enviado!');
    });
  });
});
