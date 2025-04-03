"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquareText, X, Send } from "lucide-react"

interface Message {
  role: "user" | "bot"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "bot",
    content: "Hi there! I'm your Techradar assistant. How can I help you today?",
  },
]

// Simple responses for the chatbot
const RESPONSES: Record<string, string> = {
  hello: "Hello! How can I help you with Techradar today?",
  hi: "Hi there! How can I assist you with finding tech products?",
  help: "I can help you find stores, search for products, or answer questions about Techradar. What would you like to know?",
  store:
    "You can search for stores by entering a location in the search bar on the dashboard. We'll show you all the tech stores in that area.",
  product:
    "Techradar helps you find tech products like phones, laptops, and accessories from local stores. You can search for stores and view their available products.",
  phone:
    "You can find phones from various local stores on Techradar. Just search for a location and browse the available stores.",
  laptop:
    "Looking for a laptop? Techradar can help you find local stores that sell laptops. Use the search feature to find stores near you.",
  price: "Prices for products are listed in Indian Rupees (₹). Each store sets their own prices for products.",
  contact: "If you need to contact a store, you can view their details after finding them in the search results.",
  account: "You can manage your account from the profile section. Click on 'Profile' in the navigation menu.",
  bye: "Goodbye! Feel free to come back if you have more questions.",
  thanks: "You're welcome! Is there anything else I can help you with?",
  "thank you": "You're welcome! Is there anything else I can help you with?",
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages([...messages, userMessage])

    // Generate bot response
    setTimeout(() => {
      const botMessage: Message = {
        role: "bot",
        content: generateResponse(input),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)

    setInput("")
  }

  const generateResponse = (query: string): string => {
    const normalizedQuery = query.toLowerCase().trim()

    // Check for exact matches
    for (const [key, response] of Object.entries(RESPONSES)) {
      if (normalizedQuery.includes(key)) {
        return response
      }
    }

    // Default response
    return "I'm not sure about that. Can you try asking something about finding tech products or stores?"
  }

  return (
    <>
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full h-12 w-12 p-0">
          <MessageSquareText className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 md:w-96 shadow-lg">
          <CardHeader className="p-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Techradar Assistant</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 max-h-80 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
            >
              <Input placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

