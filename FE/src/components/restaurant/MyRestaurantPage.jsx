import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import Swal from 'sweetalert2';
import { 
  getMyRestaurantAPI, 
  updateRestaurantAPI, 
  deleteRestaurantAPI,
  createRestaurantAPI
} from  '../../services/restaurantAPI';
import LocationPickerModal from './LocationPickerModal';
import { MapPin } from 'lucide-react';

export default function MyRestaurantPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: { street: '', city: 'Alexandria', area: '', coordinates: { lat: null, lng: null } },
    category: 'restaurant',
    cuisine: [],
    hours: { open: '9:00 AM', close: '11:00 PM' },
    phone: '',
    priceRange: '$$',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const fetchMyRestaurant = async () => {
  setLoading(true);

  try {
    const result = await getMyRestaurantAPI();

    if (result.restaurant) {
      setRestaurant(result.restaurant);

      setFormData({
        name: result.restaurant.name || '',
        location: result.restaurant.location || '',
        address: {
          street: result.restaurant.address?.street || '',
          city: result.restaurant.address?.city || 'Alexandria',
          area: result.restaurant.address?.area || '',
          coordinates: result.restaurant.address?.coordinates || { lat: null, lng: null }
        },
        category: result.restaurant.category || 'restaurant',
        cuisine: result.restaurant.cuisine || [],
        hours: result.restaurant.hours || {
          open: '9:00 AM',
          close: '11:00 PM'
        },
        phone: result.restaurant.phone || '',
        priceRange: result.restaurant.priceRange || '$$',
        tags: result.restaurant.tags || []
      });
    }

  } catch (error) {

    console.error(error);

    if (error.message?.includes("don't have a registered restaurant")) {

      setRestaurant(null);

      setIsEditing(true);

    } else {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load restaurant data',
      });

    }

  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: { ...prev.hours, [field]: value }
    }));
  };

  const handleLocationPicked = async (lat, lng) => {
    setIsMapModalOpen(false);
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      console.log("📍 Nominatim Map Response:", data);
      
      const addr = data.address || {};
      
      // Combine house number and street if available
      const roadName = addr.road || addr.pedestrian || addr.street || "";
      const street = addr.house_number ? `${addr.house_number}, ${roadName}` : roadName;
      
      // Look for area in hamlet, suburb, etc.
      const rawArea = addr.hamlet || addr.suburb || addr.neighbourhood || addr.quarter || addr.borough || addr.village || addr.city_district || "";
      const city = addr.city || addr.town || addr.county || "Alexandria";
      const area = rawArea ? `${rawArea}, ${city}` : city;
      
      let locationName = "Selected Location";
      if (data.display_name) {
        // "36, Amir Al Bahr Street, Shatby, Alexandria" -> split and take first 3-4 parts
        locationName = data.display_name.split(',').slice(0, 3).join(',').trim();
      } else if (data.name && data.name !== roadName) {
        locationName = `${data.name}, ${rawArea || roadName}`;
      }
      
      setFormData(prev => ({
        ...prev,
        location: locationName,
        address: {
          ...prev.address,
          street: street,
          area: area,
          city: city,
          coordinates: { lat, lng }
        }
      }));
      
      Swal.fire({
        icon: 'success',
        title: 'Location Updated',
        text: 'Address has been automatically filled.',
        timer: 1500,
        showConfirmButton: false,
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Auto-fill Failed',
        text: 'Could not fetch address details, but coordinates were saved. Please fill address manually.',
        confirmButtonColor: '#2B86ED',
      });
      // Fallback: Just save coordinates
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, coordinates: { lat, lng } }
      }));
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addCuisine = () => {
    if (newCuisine.trim() && !formData.cuisine.includes(newCuisine.trim())) {
      setFormData(prev => ({
        ...prev,
        cuisine: [...prev.cuisine, newCuisine.trim()]
      }));
      setNewCuisine('');
    }
  };

  const removeCuisine = (cuisineToRemove) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.filter(c => c !== cuisineToRemove)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File too large',
          text: 'Image must be less than 5MB',
          confirmButtonColor: '#2B86ED',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Restaurant name is required";
    if (!formData.location?.trim()) errors.location = "Location is required";
    if (!formData.phone?.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields marked in red',
        confirmButtonColor: '#2B86ED',
      });
      return;
    }

    setFormErrors({});
    setLoading(true);
    
    try {
      const updateData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        address: {
          street: formData.address.street || "Main Street",
          city: formData.address.city || "Alexandria",
          area: formData.address.area || "",
          coordinates: formData.address.coordinates
        },
        category: formData.category,
        cuisine: Array.isArray(formData.cuisine) ? formData.cuisine : [],
        hours: {
          open: formData.hours.open || "9:00 AM",
          close: formData.hours.close || "11:00 PM"
        },
        phone: formData.phone.trim(),
        priceRange: formData.priceRange || "$$",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };
      
      if (imageFile) {
        updateData.attachment = imageFile;
      }
      
      console.log("📤 Sending restaurant data:", updateData);
      
      let savedRestaurant;
      if (restaurant && restaurant._id) {
        const result = await updateRestaurantAPI(restaurant._id, updateData);
        savedRestaurant = result.restaurant;
      } else {
        const result = await createRestaurantAPI(updateData);
        savedRestaurant = result.restaurant;
      }
      
      if (savedRestaurant) {
        setRestaurant(savedRestaurant);
        setFormData({
          name: savedRestaurant.name || '',
          location: savedRestaurant.location || '',
          address: {
            street: savedRestaurant.address?.street || '',
            city: savedRestaurant.address?.city || 'Alexandria',
            area: savedRestaurant.address?.area || '',
            coordinates: savedRestaurant.address?.coordinates || { lat: null, lng: null }
          },
          category: savedRestaurant.category || 'restaurant',
          cuisine: savedRestaurant.cuisine || [],
          hours: savedRestaurant.hours || { open: '9:00 AM', close: '11:00 PM' },
          phone: savedRestaurant.phone || '',
          priceRange: savedRestaurant.priceRange || '$$',
          tags: savedRestaurant.tags || []
        });
        if (savedRestaurant.image?.secure_url) {
          setImagePreview(savedRestaurant.image.secure_url);
        }
      }
      
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: restaurant && restaurant._id ? 'Updated!' : 'Created!',
        text: restaurant && restaurant._id ? 'Your restaurant has been updated successfully' : 'Your restaurant has been created successfully',
        confirmButtonColor: '#2B86ED',
        timer: 1500,
        showConfirmButton: false,
      });
      
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("❌ Error details:", error.data);

      let errorMsg = error.message || 'Failed to save restaurant';
      
      // Map backend JOI errors to UI
      if (error.data && error.data.error && Array.isArray(error.data.error)) {
        const backendErrors = {};
        const errorMessages = [];
        error.data.error.forEach(errObj => {
          const key = Object.keys(errObj)[0];
          const details = errObj[key][0];
          const msg = details?.message || 'Invalid field';
          
          // Map backend paths like address.street to just street if needed, or keep as is
          const fieldPath = details?.path ? details.path.join('.') : key;
          backendErrors[fieldPath] = msg;
          errorMessages.push(`${fieldPath}: ${msg}`);
        });
        setFormErrors(backendErrors);
        errorMsg = "Please correct the highlighted fields.";
      }

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: errorMsg,
        confirmButtonColor: '#2B86ED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    const result = await Swal.fire({
      title: 'Delete Restaurant?',
      text: 'This will permanently delete your restaurant and all its offers. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteRestaurantAPI(restaurant._id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your restaurant has been deleted.',
          confirmButtonColor: '#2B86ED',
        }).then(() => {
          navigate('/home');
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete restaurant',
          confirmButtonColor: '#2B86ED',
        });
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B86ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-4xl mx-auto px-4 py-6 pt-20 pb-24">
        
        <div className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
            My Restaurant
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {restaurant ? 'Manage your restaurant information' : 'Create your restaurant to start adding offers'}
          </p>
        </div>

        <div className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'}`}>
          
          {(isEditing || imagePreview) && (
            <div className="relative h-48 md:h-64">
              {imagePreview ? (
                <img src={imagePreview} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <span className="text-6xl">🏪</span>
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/50 text-white cursor-pointer hover:bg-black/70 transition">
                  📷 {imagePreview ? 'Change Image' : 'Add Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>
          )}

          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formErrors.name ? 'text-red-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter restaurant name"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                      formErrors.name ? 'border-red-500 bg-red-50/10' : (isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400')
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`block text-sm font-medium ${
                      formErrors.location ? 'text-red-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                    }`}>
                      Location *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isDarkMode ? 'text-[#2a85ec] hover:text-[#5cb8ff]' : 'text-[#2a85ec] hover:text-[#1e6ac7]'
                      }`}
                    >
                      <MapPin size={14} /> Pick on Map
                    </button>
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown, Main Street"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                      formErrors.location ? 'border-red-500 bg-red-50/10' : (isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400')
                    }`}
                  />
                  {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Street
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="Street name"
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.address.area}
                      onChange={(e) => handleAddressChange('area', e.target.value)}
                      placeholder="e.g., Smouha, Downtown"
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    formErrors.phone ? 'text-red-500' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01234567890"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                      formErrors.phone ? 'border-red-500 bg-red-50/10' : (isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400')
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="cafe" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>☕ Cafe</option>
                      <option value="restaurant" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>🍽️ Restaurant</option>
                      <option value="fastfood" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>🍔 Fast Food</option>
                      <option value="bakery" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>🥐 Bakery</option>
                      <option value="juicebar" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>🥤 Juice Bar</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Price Range
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="$" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>$ (Budget)</option>
                      <option value="$$" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>$$ (Moderate)</option>
                      <option value="$$$" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>$$$ (Expensive)</option>
                      <option value="$$$$" className={isDarkMode ? 'bg-gray-800 text-white' : ''}>$$$$ (Luxury)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Open Time
                    </label>
                    <input
                      type="text"
                      value={formData.hours.open}
                      onChange={(e) => handleHoursChange('open', e.target.value)}
                      placeholder="9:00 AM"
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Close Time
                    </label>
                    <input
                      type="text"
                      value={formData.hours.close}
                      onChange={(e) => handleHoursChange('close', e.target.value)}
                      placeholder="11:00 PM"
                      className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 rounded-xl bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cuisine Types
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCuisine}
                      onChange={(e) => setNewCuisine(e.target.value)}
                      placeholder="Add cuisine type..."
                      className={`flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && addCuisine()}
                    />
                    <button
                      onClick={addCuisine}
                      className="px-4 py-2 rounded-xl bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.cuisine.map((cuisine, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                        isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                      }`}>
                        {cuisine}
                        <button onClick={() => removeCuisine(cuisine)} className="text-red-500 hover:text-red-700">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (!restaurant) {
                        navigate('/home');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 rounded-xl font-medium bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition"
                  >
                    {restaurant ? 'Save Changes' : 'Create Restaurant'}
                  </button>
                </div>
              </div>
            ) : restaurant ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                      {restaurant?.name}
                    </h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📍 {restaurant?.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl bg-[#2B86ED] text-white text-sm hover:bg-[#1a6edb] transition"
                  >
                    ✏️ Edit
                  </button>
                </div>

                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Phone</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {restaurant?.phone}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Category</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {restaurant?.category}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Price Range</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {restaurant?.priceRange}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Hours</p>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {restaurant?.hours?.open} - {restaurant?.hours?.close}
                      </p>
                    </div>
                  </div>
                </div>

                {restaurant?.address && (restaurant.address.street || restaurant.address.area) && (
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Address</p>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      {restaurant.address.street && restaurant.address.street}
                      {restaurant.address.area && `, ${restaurant.address.area}`}
                      {restaurant.address.city && `, ${restaurant.address.city}`}
                    </p>
                  </div>
                )}

                {restaurant?.tags?.length > 0 && (
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {restaurant.tags.map((tag, idx) => (
                        <span key={idx} className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {restaurant?.cuisine?.length > 0 && (
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cuisine</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {restaurant.cuisine.map((cuisine, idx) => (
                        <span key={idx} className={`px-2 py-1 rounded-full text-xs ${
                          isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                        }`}>
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🏪</span>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No restaurant yet
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Create your restaurant to start adding offers
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-6 py-3 rounded-xl bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition"
                >
                  + Create Restaurant
                </button>
              </div>
            )}
          </div>
        </div>

        {restaurant && (
          <div className={`mt-6 rounded-2xl overflow-hidden border-2 border-red-500/30 ${isDarkMode ? 'bg-red-500/5' : 'bg-red-50'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                ⚠️ Danger Zone
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Once you delete your restaurant, all associated offers will be permanently removed.
              </p>
              <button
                onClick={handleDeleteRestaurant}
                className="px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete Restaurant
              </button>
            </div>
          </div>
        )}

      </div>

      {isMapModalOpen && (
        <LocationPickerModal 
          onClose={() => setIsMapModalOpen(false)}
          onConfirm={handleLocationPicked}
        />
      )}
    </div>
  );
}