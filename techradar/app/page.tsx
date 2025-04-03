import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Smartphone, Laptop, ShoppingBag } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Techradar</h1>
          <p className="text-primary-foreground/80">Find tech products from local stores</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Welcome to Techradar</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with local tech stores and find the products you need
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Phones</h3>
              <p className="text-muted-foreground">Find the latest smartphones from local stores</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Laptop className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Laptops</h3>
              <p className="text-muted-foreground">Discover laptops for work and gaming</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">Accessories</h3>
              <p className="text-muted-foreground">Browse essential tech accessories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Customer Login</CardTitle>
                <CardDescription>Find tech products from local stores</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ShoppingBag className="h-16 w-16 text-primary" />
              </CardContent>
              <CardFooter>
                <Link href="/customer/login" className="w-full">
                  <Button className="w-full">Login as Customer</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seller Login</CardTitle>
                <CardDescription>Manage your tech store</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Laptop className="h-16 w-16 text-primary" />
              </CardContent>
              <CardFooter>
                <Link href="/seller/login" className="w-full">
                  <Button className="w-full">Login as Seller</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Techradar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

