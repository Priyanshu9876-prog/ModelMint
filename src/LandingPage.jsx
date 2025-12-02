// LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          ModelMint
        </div>
        <nav className="hidden md:flex gap-8 text-sm">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how" className="hover:text-blue-600">How it works</a>
          <a href="#faq" className="hover:text-blue-600">FAQ</a>
        </nav>
        <button
          onClick={() => navigate("/generator")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Launch App
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-28 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-5xl font-bold leading-tight">
              Turn Your Imagination into
              <span className="text-blue-600"> 3D Printable Models</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Describe any object in natural language — our AI instantly converts your idea
              into a ready-to-print STL file.
            </p>
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => navigate("/generator")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow hover:bg-blue-700 transition"
              >
                Get Started
              </button>
              <a
                href="#features"
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-lg shadow"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="flex-1">
            <img
              className="w-full drop-shadow-xl"
              src="https://cdn-icons-png.flaticon.com/512/7819/7819023.png"
              alt="3D model illustration"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why ModelMint?</h2>

          <div className="grid md:grid-cols-3 gap-10">
            <Feature
              title="AI-generated STL"
              desc="Generate detailed 3D-printable STL files from simple English prompts."
              icon="⚙️"
            />
            <Feature
              title="Instant Preview"
              desc="Visualize the generated model in 3D before downloading."
              icon="📦"
            />
            <Feature
              title="Print-Ready"
              desc="Models are optimized for all major 3D printers and slicers."
              icon="🚀"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <Step num="1" title="Describe Your Idea" text="Type any prompt — from a keychain to a mechanical spacer." />
            <Step num="2" title="AI Creates Your Model" text="Our engine converts the prompt into a clean 3D mesh." />
            <Step num="3" title="Preview & Download" text="View the 3D object in real-time and download the STL." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} ModelMint — AI-Powered 3D Model Generator  
      </footer>
    </div>
  );
}

function Feature({ title, desc, icon }) {
  return (
    <div className="p-6 border rounded-xl shadow-sm text-center hover:shadow-lg transition bg-white">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="font-semibold text-lg">{title}</div>
      <p className="text-gray-600 mt-2 text-sm">{desc}</p>
    </div>
  );
}

function Step({ num, title, text }) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-blue-600 mb-4">{num}</div>
      <div className="text-lg font-semibold">{title}</div>
      <p className="text-gray-600 mt-2">{text}</p>
    </div>
  );
}
