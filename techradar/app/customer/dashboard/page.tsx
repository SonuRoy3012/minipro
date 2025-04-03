"use client"

7'\/
import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerHeader } from "@/components/customer/customer-header"
import { Chatbot } from "@/components/customer/chatbot"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Search, MapPin } from "lucide-react"
import Link from "next/link"

export default function CustomerDashboardPage() {
  const [customerName, setCustomerName] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchCustomerProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()

        if (!session.session) {
          router.push("/customer/login")
          return
        }

        const userId = session.session.user.id

        // Fetch customer profile
        const { data: profileData, error: profileError } = await supabase
          .from("customer_profiles")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (profileError) {
          if (profileError.code === "PGRST116") {
            // No profile found, redirect to profile creation
            router.push(`/customer/profile?id=${userId}`)
            return
          }
          throw profileError
        }

        setCustomerName(profileData.name)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerProfile()
  }, [router, supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader />
        <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader customerName={customerName} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, {customerName}</h1>
            <p className="text-muted-foreground">Find tech products from local stores near you</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search for Stores</CardTitle>
              <CardDescription>Enter a location to find tech stores near you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a place..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phones</CardTitle>
                <CardDescription>Find the latest smartphones</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover smartphones from various brands at local stores
                </p>
                <Link href="/customer/search?category=phone">
                  <Button variant="outline" className="w-full">
                    Browse Phones
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Laptops</CardTitle>
                <CardDescription>Explore laptop options</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Find laptops for work, gaming, and everyday use</p>
                <Link href="/customer/search?category=laptop">
                  <Button variant="outline" className="w-full">
                    Browse Laptops
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accessories</CardTitle>
                <CardDescription>Essential tech add-ons</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse accessories for your devices from local stores
                </p>
                <Link href="/customer/search?category=accessories">
                  <Button variant="outline" className="w-full">
                    Browse Accessories
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}

