import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Profile = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);

  const fetchProfile = async () => {

    try {

      const response = await API.get("/users/profile");

      setUser(response.data.user);

    }
    catch (error) {

      toast.error("Please login again");

      localStorage.removeItem("token");

      navigate("/login");

    }

  };


  useEffect(() => {

    fetchProfile();

  }, []);


  const logout = () => {

    localStorage.removeItem("token");

    toast.success("Logged out successfully");

    navigate("/login");

  };


  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 py-20">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl p-10">

          <h1 className="text-4xl font-bold text-center mb-8">

            My Profile

          </h1>


          {

            user ? (

              <>

                <div className="space-y-6">

                  <div>

                    <p className="text-gray-500">
                      User ID
                    </p>

                    <h2 className="text-xl font-semibold">

                      {user.user_id}

                    </h2>

                  </div>


                  <div>

                    <p className="text-gray-500">

                      Email

                    </p>

                    <h2 className="text-xl font-semibold">

                      {user.email}

                    </h2>

                  </div>

                </div>


                <button

                  onClick={logout}

                  className="mt-10 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg"

                >

                  Logout

                </button>

              </>

            ) : (

              <p className="text-center">

                Loading Profile...

              </p>

            )

          }

        </div>

      </div>

    </div>

  );

};

export default Profile;