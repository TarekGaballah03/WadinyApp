import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  // حالة تخزين صورة البروفايل الحالية للمستخدم
  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('userAvatar') || 'https://randomuser.me/api/portraits/lego/1.jpg';
  });

  // دالة لتحديث صورة البروفايل وتحديث كل البوستات والتعليقات القديمة
  const updateUserAvatar = (newAvatar) => {
    setUserAvatar(newAvatar);
    localStorage.setItem('userAvatar', newAvatar);
    
    setPosts(prevPosts => prevPosts.map(post => {
      let updatedPost = { ...post };
      if (post.author === 'You') {
        updatedPost.avatarImage = newAvatar;
      }
      
      updatedPost.reviews = post.reviews.map(comment => {
        if (comment.name === 'You') {
          return { ...comment, avatarImage: newAvatar };
        }
        return comment;
      });
      
      return updatedPost;
    }));
  };

  // تخزين علاقات المتابعة: { follower: 'You', following: 'John' }
  const [followRelations, setFollowRelations] = useState(() => {
    const saved = localStorage.getItem('followRelations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('followRelations', JSON.stringify(followRelations));
  }, [followRelations]);

  // متابعة مستخدم
  const followUser = (userName) => {
    const currentUser = 'You';
    if (userName === currentUser) return;
    
    const alreadyFollowing = followRelations.some(
      rel => rel.follower === currentUser && rel.following === userName
    );
    
    if (!alreadyFollowing) {
      setFollowRelations([...followRelations, { follower: currentUser, following: userName }]);
    }
  };

  // إلغاء متابعة مستخدم
  const unfollowUser = (userName) => {
    const currentUser = 'You';
    setFollowRelations(followRelations.filter(
      rel => !(rel.follower === currentUser && rel.following === userName)
    ));
  };

  // التحقق إذا كان المستخدم الحالي يتابع شخص معين
  const isFollowing = (userName) => {
    const currentUser = 'You';
    return followRelations.some(rel => rel.follower === currentUser && rel.following === userName);
  };

  // جلب عدد المتابعين لمستخدم معين (اللي بيتبعوه)
  const getFollowersCount = (userName) => {
    return followRelations.filter(rel => rel.following === userName).length;
  };

  // جلب عدد اللي يتابعهم مستخدم معين
  const getFollowingCount = (userName) => {
    return followRelations.filter(rel => rel.follower === userName).length;
  };

  const addNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const deleteComment = (postId, commentId) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return {
        ...post,
        reviews: post.reviews.filter(comment => comment.id !== commentId)
      };
    }));
  };

  const handlePostAction = (id, action) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const { liked, disliked, like, dislike } = p.counts;
      if (action === 'like') {
        return { 
          ...p, 
          counts: { 
            ...p.counts, 
            like: liked ? like - 1 : like + 1, 
            liked: !liked, 
            disliked: false, 
            dislike: disliked ? dislike - 1 : dislike 
          } 
        };
      }
      if (action === 'dislike') {
        return { 
          ...p, 
          counts: { 
            ...p.counts, 
            dislike: disliked ? dislike - 1 : dislike + 1, 
            disliked: !disliked, 
            liked: false, 
            like: liked ? like - 1 : like 
          } 
        };
      }
      return p;
    }));
  };

  const addComment = (postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment = {
        id: Date.now(),
        name: 'You',
        time: 'Just now',
        likes: 0,
        liked: false,
        disliked: false,
        avatarImage: userAvatar,
        comment: text
      };
      return { ...p, reviews: [newComment, ...p.reviews] };
    }));
  };

  const handleCommentAction = (postId, commentId, action) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        reviews: p.reviews.map(c => {
          if (c.id !== commentId) return c;
          if (action === 'like') {
            return { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked, disliked: false };
          }
          if (action === 'dislike') {
            return { ...c, disliked: !c.disliked, liked: false, likes: c.liked ? c.likes - 1 : c.likes };
          }
          return c;
        })
      };
    }));
  };

  return (
    <AppContext.Provider value={{ 
      posts, 
      setPosts,
      addNewPost, 
      deletePost, 
      deleteComment,
      handlePostAction, 
      addComment, 
      handleCommentAction,
      followUser,
      unfollowUser,
      isFollowing,
      getFollowersCount,
      getFollowingCount,
      userAvatar,
      updateUserAvatar
    }}>
      {children}
    </AppContext.Provider>
  );
};