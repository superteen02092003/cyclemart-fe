export type UserRole = 'GUEST' | 'BUYER' | 'SELLER' | 'INSPECTOR' | 'ADMIN'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
  rating: number
  totalReviews: number
  createdAt: string
}
