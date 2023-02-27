import { createContext, useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import Album from "./pages/Album";
import Albums from "./pages/Albums";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import ForgotPw from "./pages/ForgotPw";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
import AlbumForm from "./pages/AlbumForm";

import { RemoveTrailingSlash } from "./utils/removeSlash";
import { verifiyToken, devAccess } from "./utils/signUpApi";

export const globalContext = createContext();

function App() {
  const [login, setLogin] = useState(null);
  const [filterToggle, setFilterToggle] = useState(false);
  const [pw, setPw] = useState("init");
  const userName = localStorage.getItem("userName");
  const AccessToken = localStorage.getItem("AccessToken");
  const shouldCheck =
    userName !== null && AccessToken !== null && login === null;

  useEffect(() => {
    shouldCheck &&
      pw === "confirmed" &&
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
    pw === "init" &&
      checkDevPw(
        window.prompt("development server. please enter the password", "")
      );
  }, [shouldCheck, pw]);

  const checkDevPw = async (prompt) => {
    const { verified } = await devAccess(prompt);
    if (verified) {
      setPw("confirmed");
    } else {
      setPw("unconfirmed");
    }
  };

  return (
    <>
      {pw === "confirmed" ? (
        <BrowserRouter>
          <globalContext.Provider value={[login, setLogin]}>
            <NavBar
              setFilterToggle={setFilterToggle}
              filterToggle={filterToggle}
            />

            <RemoveTrailingSlash />
            <Routes>
              <Route path="/albums/:albumId" element={<Album />} />
              <Route
                path="/create-album"
                element={<AlbumForm task="create" />}
              />
              <Route
                path="/albums/edit/:albumId"
                element={<AlbumForm task="edit" />}
              />

              <Route
                path="/albums"
                element={<Albums filterToggle={filterToggle} />}
              />
              <Route path="/account" element={<Account />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/forgot-password" element={<ForgotPw />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </globalContext.Provider>
        </BrowserRouter>
      ) : (
        <div style={{ padding: "20px" }}>
          <h1>wrong password. reload page and try again</h1>
        </div>
      )}
    </>
  );
}

export default App;
