import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../../State/Auth/Action";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../customer/components/Spinner/Spinner";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const jwt = localStorage.getItem("jwt");

  const { userId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (remove this in actual usage)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulating 2 seconds of loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!jwt) {
      navigate("/login");
    } else {
      dispatch(getUser(jwt));
    }
  }, [dispatch, navigate, jwt]);

  const { user, isLoading, error } = useSelector((state) => state.auth);

  const getFullName = () => {
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return "";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {loading ? (
        <Spinner /> // Show Spinner while loading
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome, {user?.firstName}!
          </h2>
          <div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700">
                Full Name:
              </label>
              <p className="text-sm text-gray-800">{getFullName()}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700">
                Email:
              </label>
              <p className="text-sm text-gray-800">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
