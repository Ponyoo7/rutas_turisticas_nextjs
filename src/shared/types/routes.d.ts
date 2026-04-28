import { OSMElement } from './locations'

export type RouteImageReviewStatus = 'approved' | 'pending' | 'rejected'

export interface RouteImageInput {
  id?: number
  image: string
  selectedForCover: boolean
}

export interface RouteImage {
  id: number
  image: string
  reviewStatus: RouteImageReviewStatus
  selectedForCover: boolean
  createdAt: string
}

export interface CreateRoute {
  name: string
  description: string
  places: OSMElement[]
  image?: string
  contributedImages?: RouteImageInput[]
}

export interface UpdateRoute {
  id: number
  name: string
  description: string
  places: OSMElement[]
  contributedImages?: RouteImageInput[]
}

export interface Route {
  id: number
  user_id: string
  name: string
  description: string
  places: OSMElement[]
  image: string
  contributedImages: RouteImage[]
  featured: boolean
}
