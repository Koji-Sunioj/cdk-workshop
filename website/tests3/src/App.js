import { createContext, useState } from "react";
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
import CreateAlbum from "./pages/CreateAlbum";
import EditAlbum from "./pages/EditAlbums";

import { verifiyToken } from "./utils/signUpApi";

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
          <Route path="/albums/:albumId" element={<Album />} />
          <Route path="/create-album" element={<AlbumForm task="create" />} />
          <Route
            path="/albums/edit/:albumId"
            element={<AlbumForm task="edit" />}
          />
          {/* <Route path="/create-album" element={<CreateAlbum />} />
          <Route path="/albums/edit/:albumId" element={<EditAlbum />} /> */}
          <Route path="/albums" element={<Albums />} />
          <Route path="/account" element={<Account />} />
          <Route path="/sign-in" element={<SignIn />} />
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
