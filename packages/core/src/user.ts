export interface User {
  name?: string
  email: string
}

export interface AuthRepository {
  getUserFromHeader(headers: Headers): Promise<User | undefined>
}
