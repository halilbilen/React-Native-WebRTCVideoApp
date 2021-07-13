
export const USER = "user"


export function setUser(user) {
    console.log(user)
    return function (dispatch) {
        dispatch({
            type: USER,
            payload: user
        })
    }
}

