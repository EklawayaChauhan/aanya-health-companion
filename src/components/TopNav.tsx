import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Activity, BookOpen, User as UserIcon, Bell, Menu, X, LogOut, MessageCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/chat', label: 'Daily training', icon: Activity },
  { to: '/dashboard?tab=homework', label: 'Homework', icon: BookOpen },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  const isActive = (to: string) => location.pathname === to.split('?')[0];
  const initial = (user?.email ?? 'U')[0].toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-foreground text-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            MedTalk<span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="hover:bg-white/10 text-background hidden sm:inline-flex"
            aria-label="Chat with Aanya"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <button className="relative p-2 rounded-full hover:bg-white/10" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center hover:opacity-90">
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <UserIcon className="w-4 h-4 mr-2" /> Your profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} size="sm" className="gradient-btn">
              Sign in
            </Button>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-foreground">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                    active ? 'bg-primary/15 text-primary font-semibold' : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
