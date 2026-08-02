import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import API from "../services/api";


const Login = () => {

    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();


        try {

            const response = await API.post(
                "/users/login",
                {
                    email,
                    password
                }
            );


            const token = response.data.access_token;


            localStorage.setItem(
                "token",
                token
            );


            toast.success(
                "Login successful"
            );


            navigate("/dashboard");


        } catch (error: any) {


            toast.error(
                error.response?.data?.detail ||
                "Login failed"
            );

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center">

            <form
                onSubmit={handleLogin}
                className="p-8 rounded-lg shadow-md w-96"
            >

                <h1 className="text-2xl font-bold mb-6">
                    Login
                </h1>


                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={
                        (e)=>setEmail(e.target.value)
                    }
                    className="border p-3 w-full mb-4"
                    required
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={
                        (e)=>setPassword(e.target.value)
                    }
                    className="border p-3 w-full mb-4"
                    required
                />


                <button
                    type="submit"
                    className="bg-black text-white p-3 w-full rounded"
                >
                    Login
                </button>


            </form>

        </div>

    );

};


export default Login;