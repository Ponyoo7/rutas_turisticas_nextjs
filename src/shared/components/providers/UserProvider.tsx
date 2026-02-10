'use client'

import { useEffect } from "react"

import { useUserStore } from "@/shared/stores/useUserStore"
import { User } from "@/shared/types/user"
import { useShallow } from "zustand/shallow"

interface Props {
    user: User | undefined | null
}

export const UserProvider = ({ user }: Props) => {
    const { setIsLoading, setUser } = useUserStore(
        useShallow((state) => ({
            setUser: state.setUser,
            setIsLoading: state.setIsLoading
        }))
    )

    useEffect(() => {
        if (user === undefined) return

        if (user || user === null) {
            setIsLoading(false)
        }

        setUser(user)
    }, [user])

    return (
        <></>
    )
}