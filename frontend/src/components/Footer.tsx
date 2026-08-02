const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 py-10">

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Multi-Agent
            <span className="text-cyan-400">
              {" "}Negotiation
            </span>
          </h2>

          <p className="mt-4 text-gray-400">
            AI-powered autonomous negotiation simulator
            where intelligent agents collaborate and make decisions.
          </p>
        </div>


        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2">
            <li>Home</li>
            <li>Dashboard</li>
            <li>Agents</li>
            <li>Reports</li>
          </ul>
        </div>


        {/* Features */}
        <div>
          <h3 className="text-white font-bold mb-4">
            Features
          </h3>

          <ul className="space-y-2">
            <li>AI Agents</li>
            <li>Real-Time Negotiation</li>
            <li>Analytics</li>
            <li>Reports</li>
          </ul>
        </div>


        {/* Contact */}
        <div>
          <h3 className="text-white font-bold mb-4">
            Contact
          </h3>

          <p>
            Email: support@negosim.ai
          </p>

          <p className="mt-2">
            AI Research Platform
          </p>
        </div>

      </div>


      <div className="border-t border-gray-700 mt-10 pt-5 text-center">

        <p>
          © 2026 Multi-Agent Negotiation Simulator.
          All rights reserved.
        </p>

      </div>

    </footer>
  );
};

export default Footer;