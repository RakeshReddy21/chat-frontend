import React, { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa"; // ✨ Importing Edit Icon
import Avatar from "./Avatar";
import uploadFile from "../helpers/uploadFile";
import Divider from "./Divider";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const EditUserDetails = ({ onClose, user }) => {
  const [data, setData] = useState({
    name: user?.name,
    profile_pic: user?.profile_pic,
  });
  const uploadPhotoRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      name: user.name,
      profile_pic: user?.profile_pic,
    }));
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadPhotoRef.current.click();
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadPhoto = await uploadFile(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadPhoto?.url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;

      const response = await axios({
        method: "post",
        url: URL,
        data: data,
        withCredentials: true,
      });

      console.log("response", response);
      toast.success(response?.data?.message);

      if (response.data.success) {
        dispatch(setUser(response.data.data));
        onClose();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-4 py-6 m-1 rounded w-full max-w-sm shadow-lg">
        <h2 className="font-semibold text-xl">Profile Details</h2>
        <p className="text-sm text-gray-600">Edit user details</p>

        <form className="grid gap-3 mt-3" onSubmit={handleSubmit}>
          {/* ✨ Name Input with Icon */}
          <div className="relative flex flex-col gap-1">
            <label htmlFor="name" className="font-medium">
              Name:
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                id="name"
                value={data.name}
                onChange={handleOnChange}
                className="w-full py-2 px-3 focus:outline-none border border-primary bg-blue-50 rounded-md text-lg"
              />
              <FaEdit className="absolute right-3 top-3 text-blue-500" />
            </div>
          </div>

          {/* ✨ Profile Picture Upload */}
          <div>
            <div className="font-medium">Photo:</div>
            <div className="my-1 flex items-center gap-4">
              <Avatar width={40} height={40} imageUrl={data?.profile_pic} name={data?.name} />
              <label htmlFor="profile_pic">
                <button
                  className="font-semibold hover:underline"
                  onClick={handleOpenUploadPhoto}
                >
                  Change Photo
                </button>
                <input
                  type="file"
                  id="profile_pic"
                  className="hidden"
                  onChange={handleUploadPhoto}
                  ref={uploadPhotoRef}
                />
              </label>
            </div>
          </div>

          <Divider />

          {/* ✨ Save & Cancel Buttons */}
          <div className="flex gap-2 w-fit ml-auto">
            <button
              onClick={onClose}
              className="border border-primary text-primary px-4 py-1 rounded hover:bg-primary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white border px-4 py-1 rounded hover:bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(EditUserDetails);
