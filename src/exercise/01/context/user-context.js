import React from "react";
import {useAuth} from "../../../auth-context";

const UserContext = React.createContext()
UserContext.displayName = 'UserContext'

// Reducer used by Context underneath
function userReducer(state, action) {
    switch (action.type) {
        case 'start update': {
            return {
                ...state,
                user: {...state.user, ...action.updates},
                status: 'pending',
                storedUser: state.user,
            }
        }
        case 'finish update': {
            return {
                ...state,
                user: action.updatedUser,
                status: 'resolved',
                storedUser: null,
                error: null,
            }
        }
        case 'fail update': {
            return {
                ...state,
                status: 'rejected',
                error: action.error,
                user: state.storedUser,
                storedUser: null,
            }
        }
        case 'reset': {
            return {
                ...state,
                status: null,
                error: null,
            }
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

function UserProvider({children}) {
    const {user} = useAuth()
    const [state, dispatch] = React.useReducer(userReducer, {
        status: null,
        error: null,
        storedUser: user,
        user,
    })
    const value = [state, dispatch]
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

function useUser() {
    const context = React.useContext(UserContext)
    if (context === undefined) {
        throw new Error(`useUser must be used within a UserProvider`)
    }
    return context
}

// 🐨 add a function here called `updateUser`
// Then go down to the `handleSubmit` from `UserSettings` and put that logic in
// this function. It should accept: dispatch, user, and updates

export {UserProvider, useUser}