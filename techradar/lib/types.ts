export interface User {
  id: string
  email: string
  user_type: "seller" | "customer"
}

export interface Store {
  id: string
  seller_id: string
  store_name: string
  address: string
  owner_name: string
  phone_number: string
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  category: "phone" | "laptop" | "accessories"
  name: string
  price: number
  stock: number
  created_at: string
}

export interface CustomerProfile {
  id: string
  user_id: string
  name: string
  created_at: string
}

