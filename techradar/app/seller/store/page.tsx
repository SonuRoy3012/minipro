"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validatePhoneNumber } from "@/lib/utils/validation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function StoreRegistrationPage() {
  const [storeName, setStoreName] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [ownerName, setOwnerName] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sellerId = searchParams.get("id")
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/seller/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const validateForm = () => {
    if (!storeName || !address || !ownerName || !phoneNumber) {
      setError("All fields are required")
      return false
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      setError("")

      if (!sellerId) {
        throw new Error("Seller ID not found")
      }

      // Create store record
      const { error: storeError } = await supabase.from("stores").insert([
        {
          seller_id: sellerId,
          store_name: storeName,
          address: address,
          owner_name: ownerName,
          phone_number: phoneNumber,
        },
      ])

      if (storeError) throw storeError

      router.push("/seller/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Techradar</h1>
          <p className="text-primary-foreground/80">Store Registration</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Register Your Store</CardTitle>
            <CardDescription>Provide your store details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Store Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner-name">Owner Name</Label>
                <Input id="owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register Store"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Techradar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

