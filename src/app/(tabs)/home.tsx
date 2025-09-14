import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.commentsModal}>
                <View style={styles.commentsHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.commentsTitle}>Comentários</Text>
                    <View style={{ width: 24 }} />
                </View>

                {selectedPost && (
                    <View style={styles.originalPost}>
                        <Text style={styles.originalPostAuthor}>{selectedPost.author}</Text>
                        <Text style={styles.originalPostContent}>
                            {selectedPost.content}
                        </Text>
                    </View>
                )}

                <FlatList
                    data={selectedPost?.comments || []}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.commentsList}
                    renderItem={({ item }) => (
                        <View style={styles.commentItem}>
                            <Text style={styles.commentAuthor}>{item.author}</Text>
                            <Text style={styles.commentText}>{item.text}</Text>
                            <Text style={styles.commentTime}>{item.timeAgo}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.noCommentsText}>Nenhum comentário ainda</Text>
                    }
                />

                <View style={styles.addCommentSection}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Adicione um comentário..."
                        placeholderTextColor="#999"
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendCommentButton}
                        onPress={handleAddComment}
                    >
                        <Text style={styles.sendCommentText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    </Modal>
);

const HomeScreen = () => {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [newComment, setNewComment] = useState('');

    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Paulo Luan',
            timeAgo: '1 h',
            content: 'Show hoje no Colosso',
            likes: 0,
            liked: false,
            comments: [],
            profile: 'https://i.pravatar.cc/150?img=1',
        },
        {
            id: 2,
            author: 'Paulo Luan',
            timeAgo: '1 h',
            content: 'Show hoje no Lake',
            likes: 188,
            liked: false,
            comments: [
                { id: 1, author: 'Ana Silva', text: 'Que show incrível!', timeAgo: '30 min' },
                { id: 2, author: 'João Pedro', text: 'Estava lá, foi demais! 🎵', timeAgo: '25 min' },
            ],
            profile: 'https://i.pravatar.cc/150?img=2',
        },
        {
            id: 3,
            author: 'Paulo Luan',
            timeAgo: '1 h',
            content: 'Show hoje no Lounge',
            likes: 0,
            liked: false,
            comments: [],
            profile: 'https://i.pravatar.cc/150?img=3',
        },
    ]);

    const handleCreatePost = () => {
        if (newPostText.trim()) {
            const newPost = {
                id: posts.length + 1,
                author: 'Você',
                timeAgo: 'agora',
                content: newPostText,
                likes: 0,
                liked: false,
                comments: [],
            };
            setPosts([newPost, ...posts]);
            setNewPostText('');
            setShowCreatePost(false);
        } else {
            Alert.alert('Erro', 'Por favor, escreva algo para publicar');
        }
    };

    const handleLike = (postId) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes: post.liked ? post.likes - 1 : post.likes + 1,
                };
            }
            return post;
        }));
    };

    const handleOpenComments = (postId) => {
        setSelectedPostId(postId);
        setShowComments(true);
    };

    const handleAddComment = () => {
        if (newComment.trim() && selectedPostId) {
            const newCommentObj = {
                id: Date.now(),
                author: 'Você',
                text: newComment,
                timeAgo: 'agora',
            };

            setPosts(posts.map(post => {
                if (post.id === selectedPostId) {
                    return {
                        ...post,
                        comments: [...post.comments, newCommentObj],
                    };
                }
                return post;
            }));
            setNewComment('');
        }
    };

    const selectedPost = posts.find(post => post.id === selectedPostId);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>gig</Text>
            </View>

            <View style={styles.createPostCard}>
                <TextInput
                    placeholder="Criar publicação"
                    placeholderTextColor="#999"
                    multiline
                    value={newPostText}
                    onChangeText={setNewPostText}
                    textAlignVertical="top"
                />
                <View style={styles.createPostActions}>
                    <TouchableOpacity style={styles.publishButton} onPress={handleCreatePost}>
                        <Text style={styles.publishButtonText}>Publicar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Posts List */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {posts.map((post) => (
                    <View key={post.id} style={styles.postCard}>
                        <View style={styles.postHeader}>
                            <Image source={{ uri: post.profile }} style={styles.profileImage} />
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName}>{post.author}</Text>
                                <Text style={styles.timeAgo}>{post.timeAgo}</Text>
                            </View>
                        </View>
                        <Text style={styles.postContent}>{post.content}</Text>
                        <View style={styles.postActions}>
                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => handleLike(post.id)}
                            >
                                <View style={styles.heartIcon}>
                                    <Text style={[styles.heartText, { color: post.liked ? '#ff6b6b' : '#ccc' }]}>
                                        {post.liked ? '♥' : '♡'}
                                    </Text>
                                </View>
                                <Text style={styles.actionText}>
                                    {post.likes > 0 ? `${post.likes} curtidas` : '0 curtidas'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => handleOpenComments(post.id)}
                            >
                                <View style={styles.commentIcon}>
                                    <Text style={styles.commentText}>💬</Text>
                                </View>
                                <Text style={styles.actionText}>
                                    {post.comments.length > 0 ? `${post.comments.length} comentários` : '0 comentários'}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        fontStyle: 'italic',
    },
    createPostButton: {
        backgroundColor: '#f8f8f8',
        marginHorizontal: 15,
        marginVertical: 15,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    createPostText: {
        color: '#666',
        fontSize: 16,
    },
    arrow: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold',
    },
    createPostCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 15,
        marginVertical: 15,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    createPostActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 14,
    },
    publishButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    publishButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    postCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    authorInfo: {
        flexDirection: 'column',
    },
    authorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    timeAgo: {
        fontSize: 14,
        color: '#666',
    },
    postContent: {
        fontSize: 16,
        color: '#000',
        marginBottom: 20,
        lineHeight: 22,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    heartIcon: {
        marginRight: 8,
    },
    heartText: {
        fontSize: 16,
    },
    commentIcon: {
        marginRight: 8,
    },
    commentText: {
        marginBottom: 5,
        lineHeight: 20,
    },
    actionText: {
        fontSize: 14,
        color: '#666',
    },
    commentsModal: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    commentsHeader: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    originalPost: {
        backgroundColor: '#ffffff',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    originalPostAuthor: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    originalPostContent: {
        color: '#666',
    },
    commentsList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    commentItem: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
    },
    commentAuthor: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    commentTime: {
        color: '#666',
        fontSize: 12,
    },
    noCommentsText: {
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic',
        marginTop: 50,
    },
    addCommentSection: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 80,
    },
    sendCommentButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sendCommentText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default HomeScreen;