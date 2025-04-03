"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { LogOut, Menu, X } from "lucide-react"

interface SellerHeaderProps {
  storeName?: string
}

export function SellerHeader({ storeName }: SellerHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/seller/dashboard" className="text-xl font-bold">
              Techradar
            </Link>
            {storeName && <span className="ml-4 text-primary-foreground/80">Welcome, {storeName}</span>}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/seller/dashboard" className="hover:text-primary-foreground/80">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/seller/products" className="hover:text-primary-foreground/80">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/seller/profile" className="hover:text-primary-foreground/80">
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-foreground/10">
            <Link
              href="/seller/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/seller/products"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/seller/profile"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-foreground/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <Button variant="outline" className="w-full mt-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

