"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SellerHeader } from "@/components/seller/seller-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Store, Product } from "@/lib/types"
import { Package, ShoppingBag, Smartphone, Laptop } from "lucide-react"

export default function SellerDashboardPage() {
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession()

        if (!session.session) {
          router.push("/seller/login")
          return
        }

        const userId = session.session.user.id

        // Fetch store data
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("seller_id", userId)
          .single()

        if (storeError) {
          if (storeError.code === "PGRST116") {
            // No store found, redirect to store registration
            router.push(`/seller/store?id=${userId}`)
            return
          }
          throw storeError
        }

        setStore(storeData)

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", storeData.id)

        if (productsError) throw productsError

        setProducts(productsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SellerHeader />
        <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!store) {
    return null // Will redirect in useEffect
  }

  // Count products by category
  const phoneCount = products.filter((p) => p.category === "phone").length
  const laptopCount = products.filter((p) => p.category === "laptop").length
  const accessoriesCount = products.filter((p) => p.category === "accessories").length

  return (
    <div className="min-h-screen flex flex-col">
      <SellerHeader storeName={store.store_name} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Store Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{products.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Phones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{phoneCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Laptops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Laptop className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{laptopCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Accessories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-2xl font-bold">{accessoriesCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Your store details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Store Name</dt>
                  <dd className="text-base">{store.store_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="text-base">{store.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Owner</dt>
                  <dd className="text-base">{store.owner_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact</dt>
                  <dd className="text-base">{store.phone_number}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Your latest added products</CardDescription>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <ul className="space-y-4">
                  {products.slice(0, 5).map((product) => (
                    <li key={product.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{product.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{product.stock} in stock</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No products added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

