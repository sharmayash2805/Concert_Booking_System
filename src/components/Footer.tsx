import { Music, Github, Twitter, Instagram } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30 mt-auto">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text">ConcertHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your gateway to unforgettable live music experiences.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-primary transition-colors cursor-pointer">Browse Events</li>
            <li className="hover:text-primary transition-colors cursor-pointer">My Bookings</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Help Center</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Careers</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Press</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-foreground">Follow Us</h4>
          <div className="flex gap-3">
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <div key={i} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all cursor-pointer">
                <Icon className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 mt-8 pt-6 text-center text-sm text-muted-foreground">
        © 2026 ConcertHub. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
