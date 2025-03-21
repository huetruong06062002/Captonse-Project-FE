import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import authReducer from "./features/authReducer/authSlice.js";
import sidebarReducer from "./features/sidebarMenuSlice.js";
import orderReducer from "./features/orderReducer/orderSlice.js";
import serviceReducer from "./features/serviceReducer/serviceSlice.js";


import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["sidebar", "auth"],
};

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  auth : authReducer,
  order: orderReducer ,
  service: serviceReducer, 
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);
