import { getPosts, createPost } from "@/src/services/posts";
import { getMe } from "@/src/services/auth";
import { getCommentsByPostId, createComment } from "@/src/services/comments";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import api from "@/src/services/api";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

// --- Definição de Tipos (Interfaces) ---

interface User {
  name: string;
  id: string;
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
  likesCount: number;
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

// --- Componente Modal de Comentários ---

// Update CommentsModal to fetch and display real comments
const CommentsModal: React.FC<CommentsModalProps> = ({
  showComments,
  onClose,
  selectedPost,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (showComments && selectedPost) {
      loadComments();
    }
  }, [showComments, selectedPost]);

  const loadComments = async () => {
    if (!selectedPost) return;
    
    setIsLoadingComments(true);
    try {
      const fetchedComments = await getCommentsByPostId(selectedPost.id);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Erro", "Não foi possível carregar os comentários.");
    } finally {
      setIsLoadingComments(false);
    }
  };

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

  return (
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
              <Text className="font-semibold mb-1">{selectedPost.user.name}</Text>
              <Text className="text-gray-500">{selectedPost.content}</Text>
            </View>
          )}

          {isLoadingComments ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-2">Carregando comentários...</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              className="flex-1 px-4"
              renderItem={({ item }) => (
                <View className="bg-white p-4 mb-2.5 rounded-lg shadow-sm">
                  <Text className="font-bold mb-1">{item.user.name}</Text>
                  <Text className="mb-1 leading-5">{item.comment}</Text>
                  <Text className="text-gray-500 text-xs">
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-500 italic mt-12">
                  Nenhum comentário ainda. Seja o primeiro!
                </Text>
              }
            />
          )}

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
};
// --- Componente Principal ---

