// --- THE NEW IMAGE-BASED ROLE CARD ---
const RoleCard = ({ isFlipped, role }) => {
  // Map roles to your exact uploaded filenames
  const roleImages = {
    'Mafia': '/mafia-card.jpg',
    'Doctor': '/doctor-card.jpg',
    'Detective': '/detective-card.jpg',
    'Sheriff': '/sheriff-card.jpg',
    'Civilian': '/civilian-card.jpg'
  };

  // Match the exact neon colors from your generated images for the 3D glow effect!
  const glowColors = { 
    'Mafia': '#ff003c',      // Neon Red
    'Doctor': '#00ff75',     // Neon Green
    'Detective': '#00d2ff',  // Neon Blue
    'Sheriff': '#f2994a',    // Neon Orange
    'Civilian': '#8e44ad'    // Neon Purple
  };

  return (
    <div className="my-6 relative w-[220px] h-[330px] [perspective:1000px] select-none touch-none">
      <div className={`relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front of Card (Unflipped) */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[#1a1a1a] border-2 border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        
        {/* Back of Card (Your Custom Images!) */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2" 
          style={{ 
            borderColor: `${glowColors[role]}40`, // Slight tinted border
            boxShadow: isFlipped ? `0px 0px 40px 5px ${glowColors[role]}66` : 'none' // Massive neon drop shadow matching the image
          }}
        >
          <img 
            src={roleImages[role] || roleImages.Civilian} 
            alt={role} 
            className="w-full h-full object-cover rounded-xl pointer-events-none"
            draggable="false"
          />
        </div>

      </div>
    </div>
  );
};