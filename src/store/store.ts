import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import profileReducer from "./slices/profile-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
