import api from "../api";

export interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface CreateCommentDto {
  comment: string;
  postId: number;
  userId: string;
}

export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  try {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

export async function createComment(data: CreateCommentDto): Promise<Comment> {
  try {
    const response = await api.post("/comments", data);
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}

export async function deleteComment(commentId: number): Promise<void> {
  try {
    await api.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}