// providers/ReduxProviderWrapper.tsx
"use client";

import { persistor, store } from "@/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { LoggedInCartProvider } from "./LoggedInCartProvider";





export default function ReduxProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#e7000b] border-t-transparent"></div>
          </div>
        }
        persistor={persistor}
      >
   
        <LoggedInCartProvider>{children}</LoggedInCartProvider>
      </PersistGate>
    </Provider>
  );
}
