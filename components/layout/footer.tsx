import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block transition-transform duration-300 hover:scale-110">
              <Image
                src='/logo.png'
                alt="Grodify Logo"
                width={140}
                height={70}
                className="object-contain"
              />
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              The world's most premium digital flyer templates. Designed for high-end nightclubs, luxury lounges, and exclusive events worldwide.
            </p>
          </div>

          {/* Links Grid */}
          <div className="col-span-1 md:col-span-1 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-zinc-500 hover:text-primary transition-colors text-sm">Home</Link></li>
                <li><Link href="/categories" className="text-zinc-500 hover:text-primary transition-colors text-sm">Categories</Link></li>
                <li><Link href="/how-it-works" className="text-zinc-500 hover:text-primary transition-colors text-sm">How It Works</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Support</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-zinc-500 hover:text-primary transition-colors text-sm">Contact Us</Link></li>
                <li><Link href="/faq" className="text-zinc-500 hover:text-primary transition-colors text-sm">FAQ</Link></li>
                <li><Link href="/help" className="text-zinc-500 hover:text-primary transition-colors text-sm">Help Center</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-zinc-500 hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-500 hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-zinc-500 hover:text-primary transition-colors text-sm">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs tracking-wider uppercase">
            © 2024 Grodify. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-zinc-600 text-xs">Built for Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
