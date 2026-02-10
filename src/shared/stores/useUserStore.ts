import { create } from 'zustand'
import { User } from "../types/user";

interface UserStoreProps {
    user: User | null
    isLoading: boolean
}

interface UserStore extends UserStoreProps {
    setUser: (user: User | null) => void
    setIsLoading: (isLoading: boolean) => void
}

const initialState: UserStoreProps = {
    user: null,
    isLoading: true
}

export const useUserStore = create<UserStore>((set) => ({
    ...initialState,

    setUser: (user: User | null) => set(() => ({ user })),
    setIsLoading: (isLoading: boolean) => set(() => ({ isLoading }))
}))