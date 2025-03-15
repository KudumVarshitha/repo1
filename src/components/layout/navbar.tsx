import { Button } from '@/components/ui/button';
import { Menu, Star } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm" />
      <div className="container relative mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="group flex items-center space-x-3 transition-transform hover:scale-105"
          >
            <div className="relative">
              <Star className="h-8 w-8 text-luxury-gold transition-colors group-hover:text-yellow-400" />
              <div className="absolute inset-0 animate-pulse-glow opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-luxury-gold to-yellow-400 bg-clip-text font-serif text-xl font-bold text-transparent sm:text-2xl">
                EliteCoupons
              </span>
              <span className="text-xs text-gray-400">Premium Savings</span>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            className="rounded-lg border border-luxury-gold/20 p-2 text-luxury-gold transition-colors hover:bg-luxury-gold/10 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <Button
              to="/admin"
              variant="outline"
              size="sm"
              className="group relative overflow-hidden"
            >
              <span className="relative z-10">Admin Panel</span>
              <div className="absolute inset-0 -z-0 translate-y-full bg-gradient-to-r from-luxury-gold to-yellow-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
            </Button>
          </div>

          {/* Mobile navigation */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-16 border-t border-luxury-gold/20 bg-black/95 p-4 backdrop-blur-md md:hidden"
              >
                <Button
                  to="/admin"
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Admin Panel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}