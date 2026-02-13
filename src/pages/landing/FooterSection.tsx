import { memo } from "react";

const footerLinks = {
  game: [
    { label: "Download", href: "#" },
    { label: "System Requirements", href: "#" },
    { label: "Release Notes", href: "#" },
  ],
  community: [
    { label: "Discord", href: "https://discord.gg/BjH5NSWYGM", external: true },
    { label: "YouTube", href: "https://www.youtube.com/channel/UCAoKv9QSWtPZkxGA97kVfvw?subscribe", external: true },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61579598579273", external: true },
    { label: "Forums", href: "#" },
    { label: "Tournaments", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Bug Reports", href: "#" },
  ],
};

export default memo(function FooterSection() {
  return (
    <footer id="contact" className="bg-slate-900 border-t border-slate-700 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="mb-4">
              <img src="/assets/Logo.png" alt="Warfront Logo" className="h-10 sm:h-12 w-auto" />
            </div>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">The ultimate military strategy card game experience.</p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Game</h3>
            <ul className="space-y-2 text-slate-400">
              {footerLinks.game.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Community</h3>
            <ul className="space-y-2 text-slate-400">
              {footerLinks.community.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-slate-400">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Warfront. All rights reserved. Built for tactical supremacy.</p>
        </div>
      </div>
    </footer>
  );
});