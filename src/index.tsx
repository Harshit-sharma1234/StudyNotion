// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes';

import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";

const store = configureStore({
  reducer: rootReducer,
});

// Import your Publishable Key
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          afterSignOutUrl="/"
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#FFD60A', // StudyNotion Yellow
              colorBackground: '#161D29', // richblack-800
              colorInputBackground: '#2C333F', // richblack-700
              colorInputText: '#F1F2FF', // richblack-5
            },
            elements: {
              formButtonPrimary: 'text-richblack-900 font-bold',
            }
          }}
        >
          <App />
          <Toaster />
        </ClerkProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
