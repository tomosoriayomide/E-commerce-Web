import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, where, addDoc, deleteDoc, doc, setLogLevel } from 'firebase/firestore';
import { ShoppingCart, Tag, Home, PlusCircle, Trash2, Loader, XCircle, Users } from 'lucide-react';

// --- Global Firebase Configuration (Mandatory Setup) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Function to handle the Firebase setup
const useFirebaseSetup = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    try {
      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase configuration is missing.");
        return;
      }
      
      // Initialize Firebase App and Services
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      // Set log level for debugging
      setLogLevel('debug'); 

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Handle Authentication
      const authenticate = async (authInstance) => {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (error) {
          console.error("Firebase Auth failed:", error);
          // Fallback to anonymous sign-in if custom token fails
          await signInAnonymously(authInstance);
        }
      };

      // Set up auth state observer
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // If the user logs out or session expires, re-authenticate or use anonymous ID
          setUserId(crypto.randomUUID()); 
        }
        setIsAuthReady(true);
      });
      
      authenticate(firebaseAuth);

      return () => unsubscribe();

    } catch (error) {
      console.error("Error setting up Firebase:", error);
      setIsAuthReady(true);
    }
  }, []);

  return { db, auth, userId, isAuthReady };
};

// --- Firestore Paths ---
// Public data for all products: /artifacts/{appId}/public/data/products
const getProductsCollectionRef = (db) => {
  return collection(db, `artifacts/${appId}/public/data/products`);
};

// User-specific data for individual listings: /artifacts/{appId}/users/{userId}/my_listings
const getUserListingsCollectionRef = (db, userId) => {
  return collection(db, `artifacts/${appId}/users/${userId}/my_listings`);
};


// --- State Management for Products ---
const productsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, all: action.payload };
    case 'SET_USER_LISTINGS':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// --- Product Fetching Hook ---
