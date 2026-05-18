import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { useAppContext } from '../../store/AppContext'
import { getUserProfileAPI, followUserAPI, unfollowUserAPI, checkFollowingAPI } from '../../services/api'

// SVG Icons
const LikeIcon = ({ active, isDarkMode }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? "#2B86ED" : "none"} stroke={active ? "#2B86ED" : (isDarkMode ? "#6B7280" : "#9CA3AF")} strokeWidth="1.8">
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
  </svg>
)

const DislikeIcon = ({ active, isDarkMode }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={active ? "#EF4444" : "none"} stroke={active ? "#EF4444" : (isDarkMode ? "#6B7280" : "#9CA3AF")} strokeWidth="1.8">
    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
  </svg>
)

const CommentIcon = ({ isDarkMode }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#6B7280" : "#9CA3AF"} strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function UserProfilePage() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { 
    posts, 
    followUser, 
    unfollowUser, 
    isFollowing,
    getFollowersCount,
    getFollowingCount
  } = useAppContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const location = useLocation()
  const { userName: stateName, userAvatar: stateAvatar, userId } = location.state || {}
  const [profile, setProfile] = useState(null)
  const [isCurrentUserFollowing, setIsCurrentUserFollowing] = useState(false)

  const userName = profile?.name || stateName || 'User'
  const userAvatar =
    profile?.image?.secure_url ||
    stateAvatar ||
    'https://randomuser.me/api/portraits/men/32.jpg'

  useEffect(() => {
    if (!userId) return
    const loadProfile = async () => {
      try {
        const [profileRes, followRes] = await Promise.all([
          getUserProfileAPI(userId),
          checkFollowingAPI(userId).catch(() => ({ isFollowing: false })),
        ])
        if (profileRes.user) setProfile(profileRes.user)
        setIsCurrentUserFollowing(!!followRes.isFollowing)
      } catch {
        /* keep state from navigation */
      }
    }
    loadProfile()
  }, [userId])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const isOwnProfile = userName === 'You'

  // Get user's posts from context
  const userPosts = posts.filter(post => post.author === userName)
  
  // حساب اللايكات على البوستات فقط
  const totalLikes = userPosts.reduce((sum, post) => sum + post.counts.like, 0)
  const totalPosts = userPosts.length
  
  // Followers و Following بيتحسبوا صح
  const followersCount = profile?.followers?.length ?? getFollowersCount(userName)
  const followingCount = profile?.following?.length ?? getFollowingCount(userName)

  // جلب تعليقات المستخدم على بوستات الآخرين
  const userComments = []
  posts.forEach(post => {
    post.reviews.forEach(comment => {
      if (comment.name === userName) {
        userComments.push({
          ...comment,
          parentPost: post
        })
      }
    })
  })

  const handleFollowToggle = async () => {
    if (!userId) {
      if (isCurrentUserFollowing) unfollowUser(userName)
      else followUser(userName)
      setIsCurrentUserFollowing(!isCurrentUserFollowing)
      return
    }
    try {
      if (isCurrentUserFollowing) {
        await unfollowUserAPI(userId)
        unfollowUser(userName)
      } else {
        await followUserAPI(userId)
        followUser(userName)
      }
      setIsCurrentUserFollowing(!isCurrentUserFollowing)
    } catch {
      /* ignore */
    }
  }

  const handleUserClick = (name, avatar) => {
    if (name !== 'You') {
      navigate('/user-profile', { state: { userName: name, userAvatar: avatar, userId } })
    } else {
      navigate('/profile')
    }
  }

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId)
  }

  const handleCommentClick = (postId) => {
    navigate('/social', { state: { scrollToPostId: postId } })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header with Cover */}
        <div className="relative">
          <div className={`h-52 rounded-b-[2.5rem] overflow-hidden relative ${isDarkMode ? 'bg-[#111827]' : 'bg-[#f0f7ff]'}`}>
            
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#2B86ED] to-[#1a6edb] opacity-20`}></div>
            <div className={`absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-gradient-to-tr from-[#2B86ED] to-[#818CF8] opacity-10`}></div>
            <div className={`absolute top-10 left-1/4 w-32 h-32 rounded-full border-[20px] ${isDarkMode ? 'border-white/5' : 'border-blue-500/5'}`}></div>
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-transparent to-black/30' : 'bg-gradient-to-b from-transparent to-blue-900/5'}`}></div>
          </div>
          
          {/* Avatar with green dot */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <img 
                src={userAvatar} 
                alt={userName}
                className={`w-32 h-32 rounded-full border-4 object-cover shadow-2xl ${isDarkMode ? 'border-[#0a0f1a]' : 'border-white'}`}
              />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="text-center mt-20 mb-8 px-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
              {userName}
            </h1>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isCurrentUserFollowing
                    ? isDarkMode 
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                    : 'bg-[#2B86ED] text-white hover:bg-[#1a6edb] shadow-lg shadow-blue-500/30'
                }`}
              >
                {isCurrentUserFollowing ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Following
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Joined 2025</span>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>{followersCount} Followers</span>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>{followingCount} Following</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-8 max-w-md mx-auto">
          <div className={`text-center p-4 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 text-[#2B86ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>{totalPosts}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Posts</div>
          </div>
          <div className={`text-center p-4 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:shadow-md'}`}>
            <div className="flex justify-center mb-2">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>{totalLikes}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Likes</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-2 text-sm font-medium transition-all relative ${
                activeTab === 'posts'
                  ? isDarkMode ? 'text-white' : 'text-[#2B86ED]'
                  : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2B86ED] rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-2 text-sm font-medium transition-all relative ${
                activeTab === 'comments'
                  ? isDarkMode ? 'text-white' : 'text-[#2B86ED]'
                  : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Comments
              {activeTab === 'comments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2B86ED] rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <div className="px-4 py-6">
            {userPosts.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No posts yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map(post => {
                  const isExpanded = expandedPostId === post.id
                  return (
                    <div key={post.id} className={`rounded-2xl overflow-hidden transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:shadow-md'}`}>
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <img 
                            src={post.avatarImage} 
                            alt={post.author}
                            onClick={() => handleUserClick(post.author, post.avatarImage)}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold cursor-pointer hover:underline ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}
                                  onClick={() => handleUserClick(post.author, post.avatarImage)}>
                                {post.author}
                              </span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{post.time}</span>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>posted about</span>
                              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                                {post.name}
                              </span>
                              {post.type === 'hazard' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 animate-pulse">⚠️ HAZARD</span>
                              )}
                            </div>
                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{post.body}</p>
                            {post.postImage && (
                              <img src={post.postImage} className="w-full h-56 object-cover rounded-xl mt-3" alt="" />
                            )}
                            
                            <div className="flex items-center gap-4 mt-3">
                              <button className="flex items-center gap-1.5">
                                <LikeIcon active={post.counts.liked} isDarkMode={isDarkMode} />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{post.counts.like}</span>
                              </button>
                              <button className="flex items-center gap-1.5">
                                <DislikeIcon active={post.counts.disliked} isDarkMode={isDarkMode} />
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{post.counts.dislike}</span>
                              </button>
                              <button 
                                onClick={() => toggleComments(post.id)}
                                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:underline flex items-center gap-1`}
                              >
                                <CommentIcon isDarkMode={isDarkMode} />
                                <span>{post.reviews.length} comments</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {isExpanded && post.reviews.length > 0 && (
                        <div className={`px-5 pb-5 pt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                          <div className="space-y-3">
                            {post.reviews.map(comment => (
                              <div key={comment.id} className="flex gap-2">
                                <img 
                                  src={comment.avatarImage} 
                                  alt={comment.name}
                                  onClick={() => handleUserClick(comment.name, comment.avatarImage)}
                                  className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span 
                                      className={`text-sm font-semibold cursor-pointer hover:underline ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}
                                      onClick={() => handleUserClick(comment.name, comment.avatarImage)}
                                    >
                                      {comment.name}
                                    </span>
                                    <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{comment.time}</span>
                                  </div>
                                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{comment.comment}</p>
                                  <div className="flex gap-3 mt-1.5">
                                    <button className="flex items-center gap-1">
                                      <LikeIcon active={comment.liked} isDarkMode={isDarkMode} />
                                      <span className="text-[10px] text-gray-500">{comment.likes || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1">
                                      <DislikeIcon active={comment.disliked} isDarkMode={isDarkMode} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Comments Tab Content */}
        {activeTab === 'comments' && (
          <div className="px-4 py-6">
            {userComments.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userComments.map(comment => (
                  <div 
                    key={comment.id} 
                    onClick={() => handleCommentClick(comment.parentPost.id)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer hover:scale-[1.02] ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm hover:shadow-md'}`}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={comment.avatarImage} 
                        alt={comment.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                            {comment.name}
                          </span>
                          <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{comment.time}</span>
                          <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>commented on</span>
                          <span className={`text-sm font-medium text-[#2B86ED] hover:underline`}>
                            {comment.parentPost.author}'s post
                          </span>
                        </div>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{comment.comment}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <LikeIcon active={comment.liked} isDarkMode={isDarkMode} />
                            <span className="text-xs text-gray-500">{comment.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <DislikeIcon active={comment.disliked} isDarkMode={isDarkMode} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}