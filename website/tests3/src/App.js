import { createContext, useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Prices from "./pages/Prices";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import ForgotPw from "./pages/ForgotPw";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";

import { verifiyToken } from "./utils/api";

export const globalContext = createContext();

function App() {
  const [login, setLogin] = useState(null);

  const userName = localStorage.getItem("userName");
  const AccessToken = localStorage.getItem("AccessToken");
  const shouldChcek =
    userName !== null && AccessToken !== null && login === null;

  shouldChcek &&
    (async () => {
      const { type } = await verifiyToken({
        userName: userName,
        token: AccessToken,
      });

      if (type === "user") {
        setLogin({ userName: userName, AccessToken: AccessToken });
      } else {
        localStorage.removeItem("userName");
        localStorage.removeItem("AccessToken");
      }
    })();

  return (
    <BrowserRouter>
      <globalContext.Provider value={[login, setLogin]}>
        <NavBar />
        <br />
        <Routes>
          <Route path="/account" element={<Account />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Prices />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/forgot-password" element={<ForgotPw />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </globalContext.Provider>
    </BrowserRouter>
  );
}

export default App;
