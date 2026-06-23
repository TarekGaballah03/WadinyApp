// src/modules/restaurants/restaurant.service.js
import { restaurantModel } from "../../DB/models/restaurant.model.js";
import { offerModel } from "../../DB/models/offer.model.js";
import { userModel } from "../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/globalErrorHandling/index.js";
import cloudinary from "../../utils/cloudinary/index.js";

// ==================== Restaurants CRUD ====================

// 1. Create Restaurant (لصاحب المطعم بس)
export const createRestaurant = asyncHandler(async (req, res, next) => {
  const { name, location, address, category, cuisine, hours, phone, priceRange, tags } = req.body;

  // تأكيد إن المستخدم عنده role restaurant
  if (req.user.role !== "restaurant" && req.user.role !== "admin") {
    return next(new Error("Only restaurant owners can create restaurants", { cause: 403 }));
  }

  // تأكد إن المطعم مش موجود بنفس الاسم
  const existingRestaurant = await restaurantModel.findOne({ name });
  if (existingRestaurant) {
    return next(new Error("Restaurant with this name already exists", { cause: 400 }));
  }

  // رفع الصورة
  let secure_url = null;
  let public_id = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "wadiny/restaurants",
    });
    secure_url = result.secure_url;
    public_id = result.public_id;
  }

  const restaurant = await restaurantModel.create({
    name,
    location,
    address: typeof address === "string" ? JSON.parse(address) : address,
    category,
    cuisine,
    hours: typeof hours === "string" ? JSON.parse(hours) : hours,
    phone,
    priceRange,
    tags: typeof tags === "string" ? JSON.parse(tags) : tags,
    image: { secure_url, public_id },
    ownerId: req.user._id,
  });

  return res.status(201).json({ msg: "Restaurant created successfully", restaurant });
});

// 2. Update Restaurant
export const updateRestaurant = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  const restaurant = await restaurantModel.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!restaurant) {
    return next(new Error("Restaurant not found", { cause: 404 }));
  }

  // تأكيد إن اليوزر هو صاحب المطعم أو admin
  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("You are not authorized to update this restaurant", { cause: 403 }));
  }

  // رفع صورة جديدة
  if (req.file) {
    if (restaurant.image?.public_id) {
      await cloudinary.uploader.destroy(restaurant.image.public_id);
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "wadiny/restaurants",
    });
    updateData.image = { secure_url: result.secure_url, public_id: result.public_id };
  }

  // معالجة الـ JSON fields
  if (updateData.address && typeof updateData.address === "string") {
    updateData.address = JSON.parse(updateData.address);
  }
  if (updateData.hours && typeof updateData.hours === "string") {
    updateData.hours = JSON.parse(updateData.hours);
  }
  if (updateData.tags && typeof updateData.tags === "string") {
    updateData.tags = JSON.parse(updateData.tags);
  }
  if (updateData.cuisine && typeof updateData.cuisine === "string") {
    updateData.cuisine = JSON.parse(updateData.cuisine);
  }

  const updatedRestaurant = await restaurantModel.findByIdAndUpdate(id, updateData, { new: true });
  return res.status(200).json({ msg: "Restaurant updated successfully", restaurant: updatedRestaurant });
});

// 3. Delete Restaurant (Soft Delete)
export const deleteRestaurant = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await restaurantModel.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!restaurant) {
    return next(new Error("Restaurant not found", { cause: 404 }));
  }

  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("You are not authorized to delete this restaurant", { cause: 403 }));
  }

  await restaurantModel.findByIdAndUpdate(id, { isDeleted: true });
  return res.status(200).json({ msg: "Restaurant deleted successfully" });
});

