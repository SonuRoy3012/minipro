"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function CustomerProfilePage() {
  const [name, setName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get("id")
  const supabase = getSupabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/customer/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  const validateForm = () => {
    if (!name) {
      setError("Name is required")
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

      if (!customerId) {
        throw new Error("Customer ID not found")
      }

      // Create customer profile record
      const { error: profileError } = await supabase.from("customer_profiles").insert([
        {
          user_id: customerId,
          name: name,
        },
      ])

      if (profileError) throw profileError

      router.push("/customer/dashboard")
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
          <p className="text-primary-foreground/80">Complete Your Profile</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Customer Profile</CardTitle>
            <CardDescription>Please provide your name to complete your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Profile"}
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

