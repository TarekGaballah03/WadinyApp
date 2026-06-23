import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import Swal from 'sweetalert2';
import { 
  getMyRestaurantOffersAPI, 
  addOfferAPI, 
  deleteOfferAPI,
  getMyRestaurantAPI
} from '../../services/restaurantAPI';  // ✅改了

export default function ManageOffersPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    validUntil: '',
    maxUses: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    fetchRestaurantAndOffers();
  }, []);

  const fetchRestaurantAndOffers = async (selectedId = restaurantId) => {
    setLoading(true);
    try {
      const restaurantResult = await getMyRestaurantAPI();
      const list = restaurantResult.restaurants || (restaurantResult.restaurant ? [restaurantResult.restaurant] : []);
      setRestaurants(list);

      if (list.length === 0) {
        setRestaurantId(null);
        setOffers([]);
        return;
      }

      const activeId = selectedId && list.some(r => r._id === selectedId) ? selectedId : list[0]._id;
      setRestaurantId(activeId);

      const offersResult = await getMyRestaurantOffersAPI({ restaurantId: activeId });
      setOffers(offersResult.offers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load data',
        confirmButtonColor: '#2B86ED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = async (e) => {
    const newId = e.target.value;
    setRestaurantId(newId);
    setLoading(true);
    try {
      const offersResult = await getMyRestaurantOffersAPI({ restaurantId: newId });
      setOffers(offersResult.offers || []);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load offers',
        confirmButtonColor: '#2B86ED',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    }
  };

const handleAddOffer = async () => {
  if (!formData.title || !formData.description || !formData.discount || !formData.validUntil) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please fill in all required fields',
      confirmButtonColor: '#2B86ED',
    });
    return;
  }

  try {
    const validUntilDate = new Date(formData.validUntil);
    
    if (validUntilDate < new Date()) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date',
        text: 'Valid until date must be in the future',
        confirmButtonColor: '#2B86ED',
      });
      return;
    }

    const offerData = {
      restaurantId: restaurantId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      discount: formData.discount.trim(),
      validUntil: validUntilDate.toISOString(),
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
    };
    
    console.log("📤 Sending offer data:", offerData);
        
    if (imageFile) {
      offerData.image = imageFile;
    }

    const result = await addOfferAPI(offerData);
    
    // ✅ الكود المهم اللي ناقص - أضف هذا:
    console.log("✅ Offer created:", result);
    
    // إعادة تعيين الفورم
    setFormData({
      title: '',
      description: '',
      discount: '',
      validUntil: '',
      maxUses: ''
    });
    setImageFile(null);
    setShowAddModal(false);
    
    // إعادة تحميل العروض
    await fetchRestaurantAndOffers();
    
    // رسالة نجاح
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Offer created successfully',
      confirmButtonColor: '#2B86ED',
      timer: 1500,
      showConfirmButton: false,
    });
    
  } catch (error) {
    console.error("❌ Full error:", error);
    console.error("❌ Error data:", error.data);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Failed to add offer',
      confirmButtonColor: '#2B86ED',
    });
  }
};
  const handleDeleteOffer = async (offerId, offerTitle) => {
    const result = await Swal.fire({
      title: 'Delete Offer?',
      text: `Are you sure you want to delete "${offerTitle}"?`,
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
      try {
        await deleteOfferAPI(offerId);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Offer has been deleted.',
          confirmButtonColor: '#2B86ED',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRestaurantAndOffers();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete offer',
          confirmButtonColor: '#2B86ED',
        });
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B86ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-6xl mx-auto px-4 py-6 pt-20 pb-24">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
            Manage Offers
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Create and manage your restaurant offers
          </p>
        </div>

        {/* Restaurant selector & Add Offer */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
          {restaurants.length > 0 && (
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Restaurant
              </label>
              <select
                value={restaurantId || ''}
                onChange={handleRestaurantChange}
                className={`w-full sm:w-auto min-w-[200px] px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                {restaurants.map((r) => (
                  <option key={r._id} value={r._id} className={isDarkMode ? 'bg-gray-800 text-white' : ''}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!restaurantId}
            className="px-6 py-3 rounded-xl bg-[#2B86ED] text-white font-medium hover:bg-[#1a6edb] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Offer
          </button>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
            <span className="text-6xl mb-4 block">🏷️</span>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No offers yet. Click "Add New Offer" to create your first offer!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer) => {
              const expired = isExpired(offer.validUntil);
              return (
                <div
                  key={offer._id}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    isDarkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white shadow-md'
                  } ${expired ? 'opacity-60' : ''}`}
                >
                  {offer.image?.secure_url && (
                    <img src={offer.image.secure_url} alt={offer.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {offer.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        expired 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {expired ? 'Expired' : 'Active'}
                      </span>
                    </div>
                    
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {offer.description}
                    </p>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-[#2B86ED]' : 'text-[#2B86ED]'}`}>
                        {offer.discount}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {offer.usedCount || 0} uses
                      </span>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Valid until: {formatDate(offer.validUntil)}
                      </span>
                      <button
                        onClick={() => handleDeleteOffer(offer._id, offer.title)}
                        className="text-red-500 hover:text-red-700 transition p-1"
                        disabled={expired}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {offer.code && (
                      <div className={`mt-3 p-2 rounded-lg text-center text-xs font-mono ${
                        isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        Code: {offer.code}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Offer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className={`relative w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] ${
            isDarkMode ? 'bg-[#1a1a2e] border border-white/20' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                Add New Offer
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 20% off all drinks"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your offer..."
                  rows="3"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Discount *
                </label>
                <input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="e.g., 20%, Buy 1 Get 1 Free"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valid Until *
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Max Uses (Optional)
                </label>
                <input
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Offer Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${
                    isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOffer}
                  className="flex-1 py-3 rounded-xl font-medium bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition"
                >
                  Create Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}