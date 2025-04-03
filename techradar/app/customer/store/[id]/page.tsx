"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerHeader } from "@/components/customer/customer-header"
import { Chatbot } from "@/components/customer/chatbot"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Store, Product } from "@/lib/types"
import { MapPin, Phone, ArrowLeft, Smartphone, Laptop, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function StoreDetailsPage() {
  const [customerName, setCustomerName] = useState<string>("")
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string
  const supabase = getSupabaseClient()

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

        // Fetch store details
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("id", storeId)
          .single()

        if (storeError) throw storeError

        setStore(storeData)

        // Fetch store products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", storeId)

        if (productsError) throw productsError

        setProducts(productsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase, storeId])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "phone":
        return <Smartphone className="h-5 w-5" />
      case "laptop":
        return <Laptop className="h-5 w-5" />
      case "accessories":
        return <ShoppingBag className="h-5 w-5" />
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

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col">
        <CustomerHeader customerName={customerName} />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-medium mb-2">Store not found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  The store you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/customer/dashboard">
                  <Button variant="outline">Return to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <CustomerHeader customerName={customerName} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{store.store_name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {store.address}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Owner</h3>
                    <p>{store.owner_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact</h3>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {store.phone_number}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h2 className="text-xl font-bold mb-4">Available Products</h2>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{product.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {getCategoryIcon(product.category)}
                            <span className="ml-1">
                              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge
                          variant={product.stock > 10 ? "outline" : product.stock > 0 ? "secondary" : "destructive"}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{product.price.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products available</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-4">
                    This store doesn't have any products listed yet.
                  </p>
                  <Link href="/customer/search">
                    <Button variant="outline">Search Other Stores</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  )
}