// 4. Get All Restaurants (with filters)
export const getRestaurants = asyncHandler(async (req, res, next) => {

  const {
  category,
  search,
  minRating,
  sort,
  page = 1,
  limit = 100
  } = req.query;
  
  
  
  let filter = {
  isDeleted: { $ne: true }
  };
  
  
  
  if(category)
  filter.category = category;
  
  
  
  if(minRating)
  filter.avgRating = {
  $gte:Number(minRating)
  };
  
  
  
  if(search){
  
  filter.$or = [
  
  {
  name:{
  $regex:search,
  $options:"i"
  }
  },
  
  {
  location:{
  $regex:search,
  $options:"i"
  }
  },
  
  {
  tags:{
  $in:[new RegExp(search,"i")]
  }
  }
  
  ];
  
  }
  
  
  
  let sortOption = {};
  
  if(sort==="rating")
  sortOption.avgRating=-1;
  
  else if(sort==="newest")
  sortOption.createdAt=-1;
  
  else if(sort==="name")
  sortOption.name=1;
  
  
  
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 100;
  
  const skip = (pageNum-1)*limitNum;
  
  
  
  const restaurants = await restaurantModel
  .find(filter)
  .sort(sortOption)
  .skip(skip)
  .limit(limitNum)
  .populate("ownerId","name email");
  
  
  
  const total = await restaurantModel.countDocuments(filter);
  
  
  
  return res.status(200).json({
  
  msg:"done",
  
  restaurants,
  
  pagination:{
  total,
  page:pageNum,
  limit:limitNum,
  pages:Math.ceil(total/limitNum)
  }
  
  });
  
  });

// 5. Get Single Restaurant
export const getRestaurantById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const restaurant = await restaurantModel
    .findOne({ _id: id, isDeleted: { $ne: true } })
    .populate("ownerId", "name email");

  if (!restaurant) {
    return next(new Error("Restaurant not found", { cause: 404 }));
  }

  // جلب العروض النشطة للمطعم
  const activeOffers = await offerModel.find({
    restaurantId: id,
    isActive: true,
    validUntil: { $gt: new Date() },
  }).limit(5);

  return res.status(200).json({ 
    msg: "done", 
    restaurant,
    activeOffers: activeOffers.length,
    offers: activeOffers
  });
});

// 6. Get My Restaurants (لصاحب المطعم — يمكن امتلاك أكثر من مطعم)
export const getMyRestaurant = asyncHandler(async (req, res, next) => {
  const restaurants = await restaurantModel.find({
    ownerId: req.user._id,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  return res.status(200).json({ msg: "done", restaurants });
});

// ==================== Offers CRUD ====================

// 7. Add Offer to Restaurant (لصاحب المطعم أو الادمن بس)
export const addOffer = asyncHandler(async (req, res, next) => {
  const { restaurantId, title, description, discount, validUntil, maxUses } = req.body;

  // تأكيد إن اليوزر عنده role restaurant أو admin
  if (req.user.role !== "restaurant" && req.user.role !== "admin") {
    return next(new Error("You must be a restaurant owner or admin to add offers", { cause: 403 }));
  }

  const restaurant = await restaurantModel.findOne({ _id: restaurantId, isDeleted: { $ne: true } });
  if (!restaurant) {
    return next(new Error("Restaurant not found", { cause: 404 }));
  }

  // صاحب المطعم بس أو الادمن يقدر يضيف عروض للمطعم ده
  if (restaurant.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("Only restaurant owner or admin can add offers to this restaurant", { cause: 403 }));
  }

  // رفع صورة العرض
  let secure_url = null;
  let public_id = null;
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "wadiny/offers",
    });
    secure_url = result.secure_url;
    public_id = result.public_id;
  }

  // توليد كود مميز للعرض
  const code = `${restaurant.name.replace(/\s/g, "").toUpperCase()}${Date.now()}`;

  const offer = await offerModel.create({
    title,
    description,
    discount,
    code,
    image: { secure_url, public_id },
    restaurantId,
    createdBy: req.user._id,
    createdByRole: req.user.role === "restaurant" ? "restaurant" : "admin",
    validUntil: new Date(validUntil),
    maxUses: maxUses || null,
  });

  return res.status(201).json({ msg: "Offer added successfully", offer });
});

