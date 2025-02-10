
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Nav.css";
import About from "./About";

const Navbar = () => {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/protected", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 401) {
          return null;
        }
        if (response.ok) {
          return response.json();
        }
        throw new Error("Unexpected error occurred");
      })
      .then((data) => {
        if (data) {
          setUser(data.user);
          console.log("User data from /protected:", data);
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching protected data:", error);
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    fetch("http://localhost:8000/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Logged out successfully");
          localStorage.removeItem("userId");
          localStorage.removeItem("fullName");
          window.location.reload();
        } else {
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };


  const handleAboutClick = () => setShowAbout(true);
  const closeAboutPopup = () => setShowAbout(false);

  

  return (
    <div className="navbar">
      <ul>
        <Link className="lis" to="/dashboard">Home</Link>
        <Link className="lis" to="/dashboard">Requests</Link>
       
        <span className="lis" onClick={handleAboutClick} style={{ cursor: "pointer" }}>
          About
        </span>
        <a 
    className="lis" 
    href="mailto:abhilashggg15@gmail.com  Hello from Do-Together.. You can mail me..." >
    Contact
       </a>
      </ul>
      <div>
        <button className="logbtn" onClick={handleLogout}>Logout</button>
      </div>

     
      {showAbout && (
        <div className="modal">
          <div className="modal-content">
          
            <span className="close" onClick={closeAboutPopup}>&times;</span>

            <About />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
