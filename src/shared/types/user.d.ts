export interface UserRegister {
  fullname: string
  email: string
  password: string
  image: string
}

export interface UserCredentials {
  email: string
  password: string
}

export interface User {
  id: string
  fullname: string
  email: string
  image: string
}
