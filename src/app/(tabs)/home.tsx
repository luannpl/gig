import { getPosts, createPost } from "@/src/services/posts";
import { getMe } from "@/src/services/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Adicionado para indicar carregamento
} from "react-native";
import axios from "axios"; // Importar axios para tipagem e checagem de erros

// --- Definição de Tipos (Interfaces) ---

interface User {
  name: string;
  id: string; // Tornando 'id' obrigatório após autenticação
  avatar?: string;
  band?: {
    profilePicture?: string;
  };
}

interface Post {
  id: string;
  content: string;
  likes: any[];
  commentsCount: number;
  createdAt: string;
  user: User;
  imageUrl?: string;
}

interface CommentsModalProps {
  showComments: boolean;
  onClose: () => void;
  selectedPost: Post | undefined;
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  handleAddComment: () => void;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  timeAgo: string;
}

// --- Funções Auxiliares ---

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s atrás`;
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
};

// --- Componente Modal de Comentários (inalterado, mas tipado) ---

const CommentsModal: React.FC<CommentsModalProps> = ({
  showComments,
  onClose,
  selectedPost,
  newComment,
  setNewComment,
  handleAddComment,
}) => (
  <Modal
    visible={showComments}
    animationType="slide"
    presentationStyle="pageSheet"
  >
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1 bg-gray-100">
        <View className="bg-white flex-row justify-between items-center px-5 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-lg font-bold text-blue-500">✕</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-black">Comentários</Text>
          <View className="w-6" />
        </View>

        {selectedPost && (
          <View className="bg-white m-4 p-4 rounded-lg border-l-4 border-blue-500">
            <Text className="font-bold mb-1">{selectedPost.user.name}</Text>
            <Text className="text-gray-500">{selectedPost.content}</Text>
          </View>
        )}

        <FlatList<Comment>
          data={[]}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-4"
          renderItem={({ item }) => (
            <View className="bg-white p-4 mb-2.5 rounded-lg">
              <Text className="font-bold mb-1">{item.author}</Text>
              <Text className="mb-1 leading-5">{item.text}</Text>
              <Text className="text-gray-500 text-xs">{item.timeAgo}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 italic mt-12">
              Nenhum comentário ainda
            </Text>
          }
        />

        <View className="bg-white px-4 py-2.5 border-t border-gray-200 flex-row items-end">
          <TextInput
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 mr-2.5 max-h-20"
            placeholder="Adicione um comentário..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            className="bg-blue-500 rounded-full px-5 py-2.5"
            onPress={handleAddComment}
          >
            <Text className="text-white font-semibold">Enviar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  </Modal>
);

// --- Componente Principal Atualizado ---

const HomeScreen: React.FC = () => {
  const [newPostText, setNewPostText] = useState<string>("");
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);

        const token = await AsyncStorage.getItem('token');

        if (!token) {
          console.log("2. Token não encontrado. Forçando deslogado.");
          setCurrentUser(null);
          return;
        }


        try {
          const userData = await getMe(token);

          setCurrentUser(userData as User);

        } catch (apiError) {
          console.error("3. FALHA NA CHAMADA GETME:", apiError);
          throw apiError;
        }

      } catch (error) {
        console.error("4. ERRO FATAL AO CARREGAR USUÁRIO:", error);
        await AsyncStorage.removeItem('@MyApp:token');
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    // --- Lógica de buscar posts (Mantida) ---
    const fetchPosts = async () => {
      try {
        const data: { posts: Post[] } = await getPosts();
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
        Alert.alert(
          "Erro ao buscar posts",
          "Não foi possível carregar os posts."
        );
      }
    };

    fetchCurrentUser();
    fetchPosts();

  }, []); // Executa apenas na montagem do componente

  const handleCreatePost = async (): Promise<void> => {
    if (newPostText.trim() === "") {
      Alert.alert("Erro", "Por favor, escreva algo para publicar.");
      return;
    }

    if (!currentUser || !currentUser.id) {
      Alert.alert("Erro", "Usuário não autenticado ou ID ausente. Não é possível publicar.");
      return;
    }

    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append("content", newPostText);
      formData.append("authorId", currentUser.id);

      const response = await createPost(formData);

      // 🚨 DEBUG: Veja o que o backend retorna.
      console.log("Resposta da API de Criação de Post:", response.data);

      const postDataFromResponse = response.data || {};

      const newPost: Post = {
        // 1. Desestrutura o que veio do backend (id, likes, etc.).
        // Assume que 'id' e 'likes' vieram corretamente.
        ...postDataFromResponse,

        // 2. GARANTE O CONTEÚDO: Usa o texto digitado, caso o backend o omita.
        content: postDataFromResponse.content || newPostText,

        // 3. GARANTE O TIMESTAMP: Usa a hora atual se o backend não retornar.
        // É crucial para o timeAgo().
        createdAt: postDataFromResponse.createdAt || new Date().toISOString(),

        // 4. Adiciona o usuário logado (que é o autor do post).
        user: {
          ...currentUser,
          name: currentUser.name
        },
      };

      // 5. ATUALIZAÇÃO DE ESTADO
      setPosts([newPost, ...posts]);
      setNewPostText("");

      Alert.alert("Sucesso", "Postagem criada com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Erro do Backend:", error.response.data);
        const errorMessage = error.response.data.message || 'Erro de rede desconhecido.';

        Alert.alert(
          "Erro de Publicação",
          `Erro: ${errorMessage}`
        );
      } else {
        console.error("Erro ao criar post:", error);
        Alert.alert("Erro de Publicação", "Não foi possível criar a publicação.");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = (postId: string): void => {
    console.log(`Liking post ${postId} is not implemented.`);
  };

  const handleOpenComments = (postId: string): void => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleAddComment = (): void => {
    console.log(`Adding comment to post ${selectedPostId} is not implemented.`);
  };

  const selectedPost: Post | undefined = posts.find(
    (post) => post.id === selectedPostId
  );

  // Exibe um indicador de carregamento enquanto o usuário não é carregado
  if (isLoadingUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Carregando usuário...</Text>
      </View>
    );
  }

  // Tratamento caso o usuário não consiga ser carregado (simulação de deslogado)
  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-8">
        <Text className="text-xl font-bold text-red-500 mb-4">Erro de Autenticação</Text>
        <Text className="text-center text-gray-700">Não foi possível carregar os dados do usuário. Por favor, tente novamente ou faça login.</Text>
      </View>
    );
  }


  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="py-4 px-5 items-center">
        <Text className="text-2xl font-bold text-black italic">gig</Text>
      </View>

      <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-md">
        <TextInput
          // Usa o nome real do estado
          placeholder={`O que você está pensando, ${currentUser.name}?`}
          placeholderTextColor="#999"
          multiline
          value={newPostText}
          onChangeText={setNewPostText}
          textAlignVertical="top"
          className="h-20"
          editable={!isPosting}
        />
        <View className="flex-row justify-end gap-2.5 mt-2">
          <TouchableOpacity
            className={`py-2 px-5 rounded-full ${isPosting ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={handleCreatePost}
            disabled={isPosting || newPostText.trim() === ""}
          >
            <Text className="text-white text-sm font-semibold">
              {isPosting ? "Publicando..." : "Publicar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {posts.map((post: Post) => (
          <View
            key={post.id}
            className="bg-white mx-4 mb-4 rounded-xl p-5 shadow-md"
          >
            <View className="flex-row items-center mb-4">
              <Image
                source={{
                  uri:
                    post.user.avatar ||
                    post.user.band?.profilePicture ||
                    `https://i.pravatar.cc/150?u=${post.user.id}`,
                }}
                className="w-10 h-10 rounded-full mr-2.5 bg-gray-200"
              />
              <View className="flex-col">
                <Text className="text-base font-bold text-black mb-0.5">
                  {post.user.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {timeAgo(post.createdAt)}
                </Text>
              </View>
            </View>
            <Text className="text-base text-black mb-5 leading-snug">
              {post.content}
            </Text>
            {post.imageUrl && (
              <Image
                source={{ uri: post.imageUrl }}
                className="w-full h-64 rounded-lg mb-4 bg-gray-200"
                resizeMode="cover"
              />
            )}
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => handleLike(post.id)}
              >
                <View className="mr-2">
                  <Text className="text-base text-gray-400">{"♡"}</Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {post.likes?.length || 0} curtidas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => handleOpenComments(post.id)}
              >
                <View className="mr-2">
                  <Text className="mb-1 leading-5">💬</Text>
                </View>
                <Text className="text-sm text-gray-500">
                  {post.commentsCount || 0} comentários
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <CommentsModal
        showComments={showComments}
        onClose={() => setShowComments(false)}
        selectedPost={selectedPost}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
