import React, { useEffect, useState } from "react";
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import Avatar from "./Avatar";
import { useDispatch, useSelector } from "react-redux";
import EditUserDetails from "./EditUserDetails";
import SearchUser from "./SearchUser";
import { FiArrowUpLeft } from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa6";
import { logout } from "../redux/userSlice";

const Sidebar = () => {
  const user = useSelector((state) => state?.user);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [allUser, setAllUser] = useState([]);
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const socketConnection = useSelector((state) => state?.user?.socketConnection);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit("sidebar", user._id);
      socketConnection.on("conversation", (data) => {
        const conversationUserData = data.map((conversationUser) => ({
          ...conversationUser,
          userDetails:
            conversationUser?.receiver?._id === user?._id
              ? conversationUser.sender
              : conversationUser.receiver,
        }));
        setAllUser(conversationUserData);
      });
    }
  }, [socketConnection, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    localStorage.clear();
    setShowLogoutPopup(false); // Close popup after logout
  };

  return (
    <div className="w-[280px] h-screen bg-white border-r flex flex-col">
      {/* Sidebar Header */}
      <div className="bg-slate-100 py-5 text-slate-600 flex flex-col gap-2 px-3">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 ${
              isActive ? "bg-slate-200" : ""
            }`
          }
          to="/home"
          title="Chat"
        >
          <IoChatbubbleEllipses size={22} />
          <span className="text-base font-semibold">Chats</span>
        </NavLink>

        <button
          title="Add Friend"
          onClick={() => setOpenSearchUser(true)}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200"
        >
          <FaUserPlus size={20} />
          <span className="text-base font-semibold">Add Friend</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {allUser.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-slate-500">
            <FiArrowUpLeft size={50} />
            <p className="text-lg text-center text-slate-400">
              Explore users to start a conversation.
            </p>
          </div>
        ) : (
          allUser.map((conv) => (
            <NavLink
              to={`/home/${conv?.userDetails?._id}`}
              key={conv?._id}
              className="flex items-center gap-2 py-3 px-3 border-b border-gray-200 hover:bg-slate-100"
            >
              <Avatar
                imageUrl={conv?.userDetails?.profile_pic}
                name={conv?.userDetails?.name}
                width={40}
                height={40}
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{conv?.userDetails?.name}</h3>
                <div className="text-xs text-slate-500 flex gap-1">
                  {conv?.lastMsg?.imageUrl && (
                    <span className="flex items-center gap-1">
                      <FaImage />
                      {!conv?.lastMsg?.text && <span>Image</span>}
                    </span>
                  )}
                  {conv?.lastMsg?.videoUrl && (
                    <span className="flex items-center gap-1">
                      <FaVideo />
                      {!conv?.lastMsg?.text && <span>Video</span>}
                    </span>
                  )}
                  <p>{conv?.lastMsg?.text}</p>
                </div>
              </div>
              {conv?.unseenMsg > 0 && (
                <span className="bg-primary text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                  {conv?.unseenMsg}
                </span>
              )}
            </NavLink>
          ))
        )}
      </div>

      {/* User & Logout */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 w-full" onClick={() => setEditUserOpen(true)}>
            <Avatar width={40} height={40} name={user?.name} imageUrl={user?.profile_pic} />
            <div>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </button>
          <button
            title="Logout"
            className="p-2 rounded-md hover:bg-slate-200"
            onClick={() => setShowLogoutPopup(true)}
          >
            <BiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* Logout Popup - FIXED CLICK ISSUE */}
      {showLogoutPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative z-50">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to log out?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User & Search User */}
      {editUserOpen && <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />}
      {openSearchUser && <SearchUser onClose={() => setOpenSearchUser(false)} />}
    </div>
  );
};

export default Sidebar;
