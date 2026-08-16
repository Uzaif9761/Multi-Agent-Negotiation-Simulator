import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PageWrapper from "../components/PageWrapper";
import API from "../services/api";

const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 5) {
            toast.error("Password must be at least 5 characters long");
            return;
        }

        setIsSubmitting(true);

        try {
            await API.post(
                "/users/register",
                { name, email, password }
            );

            toast.success("Registration successful");
            navigate("/login");

        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper className="flex items-center justify-center min-h-[80vh]">
            <form
                onSubmit={handleSignup}
                className="glass-panel p-10 rounded-3xl w-full max-w-md flex flex-col gap-6"
            >
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        Create Account
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Sign up to simulate complex negotiations</p>
                </div>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input w-full"
                    required
                />

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full"
                    required
                />

                <input
                    type="password"
                    placeholder="Password (min 5 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full"
                    required
                    minLength={5}
                />

                <button 
                    type="submit" 
                    className="btn-primary w-full mt-4 flex justify-center items-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Signing up...</> : "Sign Up"}
                </button>

                <div className="text-center mt-2">
                    <span className="text-slate-400 text-sm">Already have an account? </span>
                    <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </form>
        </PageWrapper>
    );
};

export default Signup;
