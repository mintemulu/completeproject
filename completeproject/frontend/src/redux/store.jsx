import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";

// configureStore allows us to configure the store by combining the reducers in the reducer key.reducers are functions responsible for managing and updating the state in a React application.We can add more reducers if we have any
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  //To avoid serialization error
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
