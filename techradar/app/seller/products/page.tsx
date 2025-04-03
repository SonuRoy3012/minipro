"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SellerHeader } from "@/components/seller/seller-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Store, Product } from "@/lib/types"
import { Plus, Smartphone, Laptop, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function SellerProductsPage() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <SellerHeader storeName={store.store_name} />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Link href="/seller/products/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage your store's products</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price (₹)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {product.category === "phone" && <Smartphone className="h-4 w-4 mr-2" />}
                          {product.category === "laptop" && <Laptop className="h-4 w-4 mr-2" />}
                          {product.category === "accessories" && <ShoppingBag className="h-4 w-4 mr-2" />}
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Add your first product to start selling</p>
                <Link href="/seller/products/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

