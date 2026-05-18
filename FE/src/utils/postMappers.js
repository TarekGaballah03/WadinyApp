const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/lego/1.jpg";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=300&fit=crop";

export function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_BADGES = {
  hazard: { badge: "⚠️ HAZARD", badgeColor: "bg-red-500", button: "View Hazard Details" },
  social: { badge: "💬 COMMUNITY POST", badgeColor: "bg-green-500", button: "Read Post" },
  offer: { badge: "🎁 SPECIAL OFFER", badgeColor: "bg-orange-500", button: "View Offer" },
};

/** Map API post → SocialFeed / AppContext card shape */
export function mapBackendPostToSocial(p) {
  const currentUserId = localStorage.getItem("userId");
  const authorId = p.author?._id?.toString?.() || p.author?._id;
  const isOwn = authorId && currentUserId && authorId === currentUserId;
  const userId = currentUserId;

  const isLiked = p.likes?.some((id) => id.toString() === userId);
  const isDisliked = p.dislikes?.some((id) => id.toString() === userId);
  const type = p.type || "social";

  return {
    id: p._id,
    authorId,
    name: p.title || "Post",
    author: isOwn ? "You" : p.author?.name || "Unknown",
    time: formatTimeAgo(p.createdAt),
    body: p.body,
    postImage: p.image?.secure_url || null,
    avatarImage: p.author?.image?.secure_url || DEFAULT_AVATAR,
    counts: {
      like: p.likes?.length || 0,
      dislike: p.dislikes?.length || 0,
      liked: !!isLiked,
      disliked: !!isDisliked,
    },
    type,
    gradient:
      type === "hazard"
        ? "linear-gradient(135deg,#c0392b,#e67e22 50%,#f39c12)"
        : type === "offer"
          ? "linear-gradient(135deg,#2ecc71,#27ae60 50%,#1e8449)"
          : "linear-gradient(135deg,#3d6e8a,#6baed6 50%,#c4a25a)",
    reviews: [],
    createdAt: p.createdAt,
  };
}

/** Map API post → HomePage live-update card */
export function mapBackendPostToFeedItem(p) {
  const type = p.type || "social";
  const meta = TYPE_BADGES[type] || TYPE_BADGES.social;
  const authorName = p.author?.name || "Someone";
  const image = p.image?.secure_url || DEFAULT_IMAGE;

  let title;
  if (type === "hazard") {
    title = p.title || "Hazard reported";
  } else if (type === "offer") {
    title = p.offerDiscount ? `${p.offerDiscount} at ${p.title}` : p.title;
  } else {
    title = `${authorName} shared: ${p.title || "a post"}`;
  }

  return {
    id: p._id,
    postId: p._id,
    title,
    description: (p.body || "").slice(0, 120),
    button: meta.button,
    image,
    type,
    category: type === "social" ? "post" : type,
    badge: meta.badge,
    badgeColor: meta.badgeColor,
    data: {
      title: p.title,
      type,
      description: p.body,
      image,
      author: authorName,
      authorId: p.author?._id,
      time: formatTimeAgo(p.createdAt),
      location: p.location,
      offer: p.offerDiscount,
      validUntil: p.offerValidUntil,
      postId: p._id,
    },
  };
}

/** Map restaurant offer → HomePage live-update card */
export function mapOfferToFeedItem(offer) {
  const restaurantName = offer.restaurantId?.name || "Restaurant";
  const image =
    offer.image?.secure_url ||
    offer.restaurantId?.image?.secure_url ||
    DEFAULT_IMAGE;

  return {
    id: `offer-${offer._id}`,
    offerId: offer._id,
    title: offer.title || `${offer.discount}% off at ${restaurantName}`,
    description: (offer.description || "").slice(0, 120),
    button: "View Offer",
    image,
    type: "offer",
    category: "offer",
    badge: "🎁 SPECIAL OFFER",
    badgeColor: "bg-orange-500",
    data: {
      title: offer.title,
      type: "offer",
      offer: offer.discount,
      description: offer.description,
      location: offer.restaurantId?.location || restaurantName,
      image,
      validUntil: offer.validUntil
        ? new Date(offer.validUntil).toLocaleDateString()
        : undefined,
      code: offer.code,
      offerId: offer._id,
      restaurantId: offer.restaurantId?._id,
    },
  };
}

/** Map road report → HomePage hazard card (when not linked to a post) */
export function mapReportToFeedItem(report) {
  const image = report.media?.secure_url || DEFAULT_IMAGE;
  return {
    id: `report-${report._id}`,
    reportId: report._id,
    postId: report.linkedPostId?._id || report.linkedPostId,
    title: report.issueType || "Road issue reported",
    description: (report.note || "Community hazard report").slice(0, 120),
    button: "View Hazard Details",
    image,
    type: "hazard",
    category: "hazard",
    badge: "⚠️ HAZARD",
    badgeColor: "bg-red-500",
    data: {
      title: report.issueType,
      type: "hazard",
      description: report.note,
      image,
      location: report.location,
      reportedBy: report.reportedBy?.name,
      time: formatTimeAgo(report.createdAt),
      reportId: report._id,
    },
  };
}

export function mapBackendPostsToSocial(posts) {
  return (posts || []).map(mapBackendPostToSocial);
}

export function buildHomeFeedItems({ posts = [], offers = [], reports = [] }) {
  const postIds = new Set((posts || []).map((p) => p._id?.toString()));

  const fromPosts = posts.map(mapBackendPostToFeedItem);

  const fromReports = (reports || [])
    .filter((r) => {
      const linked = r.linkedPostId?._id || r.linkedPostId;
      return !linked || !postIds.has(linked.toString());
    })
    .map(mapReportToFeedItem);

  const fromOffers = (offers || []).map(mapOfferToFeedItem);

  const merged = [...fromPosts, ...fromReports, ...fromOffers];
  merged.sort((a, b) => {
    const ta = a.data?.time || "";
    const tb = b.data?.time || "";
    return 0;
  });

  return merged.slice(0, 8);
}
