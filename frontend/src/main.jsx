
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { initAOS } from './utils/aos-init';


function RootApp() {
  useEffect(() => {
    initAOS();
  }, []);

  // Create a router and enable the v7_relativeSplatPath future flag
  // Use a catch-all root so the internal <Routes> in App.jsx handle matching
  const router = createBrowserRouter([
    { path: '*', element: <App /> }
  ], {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    }
  });

  // NOTE: React.StrictMode is intentionally omitted here to avoid the
  // `findDOMNode` deprecation warning coming from some third-party
  // components (e.g. react-quill). Long-term solution: upgrade or replace
  // the offending library. For now this reduces noisy dev warnings.
  return (
    <RouterProvider router={router} />
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);