const HomeScreen: React.FC = () => {
  const [newPostText, setNewPostText] = useState<string>("");
  const [showComments, setShowComments] = useState<boolean>(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  // Query para buscar posts
  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const data = await getPosts();
      return data.posts as Post[];
    },
  });

  const posts = postsData || [];

  // Mutation para criar post
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await createPost(formData);
    },
    onSuccess: (response) => {
      console.log("✅ Post criado com sucesso:", response);

      // Invalida a query de posts para refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Limpa o formulário
      setNewPostText("");
      setSelectedImage(null);

      Alert.alert("Sucesso", "Postagem criada com sucesso!");
    },
    onError: (error: any) => {
      console.error("❌ Erro ao criar post:", error);

      if (axios.isAxiosError(error)) {
        console.error("📡 Detalhes do erro de rede:");
        console.error("  - Status:", error.response?.status);
        console.error("  - Data:", error.response?.data);

        Alert.alert(
          "Erro de Publicação",
          `Não foi possível criar a publicação.\n${error.response?.data?.message || error.message}`
        );
      } else {
        Alert.alert(
          "Erro de Publicação",
          "Não foi possível criar a publicação."
        );
      }
    },
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUser(true);
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          console.log("Token não encontrado. Forçando deslogado.");
          setCurrentUser(null);
          return;
        }

        try {
          const userData = await getMe(token);
          setCurrentUser(userData as User);
        } catch (apiError) {
          console.error("FALHA NA CHAMADA GETME:", apiError);
          throw apiError;
        }
      } catch (error) {
        console.error("ERRO FATAL AO CARREGAR USUÁRIO:", error);
        await AsyncStorage.removeItem("token");
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []); // Executa apenas na montagem do componente

  // Função para tirar foto com a câmera
  const handleTakePhoto = async (): Promise<void> => {
    try {
      // Solicitar permissão para usar a câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Você precisa permitir o acesso à câmera para tirar fotos."
        );
        return;
      }

      // Abrir a câmera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  // Função para escolher foto da galeria
  const handlePickImage = async (): Promise<void> => {
    try {
      // Solicitar permissão para acessar a galeria
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permissão negada",
          "Você precisa permitir o acesso à galeria para escolher fotos."
        );
        return;
      }

      // Abrir a galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao escolher imagem:", error);
      Alert.alert("Erro", "Não foi possível escolher a imagem.");
    }
  };

  // Função para remover a imagem selecionada
  const handleRemoveImage = (): void => {
    setSelectedImage(null);
  };

  const handleCreatePost = async (): Promise<void> => {
    // 1. Validação do conteúdo
    if (newPostText.trim() === "") {
      Alert.alert("Erro", "Por favor, escreva algo para publicar.");
      return;
    }

    // 2. Validação do usuário
    if (!currentUser || !currentUser.id) {
      Alert.alert(
        "Erro",
        "Usuário não autenticado ou ID ausente. Não é possível publicar."
      );
      return;
    }

    try {
      // 3. Criação do FormData
      const formData = new FormData();
      formData.append("content", newPostText);
      formData.append("authorId", currentUser.id);

      console.log("📤 Preparando FormData:");
      console.log("  - content:", newPostText);
      console.log("  - authorId:", currentUser.id);
      console.log("  - tem imagem?", selectedImage ? "SIM" : "NÃO");

      // 4. Anexando a imagem
      if (selectedImage) {
        const uri = selectedImage;

        // Verificar se é uma blob: URL (Web)
        if (uri.startsWith("blob:")) {
          console.warn("⚠️ ATENÇÃO: URI é uma blob URL (rodando no Web)");

          const response = await fetch(uri);
          const blob = await response.blob();
          const filename = `photo_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });

          formData.append("image", file);
          console.log("✅ Blob convertido para File no Web");
        } else {
          // Fluxo normal para React Native (file:// ou content://)
          const filename = uri.split("/").pop() || "photo.jpg";
          const extension = filename.split(".").pop()?.toLowerCase();

          let mimeType = "image/jpeg";
          if (extension === "png") mimeType = "image/png";
          else if (extension === "gif") mimeType = "image/gif";
          else if (extension === "webp") mimeType = "image/webp";

          console.log("📸 Anexando imagem:");
          console.log("  - URI:", uri);
          console.log("  - Nome:", filename);
          console.log("  - Tipo:", mimeType);

          const imageFile = {
            uri: uri,
            name: filename,
            type: mimeType,
          };

          formData.append("image", imageFile as any);
          console.log("✅ Imagem anexada ao FormData");
        }
      }

      // 5. Chamar a mutation
      console.log("🚀 Enviando post para a API...");
      createPostMutation.mutate(formData);
    } catch (error) {
      console.error("❌ Erro ao preparar post:", error);
      Alert.alert("Erro", "Não foi possível preparar a publicação.");
    }
  };

  const handleLike = async (postId: string): Promise<void> => {
    if (!currentUser?.id) {
      Alert.alert("Erro", "Você precisa estar logado para curtir posts.");
      return;
    }

    // Previne múltiplos cliques no mesmo post
    if (likingPosts.has(postId)) return;

    const isCurrentlyLiked = likedPosts.has(postId);

    // Atualização otimista da UI
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    // Marca post como sendo processado
    setLikingPosts((prev) => new Set(prev).add(postId));

    try {
      // Pega o token para autenticação
      const token = await AsyncStorage.getItem("token");

      if (isCurrentlyLiked) {
        // Unlike - usa o endpoint correto com token
        await api.delete(`/likes/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Like - usa o endpoint correto com token
        await api.post(
          `/likes/${postId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Invalida a query para refetch automático
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error);

      // Reverte a mudança otimista em caso de erro
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      Alert.alert(
        "Erro",
        "Não foi possível curtir/descurtir o post. Tente novamente."
      );
    } finally {
      // Remove post da lista de processamento
      setLikingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleOpenComments = (postId: string): void => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleAddComment = async () => {
  if (!newComment.trim()) {
    Alert.alert("Erro", "Por favor, escreva um comentário.");
    return;
  }

  if (!selectedPostId || !currentUser) {
    Alert.alert("Erro", "Não foi possível adicionar o comentário.");
    return;
  }

  try {
    await createComment({
      comment: newComment,
      postId: Number(selectedPostId),
      userId: currentUser.id,
    });

    // Invalidate posts query to update comment count
    queryClient.invalidateQueries({ queryKey: ["posts"] });

    // Clear input and close modal
    setNewComment("");
    setShowComments(false);
    
    Alert.alert("Sucesso", "Comentário adicionado!");
  } catch (error) {
    console.error("Error adding comment:", error);
    Alert.alert("Erro", "Não foi possível adicionar o comentário.");
  }
};

  const selectedPost: Post | undefined = posts.find(
    (post) => post.id === selectedPostId
  );

  if (isLoadingUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-gray-600">Carregando usuário...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 p-8">
        <Text className="text-xl font-bold text-red-500 mb-4">
          Erro de Autenticação
        </Text>
        <Text className="text-center text-gray-700">
          Não foi possível carregar os dados do usuário. Por favor, tente
          novamente ou faça login.
        </Text>
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
        <View className="flex-row items-center mb-3">
          <Image
            source={{
              uri:
                currentUser.avatar ||
                currentUser.band?.profilePicture ||
                `https://i.pravatar.cc/150?u=${currentUser.id}`,
            }}
            className="w-10 h-10 rounded-full mr-3 bg-gray-200"
          />
          <Text className="text-base font-semibold text-gray-700">
            {currentUser.name}
          </Text>
        </View>

        <TextInput
          placeholder={`O que você está pensando, ${currentUser.name}?`}
          placeholderTextColor="#999"
          multiline
          value={newPostText}
          onChangeText={setNewPostText}
          textAlignVertical="top"
          className="min-h-20 text-base"
          editable={!createPostMutation.isPending}
        />

        {/* Preview da imagem selecionada */}
        {selectedImage && (
          <View className="mt-3 relative">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-64 rounded-lg bg-gray-200"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
              onPress={handleRemoveImage}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Botões de ação */}
        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full"
              onPress={handleTakePhoto}
              disabled={createPostMutation.isPending}
            >
              <Ionicons name="camera" size={20} color="#3b82f6" />
              <Text className="text-blue-500 text-sm font-semibold ml-2">
                Câmera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center bg-green-50 px-4 py-2 rounded-full"
              onPress={handlePickImage}
              disabled={createPostMutation.isPending}
            >
              <Ionicons name="images" size={20} color="#10b981" />
              <Text className="text-green-500 text-sm font-semibold ml-2">
                Galeria
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`py-2 px-6 rounded-full ${createPostMutation.isPending ? "bg-gray-400" : "bg-blue-500"}`}
            onPress={handleCreatePost}
            disabled={createPostMutation.isPending || newPostText.trim() === ""}
          >
            <Text className="text-white text-sm font-semibold">
              {createPostMutation.isPending ? "Publicando..." : "Publicar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {posts.map((post: Post) => {
          const isLiked = likedPosts.has(post.id);
          const isLiking = likingPosts.has(post.id);

          return (
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
                  disabled={isLiking}
                >
                  <View className="mr-2">
                    <Text
                      className="text-base"
                      style={{
                        color: isLiked ? "#EF4444" : "#9CA3AF",
                        opacity: isLiking ? 0.5 : 1,
                      }}
                    >
                      {isLiked ? "♥" : "♡"}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-500">
                    {post.likesCount || 0} curtida
                    {post.likesCount !== 1 ? "s" : ""}
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
                    {post.commentsCount || 0} comentário
                    {post.commentsCount !== 1 ? "s" : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
