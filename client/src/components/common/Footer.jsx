import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaGithub, FaTwitter, FaDiscord, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-cosmic-light/50 backdrop-blur-sm border-t border-cosmic-primary/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FaRocket className="text-cosmic-accent text-2xl" />
              <span className="font-orbitron text-xl font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
                GalaxyVerse
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Your gateway to the cosmos. Explore space missions, data, and connect with fellow enthusiasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/missions" className="hover:text-cosmic-accent transition-colors">Missions</Link></li>
              <li><Link to="/space-data" className="hover:text-cosmic-accent transition-colors">Space Data</Link></li>
              <li><Link to="/solar-system" className="hover:text-cosmic-accent transition-colors">Solar System</Link></li>
              <li><Link to="/community" className="hover:text-cosmic-accent transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-cosmic-accent transition-colors">NASA APIs</a></li>
              <li><a href="https://www.spacex.com" target="_blank" rel="noopener noreferrer" className="hover:text-cosmic-accent transition-colors">SpaceX</a></li>
              <li><a href="https://www.isro.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-cosmic-accent transition-colors">ISRO</a></li>
              <li><a href="https://www.esa.int" target="_blank" rel="noopener noreferrer" className="hover:text-cosmic-accent transition-colors">ESA</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-cosmic-accent transition-colors text-2xl">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-cosmic-accent transition-colors text-2xl">
                <FaTwitter />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-cosmic-accent transition-colors text-2xl">
                <FaDiscord />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-cosmic-primary/30 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} GalaxyVerse. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 md:mt-0">
            <span>Made with</span>
            <FaHeart className="text-red-500" />
            <span>for space enthusiasts</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
