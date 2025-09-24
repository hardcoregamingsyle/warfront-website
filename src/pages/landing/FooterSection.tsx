export default function FooterSection() {
  return (
    <footer id="contact" className="bg-slate-900 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img src="/assets/Logo.png" alt="Warfront Logo" className="h-12 w-auto" />
            </div>
            <p className="text-slate-400">The ultimate military strategy card game experience.</p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Game</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Download</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Requirements</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Release Notes</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Community</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="https://discord.gg/BjH5NSWYGM" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="https://www.youtube.com/channel/UCAoKv9QSWtPZkxGA97kVfvw?subscribe" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">YouTube</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61579598579273" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Forums</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tournaments</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bug Reports</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Warfront. All rights reserved. Built for tactical supremacy.</p>
        </div>
      </div>
    </footer>
  );
}
