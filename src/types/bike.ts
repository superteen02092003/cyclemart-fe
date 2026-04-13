export type BikeCondition = 'new' | 'like_new' | 'good' | 'used' | 'needs_repair'
export type BikeCategory = 'ROAD' | 'MTB' | 'GRAVEL' | 'TOURING' | 'FIXED' | 'URBAN' | 'FOLD' | 'EBIKE' | 'OTHER'

export interface Bike {
  id: string
  title: string
  brand: string
  model: string
  year: number
  category: BikeCategory
  frameSize: number
  frameMaterial: string
  groupset?: string
  condition: BikeCondition
  price: number
  isNegotiable: boolean
  location: string
  images: string[]
  isVerified: boolean
  sellerId: string
  sellerName: string
  sellerRating: number
  createdAt: string
  description: string
}

export interface BikeFilter {
  category?: BikeCategory
  minPrice?: number
  maxPrice?: number
  brand?: string
  condition?: BikeCondition
  location?: string
  isVerified?: boolean
  keyword?: string
}
