import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAppContext } from '../../store/AppContext'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'

// SVG Icons (نفس الكود)
const LikeIcon = ({ active, isDarkMode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "#2B86ED" : "none"} stroke={active ? "#2B86ED" : (isDarkMode ? "#6B7280" : "#9CA3AF")} strokeWidth="1.8">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DislikeIcon = ({ active, isDarkMode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "#EF4444" : "none"} stroke={active ? "#EF4444" : (isDarkMode ? "#6B7280" : "#9CA3AF")} strokeWidth="1.8">
    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CommentIcon = ({ isDarkMode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#6B7280" : "#9CA3AF"} strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShareIcon = ({ isDarkMode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#6B7280" : "#9CA3AF"} strokeWidth="1.8">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/>
    <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round"/>
  </svg>
)

// Toast Component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
      <div className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}

export default function SocialFeed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { 
    posts, 
    handlePostAction, 
    addComment, 
    handleCommentAction, 
    deletePost, 
    deleteComment,
    // following removed - wasn't used
    followUser,
    unfollowUser,
    isFollowing,
    userAvatar
  } = useAppContext();
  const [commentText, setCommentText] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [filterType, setFilterType] = useState('all');
  
  const postRefs = useRef({});

  // isLoggedIn removed - wasn't used
  // No need for useEffect checking loggedIn since we have protected routes

  useEffect(() => {
    const scrollToPostId = location.state?.scrollToPostId;
    if (scrollToPostId && postRefs.current[scrollToPostId]) {
      setTimeout(() => {
        postRefs.current[scrollToPostId].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 500);
    }
  }, [location.state]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleUserClick = (author, avatarImage) => {
    if (author === 'You') {
      navigate('/profile');
    } else {
      navigate('/user-profile', { 
        state: { 
          userName: author, 
          userAvatar: avatarImage 
        } 
      });
    }
  };

  const handleFollowToggle = (author) => {
    if (author === 'You') return;
    if (isFollowing(author)) {
      unfollowUser(author);
      showToast(`Unfollowed ${author}`, 'success');
    } else {
      followUser(author);
      showToast(`Following ${author}`, 'success');
    }
  };

  const handleAddComment = (postId) => {
    if (commentText[postId]?.trim()) {
      addComment(postId, commentText[postId]);
      setCommentText({ ...commentText, [postId]: '' });
      showToast('Comment added!', 'success');
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleDeletePost = async (postId, postName) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete "<strong>${postName}</strong>"`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      deletePost(postId);
      await Swal.fire({
        title: 'Deleted!',
        text: 'Your post has been deleted.',
        icon: 'success',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        timer: 2000,
        showConfirmButton: true,
      });
    }
  };

  const handleDeleteComment = async (postId, commentId, commentText_content) => {
    const result = await Swal.fire({
      title: 'Delete Comment?',
      html: `Are you sure you want to delete "<strong>${commentText_content?.substring(0, 50)}${commentText_content?.length > 50 ? '...' : ''}</strong>"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      deleteComment(postId, commentId);
      await Swal.fire({
        title: 'Deleted!',
        text: 'Your comment has been deleted.',
        icon: 'success',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        timer: 1500,
        showConfirmButton: true,
      });
    }
  };

  // ✅ فلترة البوستات - منع الـ Offers نهائياً مع عرض الـ cafe و social و hazard
  const filteredPosts = posts.filter(post => {
    // منع ظهور أي بوست type = 'offer' في Social Feed
    if (post.type === 'offer') return false;
    
    if (filterType === 'all') {
      // عرض الـ social, cafe, hazard (كل الأنواع ماعدا offer)
      return post.type === 'social' || post.type === 'cafe' || post.type === 'hazard'
    }
    if (filterType === 'social') {
      // عرض الـ social و cafe مع بعض
      return post.type === 'social' || post.type === 'cafe'
    }
    return post.type === filterType
  });

  // تحديد border style حسب نوع البوست
  const getBorderStyle = (postType) => {
    if (postType === 'hazard') {
      return isDarkMode 
        ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
        : 'border-red-400 shadow-lg shadow-red-500/20';
    }
    return isDarkMode ? 'border-white/10' : 'border-gray-100';
  };

  return (
    <div className={`font-sans min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f8fafd]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="pt-8 pb-2 text-center">
        <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide ${
          isDarkMode ? 'text-white' : 'text-[#1a3650]'
        }`}>
          Social Feed
        </h1>
        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Share updates and report road hazards
        </p>
      </div>

      {/* Filter Buttons - social (يشمل cafe) و hazard */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 justify-center px-4">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            filterType === 'all' 
              ? 'bg-[#2B86ED] text-white' 
              : isDarkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Posts
        </button>
        <button 
          onClick={() => setFilterType('social')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            filterType === 'social' 
              ? 'bg-[#2B86ED] text-white' 
              : isDarkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📝 Community
        </button>
        <button 
          onClick={() => setFilterType('hazard')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
            filterType === 'hazard' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
              : isDarkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚠️ Hazards
        </button>
      </div>

      <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 md:px-6 pb-16">
        {filteredPosts.map((post) => {
          const isMyPost = post.author === 'You';
          const isCommentsExpanded = expandedComments[post.id];

          return (
            <div 
              key={post.id} 
              ref={el => postRefs.current[post.id] = el}
              className="mb-10 scroll-mt-20"
            >
              <div className="flex items-center justify-end mb-2.5 ml-4">
                <div className="flex items-center gap-3">
                  {isMyPost && (
                    <button 
                      onClick={() => handleDeletePost(post.id, post.name)}
                      className="text-red-500 hover:text-red-700 transition p-1"
                      title="Delete post"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>

              <div className={`rounded-[30px] overflow-hidden shadow-sm border-2 transition-all duration-300 ${getBorderStyle(post.type)} ${
                isDarkMode 
                  ? 'bg-white/10 backdrop-blur-md' 
                  : 'bg-[#eef3fc]'
              }`}>
                {post.postImage && <img src={post.postImage} className="w-full h-56 md:h-64 lg:h-72 object-cover" alt="" />}
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <img 
                      src={post.avatarImage} 
                      alt={post.author}
                      onClick={() => handleUserClick(post.author, post.avatarImage)}
                      className="w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-white object-cover shadow-sm cursor-pointer hover:opacity-80 transition-all hover:scale-105"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          className={`text-[15px] md:text-base font-extrabold leading-tight cursor-pointer hover:underline ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}
                          onClick={() => handleUserClick(post.author, post.avatarImage)}
                        >
                          {post.author}
                        </h3>
                        <span className="text-[11px] text-gray-400">posted about</span>
                        <span className={`text-[15px] md:text-base font-extrabold leading-tight ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                          {post.name}
                        </span>
                        {post.author !== 'You' && (
                          <button
                            onClick={() => handleFollowToggle(post.author)}
                            className={`text-xs px-2 py-0.5 rounded-full transition ${
                              isFollowing(post.author)
                                ? isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                                : 'bg-[#2B86ED] text-white'
                            }`}
                          >
                            {isFollowing(post.author) ? 'Following' : 'Follow'}
                          </button>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{post.time}</p>
                      
                      {post.type === 'hazard' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white mt-2 animate-pulse">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          HAZARD REPORT
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-[14px] md:text-[15px] mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{post.body}</p>
                  
                  <div className={`flex items-center justify-between mt-2 border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex gap-4 md:gap-6">
                        <button onClick={() => handlePostAction(post.id, 'like')} className="flex items-center gap-1.5 hover:opacity-70 transition">
                            <LikeIcon active={post.counts.liked} isDarkMode={isDarkMode} />
                            <span className="text-sm font-medium text-gray-500">{post.counts.like}</span>
                        </button>
                        <button onClick={() => handlePostAction(post.id, 'dislike')} className="flex items-center gap-1.5 hover:opacity-70 transition">
                            <DislikeIcon active={post.counts.disliked} isDarkMode={isDarkMode} />
                            <span className="text-sm font-medium text-gray-500">{post.counts.dislike}</span>
                        </button>
                        <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 hover:opacity-70 transition">
                            <CommentIcon isDarkMode={isDarkMode} />
                            <span className="text-sm font-medium text-gray-500">{post.reviews.length}</span>
                        </button>
                    </div>
                    <ShareIcon isDarkMode={isDarkMode} />
                  </div>
                </div>
              </div>
              
              {(isCommentsExpanded || post.reviews.slice(0, 2).length > 0) && (
                <div className="mt-4 ml-6 space-y-3">
                  {(isCommentsExpanded ? post.reviews : post.reviews.slice(0, 2)).map((comment) => (
                    <div key={comment.id} className={`rounded-2xl p-4 transition-all duration-300 ${
                      isDarkMode ? 'bg-white/5 backdrop-blur-sm' : 'bg-[#eef3fc]'
                    }`}>
                      <div className="flex gap-3">
                        <img 
                          src={comment.avatarImage} 
                          alt={comment.name}
                          onClick={() => handleUserClick(comment.name, comment.avatarImage)}
                          className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              <h4 
                                className={`font-bold text-sm cursor-pointer hover:underline ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}
                                onClick={() => handleUserClick(comment.name, comment.avatarImage)}
                              >
                                {comment.name}
                              </h4>
                              <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{comment.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {comment.name === 'You' && (
                                <button 
                                  onClick={() => handleDeleteComment(post.id, comment.id, comment.comment)}
                                  className="text-red-500 hover:text-red-700 transition p-1"
                                  title="Delete comment"
                                >
                                  <DeleteIcon />
                                </button>
                              )}
                              {comment.name !== 'You' && (
                                <button
                                  onClick={() => handleFollowToggle(comment.name)}
                                  className={`text-[10px] px-2 py-0.5 rounded-full transition ${
                                    isFollowing(comment.name)
                                      ? isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                                      : 'bg-[#2B86ED] text-white'
                                  }`}
                                >
                                  {isFollowing(comment.name) ? 'Following' : 'Follow'}
                                </button>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{comment.comment}</p>
                          <div className="flex gap-3 mt-2">
                            <button 
                              onClick={() => handleCommentAction(post.id, comment.id, 'like')}
                              className="flex items-center gap-1"
                            >
                              <LikeIcon active={comment.liked} isDarkMode={isDarkMode} />
                              <span className="text-xs text-gray-500">{comment.likes || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleCommentAction(post.id, comment.id, 'dislike')}
                              className="flex items-center gap-1"
                            >
                              <DislikeIcon active={comment.disliked} isDarkMode={isDarkMode} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {post.reviews.length > 2 && (
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="text-xs text-[#2B86ED] hover:underline ml-2"
                    >
                      {isCommentsExpanded ? 'Show less' : `View all ${post.reviews.length} comments →`}
                    </button>
                  )}
                  
                  <div className={`flex gap-2 items-center p-2 rounded-full border ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/20' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <img 
                      src={userAvatar}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80" 
                      alt=""
                      onClick={() => handleUserClick('You', userAvatar)}
                    />
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className={`flex-1 bg-transparent px-4 text-sm outline-none ${
                        isDarkMode ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'
                      }`}
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <button onClick={() => handleAddComment(post.id)} className="bg-[#2B86ED] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#1a6edb] transition">
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className={`text-center py-12 rounded-2xl transition-all duration-300 ${
            isDarkMode ? 'bg-white/5' : 'bg-white'
          }`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {filterType === 'hazard' 
                ? 'No hazard reports yet. Be the first to report one! ⚠️'
                : 'No posts yet. Create your first post! 📝'}
            </p>
            <button
              onClick={() => navigate('/social/new-post')}
              className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition ${
                isDarkMode ? 'bg-[#2B86ED] text-white hover:bg-[#1a6edb]' : 'bg-[#2B86ED] text-white hover:bg-[#1a6edb]'
              }`}
            >
              Create Post
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/social/new-post')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2B86ED] text-white shadow-lg hover:bg-[#1a6edb] transition-all hover:scale-105 flex items-center justify-center z-50"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}