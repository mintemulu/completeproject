import { useEffect } from "react";
import { makeGETrequest } from "../../utils/api";
import { login, logout } from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { isTokenExpired } from "../../utils/isTokenExpired";
import { jwtDecode } from "jwt-decode";
import "./Header.css";

import { Link } from "react-router-dom";

const Header = () => {
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.user);
  // console.log(userSelector);

  useEffect(() => {
    // We want to perform this check below by sending the token back to backend with JWT so the backend checks if this user is logged in, remember we store data like idnumber,phone,email,username in redux but redux loses data when page reloads so we need to set these back when page reloads. Remember when we sign in, we only set the username, because if we sign in as admin we don't want to store all admin data in redux so we do the check here in headers.js because header exists on each page so this is the best place to perform if user logged in when page reloads.Also notice the dependency array takes dispatch function and username,because depending on those two,if they change, useEffect runs again.
    if (localStorage.getItem("token")) {
      console.log(333);
      const checkIfLoggedIn = async () => {
        const res = await makeGETrequest(
          "http://localhost:5000/users/checkifloggedin",
          localStorage.getItem("token")
        );
        console.log(res);

        // Remember,we ONLY want to show the username that is admin for admin, we don't want to display any other information for admin such as idnumber,phone,email
        if (res.status === 200 && res.admin === true) {
          dispatch(
            login({
              username: "admin",
              admin: res.admin,
              tokenexpiration: jwtDecode(localStorage.getItem("token")).exp,
            })
          );
        }

        if (res.status === 200 && res.doctor === true) {
          dispatch(
            login({
              idnumber: res.idnumber,
              phone: res.phone,
              email: res.email,
              username: res.username,
              doctor: res.doctor,
              tokenexpiration: jwtDecode(localStorage.getItem("token")).exp,
            })
          );

          // Convert base64 string to data URL and store in local storage, remember we don't want to store big files in localstorage since it allows to store data up to 5MB but we set the profile image limit to only 1MB so it is okay
          const dataUrl = `data:image/jpeg;base64,${res.image}`;
          localStorage.setItem("image", dataUrl);
        }
      };

      checkIfLoggedIn();
    }
  }, [dispatch, userSelector.username]);

  function removeLocalStorageAndRedux() {
    // This will clear all localstorage data
    localStorage.clear();
    // We need to clear the redux store too
    dispatch(logout());
  }

  // Every time, user clicks on a link,we take the JWT from local storage and check if exp in JWT is expired,if it did then clear redux store and the local storage
  function checkIfTokenExpired() {
    if (isTokenExpired(localStorage.getItem("token"))) {
      removeLocalStorageAndRedux();
    }
  }

  return (
    <header className="header">
      <nav className="navbar">
        {/* Make sure logo.svg is inside the public folder */}
        <img src="/logo.svg" className="App-logo" alt="logo" />
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" onClick={checkIfTokenExpired}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" onClick={checkIfTokenExpired}>
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/searchpatient" onClick={checkIfTokenExpired}>
              Search
            </Link>
          </li>

          {userSelector.username && (
            <li className="nav-item">
              <Link to="/profile" onClick={checkIfTokenExpired}>
                Profile
              </Link>
            </li>
          )}

          {userSelector.username ? (
            <li className="nav-item">
              <Link to="/" onClick={removeLocalStorageAndRedux}>
                SignOut
              </Link>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/signin">Signin</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
