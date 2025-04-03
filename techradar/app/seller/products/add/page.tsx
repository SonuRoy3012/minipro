"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SellerHeader } from "@/components/seller/seller-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Store } from "@/lib/types"
import { Smartphone, Laptop, ShoppingBag } from "lucide-react"

export default function AddProductPage() {
  const [store, setStore] = useState<Store | null>(null)
  const [name, setName] = useState<string>("")
  const [category, setCategory] = useState<string>("phone")
  const [price, setPrice] = useState<string>("")
  const [stock, setStock] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchStore = async () => {
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
      } catch (error) {
        console.error("Error fetching store:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [router, supabase])

  const validateForm = () => {
    if (!name || !category || !price || !stock) {
      setError("All fields are required")
      return false
    }

    const priceValue = Number.parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Price must be a positive number")
      return false
    }

    const stockValue = Number.parseInt(stock)
    if (isNaN(stockValue) || stockValue < 0) {
      setError("Stock must be a non-negative integer")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      setError("")

      if (!store) {
        throw new Error("Store not found")
      }

      // Add product to database
      const { error: productError } = await supabase.from("products").insert([
        {
          store_id: store.id,
          category,
          name,
          price: Number.parseFloat(price),
          stock: Number.parseInt(stock),
        },
      ])

      if (productError) throw productError

      router.push("/seller/products")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Enter the details of your new product</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <RadioGroup
                    value={category}
                    onValueChange={setCategory}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                  >
                    <div>
                      <RadioGroupItem value="phone" id="phone" className="peer sr-only" />
                      <Label
                        htmlFor="phone"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Smartphone className="h-6 w-6 mb-2" />
                        Phone
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="laptop" id="laptop" className="peer sr-only" />
                      <Label
                        htmlFor="laptop"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Laptop className="h-6 w-6 mb-2" />
                        Laptop
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="accessories" id="accessories" className="peer sr-only" />
                      <Label
                        htmlFor="accessories"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <ShoppingBag className="h-6 w-6 mb-2" />
                        Accessories
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/seller/products")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