// 8. Get Offers (للجميع)
export const getOffers = asyncHandler(async (req, res, next) => {
  const { restaurantId, isActive, sort, page, limit } = req.query;

  let filter = {};
  if (restaurantId) filter.restaurantId = restaurantId;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  
  // فقط العروض اللي لسه سارية
  if (filter.isActive !== false) {
    filter.validUntil = { $gt: new Date() };
  }

  let sortOption = {};
  if (sort === "newest") sortOption.createdAt = -1;
  else if (sort === "expiring") sortOption.validUntil = 1;
  else if (sort === "popular") sortOption.usedCount = -1;
  else sortOption.createdAt = -1; // default

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const offers = await offerModel
    .find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("restaurantId", "name location image")
    .populate("createdBy", "name");

  const total = await offerModel.countDocuments(filter);

  return res.status(200).json({
    msg: "done",
    offers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// 9. Delete Offer (لصاحب المطعم أو الادمن بس)
export const deleteOffer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const offer = await offerModel.findById(id).populate("restaurantId");
  if (!offer) {
    return next(new Error("Offer not found", { cause: 404 }));
  }

  // صاحب المطعم أو الادمن بس اللي يمسح العرض
  if (offer.restaurantId.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new Error("You are not authorized to delete this offer", { cause: 403 }));
  }

  // حذف الصورة من Cloudinary لو موجودة
  if (offer.image?.public_id) {
    try {
      await cloudinary.uploader.destroy(offer.image.public_id);
    } catch (err) {
      console.log("Error deleting offer image:", err);
    }
  }

  await offerModel.findByIdAndDelete(id);
  return res.status(200).json({ msg: "Offer deleted successfully" });
});


// 10. Use Offer (تعديل: منع الاستخدام المتكرر لنفس المستخدم)
export const useOffer = asyncHandler(async (req, res, next) => {
    let { code } = req.body;
    const userId = req.user._id; // الـ ID بتاع اليوزر اللي باعت الـ request

    if (!code) {
        return next(new Error("Offer code is required", { cause: 400 }));
    }

    code = code.trim();

    // البحث عن العرض
    const offer = await offerModel.findOne({ code, isActive: true });
    
    if (!offer) {
        return next(new Error("Invalid or expired offer code", { cause: 404 }));
    }

    // 1. التأكد من تاريخ الصلاحية
    if (offer.validUntil < new Date()) {
        return next(new Error("This offer has expired", { cause: 400 }));
    }

    // 2. التأكد من الحد الأقصى لاستخدام العرض (العدد الكلي)
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
        return next(new Error("This offer has reached its global usage limit", { cause: 400 }));
    }

    // 3. الخطوة الأهم: التأكد إن المستخدم ده مستخدموش قبل كدة
    // بنشوف هل الـ userId موجود جوه الـ array بتاعة usersUsed
    const hasUsedBefore = offer.usersUsed.includes(userId);
    if (hasUsedBefore) {
        return next(new Error("You have already used this offer once", { cause: 400 }));
    }

    // 4. تنفيذ العملية: زيادة العدد، وإضافة المستخدم للـ Array
    offer.usedCount += 1;
    offer.usersUsed.push(userId); // تسجيل الـ ID بتاع المستخدم
    
    await offer.save();

    // Populate عشان نرجع اسم المطعم في الـ response
    await offer.populate("restaurantId", "name location");

    return res.status(200).json({
        msg: "Offer applied successfully!",
        offer: {
            discount: offer.discount,
            title: offer.title,
            restaurantName: offer.restaurantId?.name,
        },
    });
});

// 11. Get My Restaurant Offers (لصاحب المطعم يشوف عروض مطاعمه)
export const getMyRestaurantOffers = asyncHandler(async (req, res, next) => {
  const { restaurantId, isActive, sort, page, limit } = req.query;

  const ownedRestaurants = await restaurantModel.find({
    ownerId: req.user._id,
    isDeleted: { $ne: true },
  });

  if (ownedRestaurants.length === 0) {
    return next(new Error("You don't have a registered restaurant", { cause: 404 }));
  }

  let filter = {};
  if (restaurantId) {
    const restaurant = ownedRestaurants.find((r) => r._id.toString() === restaurantId);
    if (!restaurant) {
      return next(new Error("Restaurant not found or access denied", { cause: 404 }));
    }
    filter.restaurantId = restaurant._id;
  } else {
    filter.restaurantId = { $in: ownedRestaurants.map((r) => r._id) };
  }
  if (isActive !== undefined) filter.isActive = isActive === "true";

  let sortOption = {};
  if (sort === "newest") sortOption.createdAt = -1;
  else if (sort === "expiring") sortOption.validUntil = 1;
  else sortOption.createdAt = -1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const offers = await offerModel
    .find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await offerModel.countDocuments(filter);

  return res.status(200).json({
    msg: "done",
    offers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});