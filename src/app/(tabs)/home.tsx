import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { getPosts } from '../../services/api';

// A simple time-ago function
const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

const CommentsModal = ({
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                        <Text className="text-gray-500">
                            {selectedPost.content}
                        </Text>
                    </View>
                )}

                <FlatList
                    // The API provides commentsCount, not a comment list on the post object.
                    // This would need a separate API endpoint to fetch comments for a post.
                    // For now, we pass an empty array to prevent crashes.
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
                        <Text className="text-center text-gray-500 italic mt-12">Nenhum comentário ainda</Text>
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

const HomeScreen = () => {
    const [newPostText, setNewPostText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts();
                if (Array.isArray(data)) {
                    setPosts(data);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                Alert.alert('Erro ao buscar posts', 'Não foi possível carregar os posts.');
            }
        };

        fetchPosts();
    }, []);

    const handleCreatePost = () => {
        // This is a client-side only creation, it won't persist.
        // This should be replaced with an API call.
        if (newPostText.trim()) {
            const newPost = {
                id: `new-${posts.length + 1}`,
                content: newPostText,
                likes: [],
                commentsCount: 0,
                createdAt: new Date().toISOString(),
                user: { name: 'Você (local)' },
            };
            setPosts([newPost, ...posts]);
            setNewPostText('');
        } else {
            Alert.alert('Erro', 'Por favor, escreva algo para publicar');
        }
    };

    const handleLike = (postId) => {
        // TODO: Implement like functionality with an API call.
        console.log(`Liking post ${postId} is not implemented.`);
    };

    const handleOpenComments = (postId) => {
        setSelectedPostId(postId);
        setShowComments(true);
    };

    const handleAddComment = () => {
        // TODO: Implement add comment functionality with an API call.
        console.log(`Adding comment to post ${selectedPostId} is not implemented.`);
    };

    const selectedPost = posts.find(post => post.id === selectedPostId);

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="py-4 px-5 items-center">
                <Text className="text-2xl font-bold text-black italic">gig</Text>
            </View>

            <View className="bg-white mx-4 my-4 rounded-xl p-5 shadow-md">
                <TextInput
                    placeholder="Criar publicação"
                    placeholderTextColor="#999"
                    multiline
                    value={newPostText}
                    onChangeText={setNewPostText}
                    textAlignVertical="top"
                    className="h-20"
                />
                <View className="flex-row justify-end gap-2.5 mt-2">
                    <TouchableOpacity className="bg-blue-500 py-2 px-5 rounded-full" onPress={handleCreatePost}>
                        <Text className="text-white text-sm font-semibold">Publicar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Posts List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {posts.map((post) => (
                    <View key={post.id} className="bg-white mx-4 mb-4 rounded-xl p-5 shadow-md">
                        <View className="flex-row items-center mb-4">
                            <Image 
                                source={{ uri: post.user.avatar || post.user.band?.profilePicture || `https://i.pravatar.cc/150?u=${post.user.id}` }} 
                                className="w-10 h-10 rounded-full mr-2.5 bg-gray-200" 
                            />
                            <View className="flex-col">
                                <Text className="text-base font-bold text-black mb-0.5">{post.user.name}</Text>
                                <Text className="text-sm text-gray-500">{timeAgo(post.createdAt)}</Text>
                            </View>
                        </View>
                        <Text className="text-base text-black mb-5 leading-snug">{post.content}</Text>
                        {post.imageUrl && (
                            <Image source={{ uri: post.imageUrl }} className="w-full h-64 rounded-lg mb-4 bg-gray-200" resizeMode="cover" />
                        )}
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="flex-row items-center flex-1"
                                onPress={() => handleLike(post.id)}
                            >
                                <View className="mr-2">
                                    <Text className="text-base text-gray-400">
                                        {'♡'}
                                    </Text>
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