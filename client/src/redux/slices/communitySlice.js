import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getPosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'community/fetchPostById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getPostById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.createPost(postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'community/updatePost',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.updatePost(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'community/deletePost',
  async (id, { rejectWithValue }) => {
    try {
      await api.deletePost(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'community/likePost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.likePost(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const savePost = createAsyncThunk(
  'community/savePost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.savePost(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save post');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'community/fetchComments',
  async ({ targetType, targetId, params }, { rejectWithValue }) => {
    try {
      const response = await api.getComments(targetType, targetId, params);
      return { targetId, comments: response.data, pagination: response.pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'community/addComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await api.createComment(commentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'community/deleteComment',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteComment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const fetchTrendingTopics = createAsyncThunk(
  'community/fetchTrendingTopics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getTrendingTopics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending topics');
    }
  }
);

// Initial state
const initialState = {
  posts: [],
  currentPost: null,
  comments: {},
  trendingTopics: [],
  filters: {
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
  success: false,
};

// Slice
const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    updatePostInList: (state, action) => {
      const index = state.posts.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload };
      }
    },
    updateCommentInPost: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        const commentIndex = post.comments.findIndex(c => c._id === comment._id);
        if (commentIndex !== -1) {
          post.comments[commentIndex] = { ...post.comments[commentIndex], ...comment };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Post By Id
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.posts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
        state.success = true;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = state.posts.filter(p => p._id !== action.payload);
        if (state.currentPost?._id === action.payload) {
          state.currentPost = null;
        }
        state.success = true;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { id, isLiked, likeCount } = action.payload;
        
        // Update in posts list
        const postIndex = state.posts.findIndex(p => p._id === id);
        if (postIndex !== -1) {
          state.posts[postIndex].stats.likes = likeCount;
          if (isLiked) {
            state.posts[postIndex].likes.push('current-user');
          } else {
            state.posts[postIndex].likes = 
              state.posts[postIndex].likes.filter(l => l !== 'current-user');
          }
        }

        // Update current post if it's the one
        if (state.currentPost && state.currentPost._id === id) {
          state.currentPost.stats.likes = likeCount;
          if (isLiked) {
            state.currentPost.likes.push('current-user');
          } else {
            state.currentPost.likes = 
              state.currentPost.likes.filter(l => l !== 'current-user');
          }
        }
      })

      // Save Post
      .addCase(savePost.fulfilled, (state, action) => {
        state.success = true;
      })

      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments[action.payload.targetId] = {
          data: action.payload.comments,
          pagination: action.payload.pagination,
        };
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        if (comment.targetType === 'post') {
          const post = state.posts.find(p => p._id === comment.targetId);
          if (post) {
            if (!post.comments) post.comments = [];
            post.comments.unshift(comment);
            post.stats.comments += 1;
          }
          if (state.currentPost?._id === comment.targetId) {
            if (!state.currentPost.comments) state.currentPost.comments = [];
            state.currentPost.comments.unshift(comment);
            state.currentPost.stats.comments += 1;
          }
        }
      })

      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        // Remove comment from all places (would need target info in payload)
        // This is simplified
        state.success = true;
      })

      // Fetch Trending Topics
      .addCase(fetchTrendingTopics.fulfilled, (state, action) => {
        state.trendingTopics = action.payload;
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  setPage, 
  clearCurrentPost, 
  clearError, 
  clearSuccess,
  updatePostInList,
  updateCommentInPost
} = communitySlice.actions;

// Selectors
export const selectPosts = (state) => state.community.posts;
export const selectCurrentPost = (state) => state.community.currentPost;
export const selectComments = (state) => state.community.comments;
export const selectTrendingTopics = (state) => state.community.trendingTopics;
export const selectCommunityFilters = (state) => state.community.filters;
export const selectCommunityPagination = (state) => state.community.pagination;
export const selectCommunityLoading = (state) => state.community.isLoading;
export const selectCommunityError = (state) => state.community.error;

export default communitySlice.reducer;
