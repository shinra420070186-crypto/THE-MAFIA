import Galaxy from './Galaxy';
import './index.css'; // Make sure your Tailwind/base CSS is imported

export default function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#2c3e50]">
      
      {/* 1. The Interactive Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy />
      </div>

      {/* 2. The UI Overlay (CRITICAL FIX: pointer-events-none lets touches pass through) */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        
        <h1 className="text-white text-4xl font-bold mb-8">Tap Anywhere!</h1>
        
        {/* 3. The Button (CRITICAL FIX: pointer-events-auto makes it clickable again) */}
        <button className="pointer-events-auto bg-gray-100 text-black px-6 py-3 text-lg cursor-pointer rounded">
          I'm a button
        </button>

      </div>
    </div>
  );
}