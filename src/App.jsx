// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const LandingPage = lazy(() => import("./LandingPage.jsx"));
const ModelMint3DGenerator = lazy(() => import("./ModelMint3DGenerator.jsx"));

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generator" element={<ModelMint3DGenerator />} />

          {/* optional redirects */}
          <Route path="/app" element={<Navigate to="/generator" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
