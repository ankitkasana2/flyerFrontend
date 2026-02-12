"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UserMenu from "@/components/auth/user-menu"
import { Search, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useStore } from "@/stores/StoreProvider";
import { observer } from "mobx-react-lite";
// const cartCount = useCartStore((state) => state.items.length)
// assume your store exposes something like: cartStore.items

// const cartCount =7;

export const Header = observer(() => {
  const router = useRouter()
  const { authStore, cartStore, loadingStore, flyersStore } = useStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  // const cart = CartStore((s) => s.cart);



  useEffect(() => {
    // Load cart for logged-in user only
    if (authStore.user?.id) {
      cartStore.load(authStore.user.id)
    }

    // Also try to load cart if user data becomes available later
    const checkUser = setInterval(() => {
      if (authStore.user?.id) {
        cartStore.load(authStore.user.id)
        clearInterval(checkUser)
      }
    }, 1000)

    // Cleanup interval after 10 seconds
    setTimeout(() => clearInterval(checkUser), 10000)

    return () => clearInterval(checkUser)
  }, [authStore.user?.id, cartStore])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authStore.isLoggedIn) {
      authStore.handleAuthModal()
      return
    }
    if (searchQuery.trim()) {
      // Navigate to categories page with search query
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false) // Close mobile search
    }
  }

  const handleProtectedLink = (e: React.MouseEvent, href: string) => {
    if (!authStore.isLoggedIn) {
      e.preventDefault()
      authStore.handleAuthModal()
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim().length > 0) {
      const q = query.toLowerCase()
      const filtered = flyersStore.flyers
        .filter((flyer: any) =>
          (flyer.title || flyer.name || "").toLowerCase().includes(q) ||
          (flyer.category || "").toLowerCase().includes(q) ||
          (flyer.tags || []).some((tag: string) => tag.toLowerCase().includes(q))
        )
        .slice(0, 4);
      setResults(filtered);
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch flyers if needed
  useEffect(() => {
    if (flyersStore.flyers.length === 0 && !flyersStore.loading) {
      flyersStore.fetchFlyers();
    }
  }, [flyersStore]);

  const handleResultClick = (flyerId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/flyer/${flyerId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as any)
      setShowDropdown(false)
    }
  }

  // const cartCount = cartStore.count;

  // alert("Cart Count: " + JSON.stringify(cartCount));
  return (
    <header className="sticky top-0 z-[50] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-2 sm:px-4">
        <div className="flex items-center w-full justify-between h-14 md:h-16">
          {/* Logo */}

          {/* <Image src="/logo.png" height={10} alt="Logo" width={10} className="w-24 sm:w-32 md:w-36" /> */}
          {/* <Link href="/" className="flex items-center space-x-2">
            <Image src='/logo.png' alt="logo" width={10} height={1} className="w-32 h-20 object-contain block" />
          </Link> */}

          <Link
            href="/"
            className="inline-flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
          >
            <Image
              src="/logo.png"
              alt="Grodify Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </Link>




          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative search-container">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                placeholder="Search premium flyers..."
                className="pl-10 bg-zinc-900/50 border-white/5 text-white shadow-xl backdrop-blur-sm
                focus-visible:!ring-primary/20 focus-visible:border-primary/50
                transition-all duration-300"
              />
            </form>

            {/* Desktop Autocomplete Dropdown */}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-2 space-y-1">
                  {results.map((flyer: any) => (
                    <div
                      key={flyer.id}
                      onClick={() => handleResultClick(flyer.id)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      <div className="relative w-12 h-14 rounded-lg border border-white/10 overflow-hidden flex-shrink-0 shadow-lg">
                        <Image
                          src={flyer.image_url || flyer.imageUrl || "/placeholder.svg"}
                          alt={flyer.title || flyer.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                          {flyer.title || flyer.name}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                          {flyer.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Showing Top 4 Results</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Press Enter to See All</span>
                </div>
              </div>
            )}
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/categories"
              onClick={(e) => handleProtectedLink(e, "/categories")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Categories
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center md:space-x-5 gap-4 mr-1">
            {/* Mobile Search Icon */}
            <div
              className="sm:hidden cursor-pointer"
              onClick={() => {
                if (!authStore.isLoggedIn) {
                  authStore.handleAuthModal()
                } else {
                  setIsSearchOpen((prev) => !prev)
                }
              }}
            >
              <Search
                className={cn(
                  "h-5 w-5 transition-colors",
                  isSearchOpen ? "text-primary" : "text-foreground"
                )}
              />
            </div>

            {/* <div className="flex hover:bg-none cursor-pointer">
              <Link href={'/cart'}>
              
              <ShoppingCart className="w-5 h-5 sm:h-6 sm:w-6" />
                
    
              </Link>
            </div> */}
            <div className="relative cursor-pointer">
              <Link
                href="/cart"
                onClick={(e) => handleProtectedLink(e, "/cart")}
              >
                <ShoppingCart className="w-5 h-5 sm:h-6 sm:w-6" />
              </Link>

              {cartStore.count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartStore.count}
                </span>
              )}

              {/* Show loading indicator when cart is being loaded */}
              {cartStore.isLoading && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  ...
                </span>
              )}
            </div>
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "sm:hidden sm:bg-background/95 backdrop-blur-md border-b border-white/5 transition-all duration-500 overflow-hidden relative search-container",
          isSearchOpen ? "max-h-[500px] opacity-100 px-3 pb-3 pt-2" : "max-h-0 opacity-0"
        )}
      >
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            placeholder="Search flyers..."
            className="pl-10 bg-zinc-900/50 border-white/10 text-white shadow-md
            focus-visible:!ring-primary/20 focus-visible:border-primary/50
            transition-all duration-300"
          />
        </form>

        {/* Mobile Autocomplete Dropdown */}
        {showDropdown && results.length > 0 && isSearchOpen && (
          <div className="mt-3 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-300">
            <div className="p-2 space-y-1">
              {results.map((flyer: any) => (
                <div
                  key={flyer.id}
                  onClick={() => handleResultClick(flyer.id)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors active:scale-[0.98]"
                >
                  <div className="relative w-12 h-14 rounded-lg border border-white/10 overflow-hidden flex-shrink-0 shadow-lg">
                    <Image
                      src={flyer.image_url || flyer.imageUrl || "/placeholder.svg"}
                      alt={flyer.title || flyer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {flyer.title || flyer.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">
                      {flyer.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex justify-center">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Real-time matching</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
})
