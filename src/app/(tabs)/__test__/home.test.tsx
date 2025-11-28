import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import HomeScreen from "../home";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMe } from "@/src/services/auth";
import { getPosts } from "@/src/services/posts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Mock das dependências
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "https://mock.api.com",
      env: "test",
    },
  },
}));
jest.mock("@/src/services/posts", () => ({
  getPosts: jest.fn(),
  createPost: jest.fn(),
}));
jest.mock("@/src/services/auth", () => ({
  getMe: jest.fn(),
}));
jest.mock("@/src/services/comments", () => ({
  getCommentsByPostId: jest.fn(),
  createComment: jest.fn(),
}));
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: "camera_uri" }] }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: false, assets: [{ uri: "library_uri" }] }),
}));
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockQueryClient = {
  invalidateQueries: jest.fn(),
};

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => mockQueryClient,
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));
jest.mock("expo-image", () => ({
  Image: "Image",
}));

// Mock do Alert
const mockedAlert = jest.spyOn(Alert, "alert");

// --- Mocks de Dados ---
const mockUser = {
  id: "user-1",
  name: "John Doe",
  role: "user",
  avatar: "avatar_url",
};

const mockPosts = [
  {
    id: "post-1",
    content: "This is a test post.",
    likes: [],
    commentsCount: 2,
    createdAt: new Date().toISOString(),
    user: mockUser,
    likesCount: 0,
  },
  {
    id: "post-2",
    content: "Another test post.",
    likes: [],
    commentsCount: 1,
    createdAt: new Date().toISOString(),
    user: mockUser,
    likesCount: 5,
  },
];


describe("HomeScreen", () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();

    // Configuração padrão para useMutation
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  // --- Testes de Renderização e Estado de Carregamento ---

  it("should display loading indicator while fetching user", () => {
    // Simula o estado de carregamento do usuário
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fake-token");
    (getMe as jest.Mock).mockReturnValue(new Promise(() => {})); // Promise pendente
    (useQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });


    const { getByText } = render(<HomeScreen />);

    // Verifica se o texto de carregamento do usuário é exibido
    expect(getByText("Carregando usuário...")).toBeTruthy();
  });

  it("should show authentication error if user fetch fails", async () => {
    // Simula a falha na obtenção do token
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });


    const { findByText } = render(<HomeScreen />);

    // Aguarda e verifica a exibição da mensagem de erro de autenticação
    const errorText = await findByText("Erro de Autenticação");
    expect(errorText).toBeTruthy();
  });

  // --- Testes de Fluxo de Usuário Autenticado ---
  describe("when user is authenticated", () => {
    beforeEach(() => {
      // Configura mocks para um usuário logado com sucesso
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("fake-token");
      (getMe as jest.Mock).mockResolvedValue(mockUser);

      // Configura mock para a query de posts
      (useQuery as jest.Mock).mockImplementation(({ queryKey }) => {
        if (queryKey[0] === "posts") {
          return {
            data: mockPosts,
            isLoading: false,
          };
        }
        return { data: null, isLoading: false };
      });
    });

    it("should display the post creation form and posts list", async () => {
      const { findByPlaceholderText, findByText } = render(<HomeScreen />);
    
      // Use findBy* para aguardar a renderização assíncrona
      expect(await findByPlaceholderText(`O que você está pensando, ${mockUser.name}?`)).toBeTruthy();
      expect(await findByText(mockPosts[0].content)).toBeTruthy();
    });

    it("should not call createPost when the button is pressed and the input is empty", async () => {
      const mutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });
    
      const { findByText } = render(<HomeScreen />);
      const publishButton = await findByText("Publicar");
    
      // Pressiona o botão
      fireEvent.press(publishButton);
    
      // Verifica que a mutação NÃO foi chamada
      expect(mutate).not.toHaveBeenCalled();
    });

    it("should call createPost when the button is pressed and there is text", async () => {
      const mutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });
    
      const { findByText, findByPlaceholderText } = render(<HomeScreen />);
      const input = await findByPlaceholderText(`O que você está pensando, ${mockUser.name}?`);
      const publishButton = await findByText("Publicar");
    
      // Digita no campo de texto e pressiona o botão
      fireEvent.changeText(input, "New post content");
      fireEvent.press(publishButton);
    
      // Verifica que a mutação FOI chamada
      expect(mutate).toHaveBeenCalled();
    });

    it("should call createPost mutation on publish", async () => {
      const mutate = jest.fn();
      (useMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

      const { findByText, findByPlaceholderText } = render(<HomeScreen />);
      const input = await findByPlaceholderText(`O que você está pensando, ${mockUser.name}?`);

      // Cria e publica uma nova postagem
      fireEvent.changeText(input, "New post!");
      fireEvent.press(await findByText("Publicar"));

      // Verifica se a função de mutação foi chamada
      await waitFor(() => {
        expect(mutate).toHaveBeenCalled();
      });
    });

    it("should show an alert if post creation fails", async () => {
      // Simula uma falha na mutação
      const mutate = jest.fn((formData) => {
        const mutationOptions = (useMutation as jest.Mock).mock.calls[0][0];
        mutationOptions.onError(new Error("Failed to post"));
      });
      (useMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

      const { findByText, findByPlaceholderText } = render(<HomeScreen />);
      const input = await findByPlaceholderText(`O que você está pensando, ${mockUser.name}?`);

      // Tenta publicar
      fireEvent.changeText(input, "This will fail");
      fireEvent.press(await findByText("Publicar"));

      // Verifica se o alerta de erro é exibido
      await waitFor(() => {
        expect(mockedAlert).toHaveBeenCalledWith(
          "Erro de Publicação",
          "Não foi possível criar a publicação."
        );
      });
    });
  });
});
