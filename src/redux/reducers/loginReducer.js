import {
    USER,
} from '../actions';

const INITIAL_STATE = {
    user: {
        username: '',
        room: '',
        connection: null
    }
}
export default function LoginReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case USER:
            return { ...state, user: action.payload }
        default:
            return state;
    }
}