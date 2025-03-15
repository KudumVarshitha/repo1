import { Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: Instagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-luxury-gold/20 bg-luxury-black">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="container relative mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center justify-between space-y-6 text-center md:flex-row md:space-y-0 md:text-left">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="bg-gradient-to-r from-luxury-gold to-yellow-400 bg-clip-text font-serif text-lg font-bold text-transparent sm:text-xl">
              EliteCoupons
            </h3>
            <p className="text-xs text-gray-400 sm:text-sm">
              Elevating your shopping experience with premium savings
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4 md:items-end">
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-full p-2 text-luxury-gold transition-colors hover:text-yellow-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 rounded-full bg-luxury-gold/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <social.icon className="h-4 w-4 relative sm:h-5 sm:w-5" />
                </motion.a>
              ))}
            </div>
            
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent sm:w-32" />
            
            <p className="font-serif text-xs text-gray-400 sm:text-sm">
              © {new Date().getFullYear()} EliteCoupons.{' '}
              <span className="text-luxury-gold">All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}