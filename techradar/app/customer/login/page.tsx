import { AuthForm } from "@/components/auth/auth-form"

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Techradar</h1>
          <p className="text-primary-foreground/80">Customer Portal</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AuthForm userType="customer" />
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

