import { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ isAuthOpen, setIsAuthOpen }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
