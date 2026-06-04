/**
 * File: frontend/src/components/PageHero.jsx
 * Purpose: Reusable React UI component for the frontend.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PageHero – Shared full-width page header banner used across all public pages.
 * Bright image-forward design — very light overlay keeps the image visible.
 */
const PageHero = ({
  badge,
  title,
  titleAccent,
  subtitle,
  breadcrumbs = [],
  bgImage = '/hero-product.webp',
}) => {
  return (
    <section className="relative pt-24 pb-12 bg-white overflow-hidden">
      {/* ── RIGHT SIDE IMAGE ── */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 z-0">
        <img
          src={bgImage}
          alt="Cocoveera background"
          className="w-full h-full object-cover object-left"
        />
        {/* Blend edge to white */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white via-white/80 to-transparent hidden lg:block" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        {/* Mobile overlay */}
        <div className="absolute inset-0 bg-white/85 lg:hidden" />
      </div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 text-left">
        <div className="w-full lg:w-3/5 pr-0 lg:pr-8">

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-start gap-2 text-[11px] font-medium text-stone-500 mb-6"
          >
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="w-3 h-3" /> Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3 h-3 text-stone-300" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-primary font-semibold">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-primary transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </motion.nav>
        )}

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[11px] font-bold px-4 py-1.5 rounded-full border border-primary/20 mb-5"
          >
            {badge}
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-poppins font-extrabold text-stone-900 leading-tight"
        >
          {titleAccent ? (
            <>
              {title}{' '}
              <span className="text-primary">{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg mt-5 font-medium"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Decorative green divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-16 h-1 bg-primary rounded-full mt-8 origin-left"
        />
        </div>
      </div>
    </section>
  );
};

export default PageHero;
