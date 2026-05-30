import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-stone-100 text-stone-600 pt-16 pb-8 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand & Address */}
        <div>
          <Link to="/" className="flex items-center space-x-1 mb-6">
            <span className="font-poppins font-extrabold text-2xl tracking-wider">
              <span className="text-primary">COCO</span>
              <span className="text-secondary">VEERA</span>
            </span>
          </Link>
          <p className="text-stone-500 text-xs leading-relaxed mb-6">
            Global exporters of premium quality-tested coconut substrates. Powering professional horticulture and commercial greenhouse cultivation worldwide.
          </p>
          <div className="space-y-3.5 text-xs text-stone-700">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Cocoveera Plaza, Industrial Port Zone, Cochin, India</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-primary flex-shrink-0" />
              <span>+91 484 286 9900</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <span>export@cocoveera.com</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-stone-900 font-poppins font-bold text-xs uppercase tracking-wider mb-6">
            Quick Links
          </h4>
          <ul className="space-y-3.5 text-xs">
            {['Home', 'About Us', 'Quality Control', 'Testing Procedures', 'Certifications', 'Contact Sales'].map(
              (item) => (
                <li key={item}>
                  <Link
                    to={
                      item === 'Home'
                        ? '/'
                        : item.includes('Testing') || item.includes('Quality')
                        ? '/quality-testing'
                        : item.includes('Contact')
                        ? '/contact'
                        : item.includes('Certifications')
                        ? '/'
                        : '/about'
                    }
                    className="hover:text-primary hover:translate-x-1 transition-all inline-block duration-200 font-medium"
                  >
                    {item}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Substrates / Categories */}
        <div>
          <h4 className="text-stone-900 font-poppins font-bold text-xs uppercase tracking-wider mb-6">
            Substrates
          </h4>
          <ul className="space-y-3.5 text-xs">
            {[
              'Coir Pith Blocks',
              'Grow Bags',
              'Coir Briquettes',
              'Coir Fiber Bales',
              'Custom Grow Solutions',
            ].map((item) => (
              <li key={item}>
                <Link
                  to="/products"
                  className="hover:text-primary hover:translate-x-1 transition-all inline-block duration-200 font-medium"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div>
          <h4 className="text-stone-900 font-poppins font-bold text-xs uppercase tracking-wider mb-6">
            Newsletter
          </h4>
          <p className="text-stone-500 text-xs leading-relaxed mb-4">
            Subscribe to our global substrate market updates and product release bulletins.
          </p>
          <form onSubmit={handleSubscribe} className="relative mb-6">
            <input
              type="email"
              placeholder="Enter your corporate email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-stone-300 text-stone-800 rounded-lg py-2.5 pl-4 pr-12 w-full text-xs focus:outline-none focus:border-primary transition-colors placeholder-stone-400 font-semibold"
              required
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-primary hover:bg-primary-dark p-2 rounded-lg text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          {subscribed && (
            <p className="text-[10px] text-primary font-bold animate-pulse mb-4">
              Subscription request received! Thank you.
            </p>
          )}

          {/* Social Links */}
          <div className="flex space-x-3.5">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-8 h-8 rounded-lg bg-white border border-stone-200 hover:border-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-stone-500"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-stone-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
        <p>© 2026 Cocoveera Private Limited. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Export</a>
          <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
