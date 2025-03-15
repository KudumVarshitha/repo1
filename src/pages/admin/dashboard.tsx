import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Eye, EyeOff, Plus, Trash2, History, Menu, LogOut, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  id: string;
  code: string;
  status: string;
  claimed_by: string | null;
  claimed_at: string | null;
  expires_at: string;
  created_at: string;
}

interface Claim {
  id: string;
  ip_address: string;
  session_id: string;
  created_at: string;
  coupon: Coupon;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function AdminDashboardPage() {
  const { signOut } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaims, setShowClaims] = useState(false);
  const [expiryDays, setExpiryDays] = useState(7);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCoupons(), loadClaims()]);
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
      console.error('Error loading coupons:', error);
    }
  };

  const loadClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          coupon:coupons (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data);
    } catch (error) {
      toast.error('Failed to load claims');
      console.error('Error loading claims:', error);
    }
  };

  const addCoupon = async () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expiryDays);

    try {
      const { error } = await supabase.from('coupons').insert({
        code,
        expires_at: expires_at.toISOString(),
      });

      if (error) throw error;

      toast.success('Coupon added successfully');
      loadCoupons();
    } catch (error) {
      toast.error('Failed to add coupon');
      console.error('Error adding coupon:', error);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const newStatus = coupon.status === 'available' ? 'disabled' : 'available';
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ status: newStatus })
        .eq('id', coupon.id);

      if (error) throw error;

      toast.success(`Coupon ${newStatus === 'available' ? 'enabled' : 'disabled'}`);
      loadCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
      console.error('Error updating coupon status:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);

      if (error) throw error;

      toast.success('Coupon deleted successfully');
      loadCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
      console.error('Error deleting coupon:', error);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-20 sm:pt-24">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-full items-center justify-between md:w-auto">
              <h1 className="bg-gradient-to-r from-luxury-gold to-yellow-400 bg-clip-text font-serif text-3xl font-bold text-transparent md:text-4xl">
                Admin Dashboard
              </h1>
              
              {/* Mobile Menu Button */}
              <button
                className="rounded-lg border border-luxury-gold/20 p-2 text-luxury-gold transition-colors hover:bg-luxury-gold/10 md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Actions Menu */}
            <AnimatePresence>
              <motion.div
                initial={menuOpen ? { opacity: 0, height: 0 } : false}
                animate={menuOpen ? { opacity: 1, height: 'auto' } : false}
                exit={{ opacity: 0, height: 0 }}
                className={`w-full space-y-4 md:w-auto md:space-y-0 md:space-x-4 ${
                  menuOpen ? 'flex flex-col' : 'hidden md:flex md:flex-row md:items-center'
                }`}
              >
                <button
                  onClick={() => setShowClaims(!showClaims)}
                  className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-luxury-gold bg-luxury-gold/10 px-6 text-luxury-gold transition-all hover:bg-luxury-gold/20 md:w-auto"
                >
                  {showClaims ? (
                    <>
                      <Eye className="mr-2 h-5 w-5" />
                      Show Coupons
                    </>
                  ) : (
                    <>
                      <History className="mr-2 h-5 w-5" />
                      Show Claims
                    </>
                  )}
                </button>

                {!showClaims && (
                  <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="expiryDays"
                        className="whitespace-nowrap text-sm font-medium text-gray-300"
                      >
                        Expiry Days:
                      </label>
                      <input
                        id="expiryDays"
                        type="number"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                        className="h-12 w-24 rounded-lg border border-luxury-gold/20 bg-black/50 px-3 text-white backdrop-blur-sm transition-all focus:border-luxury-gold focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
                        min="1"
                      />
                    </div>
                    <button
                      onClick={addCoupon}
                      className="group flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-luxury-gold to-yellow-500 px-6 text-black shadow-lg transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] md:w-auto"
                    >
                      <Plus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                      Add Coupon
                    </button>
                  </div>
                )}

                <button
                  onClick={() => signOut()}
                  className="flex h-12 w-full items-center justify-center rounded-lg border-2 border-red-500/30 bg-red-500/10 px-6 text-red-400 transition-all hover:bg-red-500/20 md:w-auto"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-luxury-gold border-t-transparent" />
          </div>
        ) : showClaims ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="overflow-hidden rounded-lg border border-luxury-gold/20 bg-black/50 backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-luxury-gold/20">
                <thead className="bg-luxury-gold/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Session ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Coupon Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Claimed At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-gold/20">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="transition-colors hover:bg-luxury-gold/5">
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-300">
                        {claim.session_id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-300">
                        {claim.ip_address}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-luxury-gold">
                        {claim.coupon.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-300">
                        {format(new Date(claim.created_at), 'PPpp')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="overflow-hidden rounded-lg border border-luxury-gold/20 bg-black/50 backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-luxury-gold/20">
                <thead className="bg-luxury-gold/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Code
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Status
                    </th>
                    <th className="hidden px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold md:table-cell">
                      Claimed By
                    </th>
                    <th className="hidden px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold md:table-cell">
                      Claimed At
                    </th>
                    <th className="hidden px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-luxury-gold md:table-cell">
                      Expires At
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-luxury-gold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-gold/20">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="transition-colors hover:bg-luxury-gold/5">
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-luxury-gold">
                        {coupon.code}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            coupon.status === 'available'
                              ? 'bg-green-500/20 text-green-400'
                              : coupon.status === 'claimed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-5 text-sm text-gray-300 md:table-cell">
                        {coupon.claimed_by || '-'}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-5 text-sm text-gray-300 md:table-cell">
                        {coupon.claimed_at
                          ? format(new Date(coupon.claimed_at), 'PPpp')
                          : '-'}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-5 text-sm text-gray-300 md:table-cell">
                        {format(new Date(coupon.expires_at), 'PPpp')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-center text-sm">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="relative">
                            <button
                              onClick={() => toggleCouponStatus(coupon)}
                              onMouseEnter={() => setHoveredAction(`toggle-${coupon.id}`)}
                              onMouseLeave={() => setHoveredAction(null)}
                              className={`rounded-full p-2 transition-all duration-200 ${
                                coupon.status === 'available'
                                  ? 'text-gray-400 hover:bg-gray-500/20'
                                  : 'text-green-400 hover:bg-green-500/20'
                              }`}
                            >
                              {coupon.status === 'available' ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                            {hoveredAction === `toggle-${coupon.id}` && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white">
                                {coupon.status === 'available' ? 'Disable' : 'Enable'}
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => deleteCoupon(coupon.id)}
                              onMouseEnter={() => setHoveredAction(`delete-${coupon.id}`)}
                              onMouseLeave={() => setHoveredAction(null)}
                              className="rounded-full p-2 text-red-400 transition-all duration-200 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            {hoveredAction === `delete-${coupon.id}` && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white">
                                Delete
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}