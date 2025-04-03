"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerHeader } from "@/components/customer/customer-header"
import { Chatbot } from "@/components/customer/chatbot"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Store } from "@/lib/types"
import { Search, MapPin, StoreIcon, Phone, Laptop, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function CustomerSearchPage() {
  const [customerName, setCustomerName] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseClient()

  const initialQuery = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  useEffect(() => {
    const fetchData = async () => {
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

        // Set initial search query from URL
        if (initialQuery) {
          setSearchQuery(initialQuery)
          await searchStores(initialQuery)
        } else if (category) {
          // If category is provided, fetch all stores that have products in that category
          await searchStoresByCategory(category)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase, initialQuery, category])

  const searchStores = async (query: string) => {
    try {
      setSearching(true)

      // Search for stores by address
      const { data, error } = await supabase.from("stores").select("*").ilike("address", `%${query}%`)

      if (error) throw error

      setStores(data || [])
    } catch (error) {
      console.error("Error searching stores:", error)
    } finally {
      setSearching(false)
    }
  }

  const searchStoresByCategory = async (category: string) => {
    try {
      setSearching(true)

      // Get all stores that have products in the specified category
      const { data, error } = await supabase.from("products").select("store_id").eq("category", category)

      if (error) throw error

      if (data && data.length > 0) {
        // Get unique store IDs
        const storeIds = [...new Set(data.map((item) => item.store_id))]

        // Fetch store details
        const { data: storesData, error: storesError } = await supabase.from("stores").select("*").in("id", storeIds)

        if (storesError) throw storesError

        setStores(storesData || [])
      } else {
        setStores([])
      }
    } catch (error) {
      console.error("Error searching stores by category:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      await searchStores(searchQuery)

      // Update URL with search query
      router.push(`/customer/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "phone":
        return <Phone className="h-4 w-4" />
      case "laptop":
        return <Laptop className="h-4 w-4" />
      case "accessories":
        return <ShoppingBag className="h-4 w-4" />
      default:
        return null
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
                <Button type="submit" disabled={searching}>
                  <Search className="h-4 w-4 mr-2" />
                  {searching ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              {category
                ? `Stores with ${category} products`
                : initialQuery
                  ? `Search results for "${initialQuery}"`
                  : "Search Results"}
            </h2>
            <p className="text-muted-foreground">
              {stores.length > 0
                ? `Found ${stores.length} store${stores.length > 1 ? "s" : ""}`
                : "No stores found for this search"}
            </p>
          </div>

          {stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map((store) => (
                <Card key={store.id}>
                  <CardHeader>
                    <CardTitle>{store.store_name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {store.address}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Owner: {store.owner_name}</p>
                    <p className="text-sm text-muted-foreground">Contact: {store.phone_number}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/customer/store/${store.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <StoreIcon className="h-4 w-4 mr-2" />
                        View Products
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <StoreIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No stores found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  {initialQuery
                    ? `We couldn't find any stores in "${initialQuery}". Try searching for a different location.`
                    : category
                      ? `We couldn't find any stores with ${category} products. Try a different category.`
                      : "Try searching for a location to find tech stores."}
                </p>
                <Link href="/customer/dashboard">
                  <Button variant="outline">Return to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Chatbot />
    </div>
  )
}

