import { combineReducers } from 'redux';
import LoginReducer from './reducers/loginReducer';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'

export const reducers = combineReducers({
    login: LoginReducer,
});


export const store = createStore(reducers, applyMiddleware(thunk));