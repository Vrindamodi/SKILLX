import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Loader2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Users,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { postAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Animation variants matching your Discover page
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  async function fetchMyPosts() {
    setLoading(true);
    try {
      const res = await postAPI.getMyPosts();
      const apiPosts = res.data?.data || res.data?.posts || res.data || [];
      setPosts(apiPosts);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClosePost(id) {
    try {
      await postAPI.close(id);
      setToast({ message: 'Post closed successfully.', type: 'success' });
      
      // Update local state to reflect the change immediately
      setPosts(prev => prev.filter(p => p._id !== id));
      
      // Optional: Navigate after a delay as requested
      setTimeout(() => navigate('/my-posts'), 1500);
    } catch (err) {
      setToast({ message: 'Failed to close post.', type: 'error' });
    }
  }

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) || 
    p.description?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-blue-600 px-6 py-3 shadow-xl shadow-blue-500/20"
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header & Search */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Manage Your Posts
            </h1>
            <p className="text-gray-500 text-sm">Review, edit, or close your active listings.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search your listings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none backdrop-blur-xl transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25"
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 py-20">
            <AlertCircle className="h-10 w-10 text-gray-600 mb-4" />
            <p className="text-gray-400">No matching posts found.</p>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                variants={item}
                className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6 transition-all hover:border-blue-500/30 hover:bg-white/[0.08]"
              >
                {/* Badge & Mode */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-500/20">
                    {post.category || 'Listing'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                
                <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-400">
                  {post.description}
                </p>

                {/* Metadata */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {post.location?.city || 'Remote'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {post.responses?.length || 0} Responses
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <span className="text-xl font-bold text-white">₹{post.pricing?.amount}</span>
                      <span className="text-xs text-gray-500 ml-1">/{post.pricing?.per || 'hr'}</span>
                    </div>
                    
                    <button
                      onClick={() => handleClosePost(post._id)}
                      className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <XCircle className="h-4 w-4" />
                      Close Post
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}