const useProducts = (db, userId, isAuthReady) => {
  const [state, dispatch] = useReducer(productsReducer, {
    all: [],
    user: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!db || !isAuthReady) {
      if (isAuthReady) dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    // 1. Fetch ALL Public Products
    const allProductsQuery = query(getProductsCollectionRef(db));
    const unsubscribeAll = onSnapshot(allProductsQuery, 
      (snapshot) => {
        const allProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({ type: 'SET_PRODUCTS', payload: allProducts });
      },
      (error) => {
        console.error("Error fetching all products:", error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load public marketplace listings.' });
      }
    );

    // 2. Fetch User-Specific Listings (only if userId is known)
    let unsubscribeUser = () => {};
    if (userId) {
        const userListingsQuery = query(getProductsCollectionRef(db), where("sellerId", "==", userId));
        
        unsubscribeUser = onSnapshot(userListingsQuery,
          (snapshot) => {
            const userListings = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            dispatch({ type: 'SET_USER_LISTINGS', payload: userListings });
            dispatch({ type: 'SET_LOADING', payload: false });
          },
          (error) => {
            console.error("Error fetching user listings:", error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load your listings.' });
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        );
    } else {
        dispatch({ type: 'SET_LOADING', payload: false });
    }

    return () => {
      unsubscribeAll();
      unsubscribeUser();
    };
  }, [db, userId, isAuthReady]);

  return state;
};

// --- Utility Components ---
const ErrorMessage = ({ message }) => (
  <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
    <XCircle className="w-5 h-5 mr-3" />
    <div>{message}</div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <Loader className="w-8 h-8 animate-spin text-green-500" />
    <span className="ml-3 text-lg text-gray-600">Loading items...</span>
  </div>
);

const SuccessToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-xl z-50 transition-opacity duration-300">
      {message}
    </div>
  );
};

// --- Main Components ---

const ProductCard = ({ product, showDelete = false, onDelete }) => {
  // Placeholder image function
  const getPlaceholderUrl = (title) => {
    const seed = title.toLowerCase().split(' ').join('');
    const colors = ['4ade80', '60a5fa', 'c4b5fd', 'fcd34d', 'f9a8d4']; // Green, Blue, Purple, Yellow, Pink
    const color = colors[seed.charCodeAt(0) % colors.length];
    return `https://placehold.co/400x300/${color}/ffffff?text=${product.name}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <img
        src={getPlaceholderUrl(product.name)}
        alt={product.name}
        className="w-full h-48 object-cover object-center"
        onError={(e) => e.target.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Image+Unavailable'}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</span>
          {showDelete ? (
            <button
              onClick={() => onDelete(product.id)}
              className="flex items-center px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition duration-150 shadow-md"
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          ) : (
            <button
              className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition duration-150 shadow-md"
              aria-label={`Buy ${product.name}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </button>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
            <Users className="inline w-3 h-3 mr-1" />
            Seller: {product.sellerId.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
};


const Marketplace = ({ allProducts, loading, error }) => (
  <div className="p-6">
    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Discover Secondhand Gems</h1>
    <p className="text-lg text-gray-600 mb-8">Browse items listed by our community and give them a second life.</p>

    {loading && <LoadingSpinner />}
    {error && <ErrorMessage message={error} />}

    {!loading && allProducts.length === 0 && (
      <div className="text-center p-10 bg-gray-50 rounded-lg">
        <Tag className="w-12 h-12 mx-auto text-green-500" />
        <h3 className="mt-2 text-xl font-semibold text-gray-900">No Listings Yet</h3>
        <p className="mt-1 text-gray-500">Be the first to list an item or check back later!</p>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {allProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);

const MyListings = ({ userListings, loading, error, db, userId }) => {
  const [toastMessage, setToastMessage] = useState(null);

  const handleDelete = useCallback(async (productId) => {
    if (!db || !userId) {
      setToastMessage("Authentication error. Cannot delete item.");
      return;
    }

    try {
      // Products are stored in the public collection by the sellerId
      const productRef = doc(getProductsCollectionRef(db), productId);
      await deleteDoc(productRef);
      setToastMessage("Listing deleted successfully!");
    } catch (e) {
      console.error("Error deleting document: ", e);
      setToastMessage("Failed to delete listing.");
    }
  }, [db, userId]);


  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">My Items for Sale</h1>
      <p className="text-lg text-gray-600 mb-8">Items listed by your ID: <span className="font-mono text-sm bg-gray-200 p-1 rounded">{userId ? userId : 'Loading...'}</span></p>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {toastMessage && <SuccessToast message={toastMessage} onClose={() => setToastMessage(null)} />}


      {!loading && userListings.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <Tag className="w-12 h-12 mx-auto text-indigo-500" />
          <h3 className="mt-2 text-xl font-semibold text-gray-900">No Active Listings</h3>
          <p className="mt-1 text-gray-500">Start selling your items by navigating to the "Sell Item" tab.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {userListings.map(product => (
          <ProductCard key={product.id} product={product} showDelete={true} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};


const SellItem = ({ db, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Clothing',
    condition: 'Good',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setToastMessage("Authentication error. Please wait for user ID to load.");
      return;
    }

    setIsLoading(true);
    setToastMessage(null);

    const newProduct = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      condition: formData.condition,
      sellerId: userId, // Link the product to the seller
      postedAt: new Date().toISOString(),
    };

    try {
      // Add the product to the public collection (since all items should be browseable)
      await addDoc(getProductsCollectionRef(db), newProduct);
      
      setToastMessage(`Successfully listed "${formData.name}" for sale!`);
      setFormData({ // Reset form
        name: '',
        description: '',
        price: '',
        category: 'Clothing',
        condition: 'Good',
      });
    } catch (e) {
      console.error("Error adding document: ", e);
      setToastMessage("Failed to list item. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Sell Your Pre-Loved Item</h1>
      <p className="text-lg text-gray-600 mb-8">Help promote reuse by listing your gently used item here.</p>
      
      {toastMessage && <SuccessToast message={toastMessage} onClose={() => setToastMessage(null)} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            placeholder="e.g., Vintage Leather Jacket, Used MacBook Pro"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            id="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
            placeholder="Describe the item, condition, size, and any flaws."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (USD)</label>
            <input
              type="number"
              name="price"
              id="price"
              required
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
              placeholder="19.99"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white"
            >
              <option value="Clothing">Clothing & Accessories</option>