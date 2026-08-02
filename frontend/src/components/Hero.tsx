import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero.png";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

        {/* Left Content */}
        <div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Multi-Agent
            <span className="text-cyan-400"> Negotiation </span>
            Simulator
          </h1>

          <p className="mt-6 text-lg text-gray-300 leading-8">
            Experience AI-powered autonomous negotiation where multiple
            intelligent agents negotiate, make decisions, exchange offers,
            and generate detailed performance reports in real time.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link
              to="/scenario"
              className="bg-cyan-400 text-black px-6 py-3 rounded-xl font-semibold hover:bg-cyan-300 transition"
            >
              🚀 Start Negotiation
            </Link>

            <Link
              to="/dashboard"
              className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition"
            >
              📊 View Dashboard
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex justify-center">
          <img
            src={heroImage}
            alt="AI Negotiation"
            className="w-full max-w-lg drop-shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Hero;