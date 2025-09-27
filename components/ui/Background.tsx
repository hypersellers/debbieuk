import React from 'react';

const Plexus: React.FC = () => (
    <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
        <defs>
            <radialGradient id="plexus-fade" cx="50%" cy="100%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
        </defs>
        <g opacity="0.4">
            {/* Simplified plexus network */}
            <line x1="10%" y1="90%" x2="25%" y2="80%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="25%" y1="80%" x2="30%" y2="95%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="30%" y1="95%" x2="45%" y2="85%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="45%" y1="85%" x2="50%" y2="98%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="50%" y1="98%" x2="65%" y2="82%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="65%" y1="82%" x2="75%" y2="93%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="75%" y1="93%" x2="90%" y2="88%" stroke="url(#plexus-fade)" strokeWidth="1" />
            <line x1="10%" y1="90%" x2="30%" y2="95%" stroke="url(#plexus-fade)" strokeWidth="0.5" />
            <line x1="25%" y1="80%" x2="45%" y2="85%" stroke="url(#plexus-fade)" strokeWidth="0.5" />
            <line x1="45%" y1="85%" x2="65%" y2="82%" stroke="url(#plexus-fade)" strokeWidth="0.5" />
            <line x1="65%" y1="82%" x2="90%" y2="88%" stroke="url(#plexus-fade)" strokeWidth="0.5" />
            <circle cx="10%" cy="90%" r="3" fill="url(#plexus-fade)" />
            <circle cx="25%" cy="80%" r="2" fill="url(#plexus-fade)" />
            <circle cx="30%" cy="95%" r="3" fill="url(#plexus-fade)" />
            <circle cx="45%" cy="85%" r="2" fill="url(#plexus-fade)" />
            <circle cx="50%" cy="98%" r="3" fill="url(#plexus-fade)" />
            <circle cx="65%" cy="82%" r="2" fill="url(#plexus-fade)" />
            <circle cx="75%" cy="93%" r="3" fill="url(#plexus-fade)" />
            <circle cx="90%" cy="88%" r="2" fill="url(#plexus-fade)" />
        </g>
    </svg>
);

const Waves: React.FC = () => (
    <div className="absolute bottom-0 left-0 w-full h-1/3 z-0 pointer-events-none opacity-40 overflow-hidden">
        <svg className="w-[2880px] h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <defs>
                <linearGradient id="wave-grad-1" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#0e7490" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#081c24" stopOpacity="0" />
                </linearGradient>
                 <linearGradient id="wave-grad-2" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0d2a35" stopOpacity="0" />
                </linearGradient>
            </defs>
            <g className="animate-wave-move">
                <path fill="url(#wave-grad-1)" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,240C672,267,768,277,864,256C960,235,1056,181,1152,154.7C1248,128,1344,128,1392,128L1440,128L1440,320L0,320Z" />
                <path fill="url(#wave-grad-1)" d="M1440,224L1488,208C1536,192,1632,160,1728,165.3C1824,171,1920,213,2016,240C2112,267,2208,277,2304,256C2400,235,2496,181,2592,154.7C2688,128,2784,128,2832,128L2880,128L2880,320L1440,320Z" />
            </g>
            <g className="animate-wave-move-alt">
                <path fill="url(#wave-grad-2)" d="M0,256L60,261.3C120,267,240,277,360,256C480,235,600,181,720,176C840,171,960,213,1080,240C1200,267,1320,277,1380,282.7L1440,288L1440,320L0,320Z" />
                <path fill="url(#wave-grad-2)" d="M1440,256L1500,261.3C1560,267,1680,277,1800,256C1920,235,2040,181,2160,176C2280,171,2400,213,2520,240C2640,267,2760,277,2820,282.7L2880,288L2880,320L1440,320Z" />
            </g>
        </svg>
    </div>
);


const Background: React.FC<{ showWaves?: boolean }> = ({ showWaves = false }) => {
    return (
        <div className="fixed inset-0 w-full h-full z-[-1] bg-[#081c24]">
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #0d2a35 0%, #081c24 50%)',
                }}
            />
            <Plexus />
            {showWaves && <Waves />}
        </div>
    );
};

export default Background;
