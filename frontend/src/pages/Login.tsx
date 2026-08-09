import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageWrapper from "../components/PageWrapper";
import API from "../services/api";


const Login = () => {

    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();
        setIsSubmitting(true);

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
        } finally {
            setIsSubmitting(false);
        }

    };


    return (
        <PageWrapper className="flex items-center justify-center min-h-[80vh]">
        <form
            onSubmit={handleLogin}
            className="glass-panel p-10 rounded-3xl w-full max-w-md flex flex-col gap-6"
        >
            <div className="text-center mb-4">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Welcome Back
                </h1>
                <p className="text-slate-400 text-sm mt-2">Log in to manage your negotiations</p>
            </div>

            <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="glass-input w-full"
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="glass-input w-full"
                required
            />

            <button
                type="submit"
                className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
                disabled={isSubmitting}
            >
                {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Logging in...</> : "Login"}
            </button>

            <div className="text-center mt-2">
                <span className="text-slate-400 text-sm">Don't have an account? </span>
                <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Sign up
                </Link>
            </div>
        </form>
    </PageWrapper>

    );

};


export default Login;