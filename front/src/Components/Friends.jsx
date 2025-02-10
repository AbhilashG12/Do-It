import { useState, useEffect } from "react";
import "./Friends.css";

// eslint-disable-next-line react/prop-types
const Friends = ({ onSendRequest, loggedInUserId, onSelectFriend }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!loggedInUserId) return; 

    const fetchFriends = async () => {
      try {
        const response = await fetch(`http://localhost:8000/friends/${loggedInUserId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!loggedInUserId) return; 

    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:8000/friend-request/${loggedInUserId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch friend requests");
        }
        const data = await response.json();
        setFriendRequests(data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };
    fetchRequests();
  }, [loggedInUserId]);

  const acceptRequest = async (requestId) => {
    try {
      const response = await fetch("http://localhost:8000/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await response.json();
      alert(data.message);

      setFriendRequests(friendRequests.filter((req) => req._id !== requestId));
      setFriends((prev) => [...prev, data.newFriend]);
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleSearch = async () => {
    if (!query) return;
    try {
      const response = await fetch(`http://localhost:8000/search?query=${query}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRequest = async (userId) => {
    await onSendRequest(userId);
  };

  return (
    <div className="maindiv">
      <div className="pos">

      <h3 className="bar">Friends</h3> <br />

      <div className="searchbar">
        <input
          type="text"
          id="inpt"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search user's name"
        />
        <button onClick={handleSearch} id="btn">
          Search
        </button>
      </div>
      </div>

      <ul>
        {users.map((user) => (
          <li className="users-list" key={user._id}>
            {user.fullName} ({user.email})
            <button className="user-button" onClick={() => handleRequest(user._id)}>
              Add Friend
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h4>Pending Requests</h4>
        <ul className="frndslist">
          {friendRequests.map((request) => (
            <li className="frnds" key={request._id}>
              {request.from.fullName} ({request.from.email})
              <button className="user-button" onClick={() => acceptRequest(request._id)}>
                Accept
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>My Friends</h4>
        <ul className="frndslist">
          {friends.map((friend) => (
            <li
              className="frnd"
              key={friend._id}
              onClick={() => onSelectFriend(friend)}
              style={{ cursor: "pointer", color: "black" }}
            >
              {friend.fullName} ({friend.email})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Friends;
