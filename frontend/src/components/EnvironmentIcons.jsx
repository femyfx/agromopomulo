import { memo } from 'react';

// Reusable SVG Icon wrapper with gradient background
const IconWrapper = memo(({ children, gradientId, bgFrom, bgTo, ringColor, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };
  
  return (
    <div className={`${sizeClasses[size]} drop-shadow-md`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={bgFrom}/>
            <stop offset="100%" stopColor={bgTo}/>
          </linearGradient>
          <filter id={`${gradientId}-glow`} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke={ringColor} strokeWidth="2.5" opacity="0.5" filter={`url(#${gradientId}-glow)`}/>
        {/* Main circle background */}
        <circle cx="50" cy="50" r="42" fill={`url(#${gradientId})`} stroke={ringColor} strokeWidth="1.5"/>
        {children}
      </svg>
    </div>
  );
});
IconWrapper.displayName = 'IconWrapper';

// Tree/Forest Icon - for Total Pohon, TreePine references
export const TreeIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="treeGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Tree trunk */}
    <rect x="46" y="55" width="8" height="20" fill="#8d6e63" rx="1"/>
    {/* Tree crown layers */}
    <ellipse cx="50" cy="50" rx="18" ry="15" fill="#66bb6a"/>
    <ellipse cx="50" cy="42" rx="14" ry="12" fill="#81c784"/>
    <ellipse cx="50" cy="36" rx="10" ry="9" fill="#a5d6a7"/>
    {/* Highlight */}
    <ellipse cx="45" cy="38" rx="4" ry="3" fill="#c8e6c9" opacity="0.6"/>
  </IconWrapper>
));
TreeIcon.displayName = 'TreeIcon';

// Users/Participants Icon
export const UsersIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="usersGrad" 
    bgFrom="#fff8e1" 
    bgTo="#ffecb3" 
    ringColor="#ffd54f"
    size={size}
  >
    {/* Center person */}
    <circle cx="50" cy="35" r="10" fill="#ffa726"/>
    <path d="M35 65 Q35 50 50 50 Q65 50 65 65" fill="#ffa726"/>
    {/* Left person (smaller) */}
    <circle cx="30" cy="40" r="7" fill="#ffb74d" opacity="0.8"/>
    <path d="M20 62 Q20 52 30 52 Q40 52 40 62" fill="#ffb74d" opacity="0.8"/>
    {/* Right person (smaller) */}
    <circle cx="70" cy="40" r="7" fill="#ffb74d" opacity="0.8"/>
    <path d="M60 62 Q60 52 70 52 Q80 52 80 62" fill="#ffb74d" opacity="0.8"/>
  </IconWrapper>
));
UsersIcon.displayName = 'UsersIcon';

// Building/OPD Icon
export const BuildingIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="buildingGrad" 
    bgFrom="#e3f2fd" 
    bgTo="#bbdefb" 
    ringColor="#64b5f6"
    size={size}
  >
    {/* Building body */}
    <rect x="30" y="42" width="40" height="32" fill="#42a5f5" rx="2"/>
    {/* Tower */}
    <rect x="40" y="28" width="20" height="14" fill="#1e88e5"/>
    {/* Flag pole */}
    <line x1="50" y1="28" x2="50" y2="18" stroke="#1565c0" strokeWidth="2"/>
    {/* Flag */}
    <path d="M50 18 L62 22 L50 26 Z" fill="#ef5350"/>
    {/* Windows */}
    <rect x="34" y="46" width="7" height="7" fill="#e3f2fd" rx="1"/>
    <rect x="46" y="46" width="7" height="7" fill="#e3f2fd" rx="1"/>
    <rect x="58" y="46" width="7" height="7" fill="#e3f2fd" rx="1"/>
    <rect x="34" y="58" width="7" height="7" fill="#e3f2fd" rx="1"/>
    <rect x="58" y="58" width="7" height="7" fill="#e3f2fd" rx="1"/>
    {/* Door */}
    <rect x="46" y="58" width="7" height="16" fill="#e3f2fd" rx="1"/>
  </IconWrapper>
));
BuildingIcon.displayName = 'BuildingIcon';

// Location/Map Pin Icon  
export const LocationIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="locationGrad" 
    bgFrom="#fbe9e7" 
    bgTo="#ffccbc" 
    ringColor="#ff8a65"
    size={size}
  >
    {/* Ground */}
    <ellipse cx="50" cy="72" rx="25" ry="6" fill="#8bc34a"/>
    {/* Pin body */}
    <path d="M50 25 C35 25 25 38 25 50 C25 65 50 75 50 75 C50 75 75 65 75 50 C75 38 65 25 50 25" fill="#ef5350"/>
    {/* Pin inner circle */}
    <circle cx="50" cy="45" r="12" fill="#ffcdd2"/>
    {/* Small tree inside */}
    <rect x="48" y="48" width="4" height="8" fill="#6d4c41"/>
    <ellipse cx="50" cy="42" rx="8" ry="7" fill="#66bb6a"/>
  </IconWrapper>
));
LocationIcon.displayName = 'LocationIcon';

// Leaf/Environment Icon
export const LeafIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="leafGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Main leaf */}
    <path d="M50 75 Q30 55 35 35 Q50 20 65 35 Q70 55 50 75" fill="#66bb6a" stroke="#43a047" strokeWidth="1.5"/>
    {/* Leaf vein */}
    <path d="M50 72 L50 32" stroke="#43a047" strokeWidth="2" fill="none"/>
    <path d="M50 45 Q40 40 35 35" stroke="#43a047" strokeWidth="1.5" fill="none"/>
    <path d="M50 45 Q60 40 65 35" stroke="#43a047" strokeWidth="1.5" fill="none"/>
    <path d="M50 55 Q42 52 38 48" stroke="#43a047" strokeWidth="1.5" fill="none"/>
    <path d="M50 55 Q58 52 62 48" stroke="#43a047" strokeWidth="1.5" fill="none"/>
  </IconWrapper>
));
LeafIcon.displayName = 'LeafIcon';

// Target/Goal Icon
export const TargetIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="targetGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Target rings */}
    <circle cx="50" cy="50" r="28" fill="none" stroke="#66bb6a" strokeWidth="4"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="#81c784" strokeWidth="3"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#a5d6a7" strokeWidth="2"/>
    {/* Center with seedling */}
    <circle cx="50" cy="50" r="6" fill="#4caf50"/>
    {/* Arrow hitting target */}
    <path d="M72 28 L54 46" stroke="#43a047" strokeWidth="3" strokeLinecap="round"/>
    <path d="M72 28 L65 30 L70 35 Z" fill="#43a047"/>
  </IconWrapper>
));
TargetIcon.displayName = 'TargetIcon';

// Award/Achievement Icon
export const AwardIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="awardGrad" 
    bgFrom="#fff8e1" 
    bgTo="#ffecb3" 
    ringColor="#ffd54f"
    size={size}
  >
    {/* Medal ribbon */}
    <path d="M38 25 L45 45 L50 38 L55 45 L62 25" fill="#f44336"/>
    {/* Medal circle */}
    <circle cx="50" cy="55" r="18" fill="#ffc107" stroke="#ff8f00" strokeWidth="2"/>
    {/* Star on medal */}
    <polygon points="50,42 53,51 62,51 55,57 58,66 50,61 42,66 45,57 38,51 47,51" fill="#fff8e1"/>
  </IconWrapper>
));
AwardIcon.displayName = 'AwardIcon';

// Globe/World Icon
export const GlobeIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="globeGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Globe circle */}
    <circle cx="50" cy="50" r="25" fill="#81d4fa"/>
    {/* Continent shapes */}
    <ellipse cx="45" cy="45" rx="10" ry="8" fill="#66bb6a"/>
    <ellipse cx="58" cy="52" rx="8" ry="10" fill="#66bb6a"/>
    <ellipse cx="42" cy="58" rx="6" ry="5" fill="#66bb6a"/>
    {/* Globe lines */}
    <ellipse cx="50" cy="50" rx="25" ry="10" fill="none" stroke="#4fc3f7" strokeWidth="1" opacity="0.5"/>
    <line x1="50" y1="25" x2="50" y2="75" stroke="#4fc3f7" strokeWidth="1" opacity="0.5"/>
  </IconWrapper>
));
GlobeIcon.displayName = 'GlobeIcon';

// Calendar/Agenda Icon
export const CalendarIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="calendarGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Calendar body */}
    <rect x="25" y="32" width="50" height="45" fill="#fff" stroke="#66bb6a" strokeWidth="2" rx="4"/>
    {/* Calendar header */}
    <rect x="25" y="32" width="50" height="14" fill="#66bb6a" rx="4"/>
    <rect x="25" y="40" width="50" height="6" fill="#66bb6a"/>
    {/* Calendar rings */}
    <rect x="35" y="28" width="4" height="10" fill="#43a047" rx="1"/>
    <rect x="61" y="28" width="4" height="10" fill="#43a047" rx="1"/>
    {/* Calendar dates */}
    <circle cx="35" cy="55" r="3" fill="#e8f5e9"/>
    <circle cx="50" cy="55" r="3" fill="#66bb6a"/>
    <circle cx="65" cy="55" r="3" fill="#e8f5e9"/>
    <circle cx="35" cy="68" r="3" fill="#e8f5e9"/>
    <circle cx="50" cy="68" r="3" fill="#e8f5e9"/>
    <circle cx="65" cy="68" r="3" fill="#e8f5e9"/>
  </IconWrapper>
));
CalendarIcon.displayName = 'CalendarIcon';

// News/Newspaper Icon
export const NewsIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="newsGrad" 
    bgFrom="#e3f2fd" 
    bgTo="#bbdefb" 
    ringColor="#64b5f6"
    size={size}
  >
    {/* Paper background */}
    <rect x="25" y="25" width="50" height="55" fill="#fff" stroke="#64b5f6" strokeWidth="2" rx="3"/>
    {/* Header bar */}
    <rect x="30" y="30" width="40" height="8" fill="#42a5f5" rx="1"/>
    {/* Text lines */}
    <rect x="30" y="42" width="25" height="3" fill="#90caf9" rx="1"/>
    <rect x="30" y="48" width="40" height="3" fill="#bbdefb" rx="1"/>
    <rect x="30" y="54" width="35" height="3" fill="#bbdefb" rx="1"/>
    <rect x="30" y="60" width="40" height="3" fill="#bbdefb" rx="1"/>
    {/* Small image placeholder */}
    <rect x="55" y="42" width="15" height="12" fill="#e3f2fd" stroke="#64b5f6" strokeWidth="1" rx="1"/>
    {/* Leaf decoration */}
    <ellipse cx="62" cy="72" rx="5" ry="8" fill="#66bb6a" transform="rotate(15 62 72)"/>
  </IconWrapper>
));
NewsIcon.displayName = 'NewsIcon';

// Growth/Trending Icon
export const GrowthIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="growthGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Chart bars */}
    <rect x="28" y="55" width="10" height="20" fill="#a5d6a7" rx="2"/>
    <rect x="42" y="45" width="10" height="30" fill="#81c784" rx="2"/>
    <rect x="56" y="35" width="10" height="40" fill="#66bb6a" rx="2"/>
    {/* Growth arrow */}
    <path d="M30 52 L48 40 L65 28" stroke="#43a047" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M58 25 L68 25 L68 35" stroke="#43a047" strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* Small leaf on top */}
    <ellipse cx="68" cy="22" rx="4" ry="6" fill="#4caf50"/>
  </IconWrapper>
));
GrowthIcon.displayName = 'GrowthIcon';

// Book/Education Icon
export const BookIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="bookGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Book cover */}
    <path d="M25 30 L50 25 L75 30 L75 70 L50 75 L25 70 Z" fill="#66bb6a" stroke="#43a047" strokeWidth="1.5"/>
    {/* Book spine */}
    <line x1="50" y1="25" x2="50" y2="75" stroke="#43a047" strokeWidth="2"/>
    {/* Pages */}
    <path d="M28 33 L48 29 L48 72 L28 68 Z" fill="#fff"/>
    <path d="M72 33 L52 29 L52 72 L72 68 Z" fill="#fff"/>
    {/* Text lines */}
    <line x1="32" y1="40" x2="44" y2="38" stroke="#a5d6a7" strokeWidth="2"/>
    <line x1="32" y1="48" x2="44" y2="46" stroke="#a5d6a7" strokeWidth="2"/>
    <line x1="56" y1="38" x2="68" y2="40" stroke="#a5d6a7" strokeWidth="2"/>
    <line x1="56" y1="46" x2="68" y2="48" stroke="#a5d6a7" strokeWidth="2"/>
    {/* Small plant decoration */}
    <ellipse cx="50" cy="55" rx="6" ry="10" fill="#81c784"/>
    <line x1="50" y1="65" x2="50" y2="52" stroke="#43a047" strokeWidth="1.5"/>
  </IconWrapper>
));
BookIcon.displayName = 'BookIcon';

// Gallery/Image Icon
export const GalleryIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="galleryGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Frame */}
    <rect x="25" y="30" width="50" height="40" fill="#fff" stroke="#66bb6a" strokeWidth="2" rx="3"/>
    {/* Mountains */}
    <polygon points="25,70 40,50 55,65 75,45 75,70" fill="#81c784"/>
    <polygon points="25,70 50,45 75,70" fill="#66bb6a"/>
    {/* Sun */}
    <circle cx="62" cy="42" r="8" fill="#ffc107"/>
    {/* Small tree */}
    <rect x="35" y="58" width="4" height="10" fill="#6d4c41"/>
    <ellipse cx="37" cy="55" rx="6" ry="8" fill="#4caf50"/>
  </IconWrapper>
));
GalleryIcon.displayName = 'GalleryIcon';

// Seedling/Hand Icon - for Partisipan
export const SeedlingHandIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="seedlingGrad" 
    bgFrom="#fff8e1" 
    bgTo="#ffecb3" 
    ringColor="#ffd54f"
    size={size}
  >
    {/* Cupped hands */}
    <path d="M26 56 Q22 46 28 38 Q34 34 42 42 L48 50" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M74 56 Q78 46 72 38 Q66 34 58 42 L52 50" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 56 Q36 72 50 74 Q64 72 74 56" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Soil */}
    <ellipse cx="50" cy="58" rx="16" ry="8" fill="#a1887f"/>
    {/* Plant stem */}
    <path d="M50 52 L50 30" stroke="#558b2f" strokeWidth="3" strokeLinecap="round"/>
    {/* Leaves */}
    <ellipse cx="40" cy="30" rx="10" ry="14" fill="#8bc34a" stroke="#689f38" strokeWidth="1.5" transform="rotate(-30 40 30)"/>
    <ellipse cx="60" cy="30" rx="10" ry="14" fill="#8bc34a" stroke="#689f38" strokeWidth="1.5" transform="rotate(30 60 30)"/>
  </IconWrapper>
));
SeedlingHandIcon.displayName = 'SeedlingHandIcon';

// Success/Check Icon
export const SuccessIcon = memo(({ size = 'md' }) => (
  <IconWrapper 
    gradientId="successGrad" 
    bgFrom="#e8f5e9" 
    bgTo="#c8e6c9" 
    ringColor="#81c784"
    size={size}
  >
    {/* Check circle */}
    <circle cx="50" cy="50" r="24" fill="#66bb6a"/>
    {/* Checkmark */}
    <path d="M36 50 L46 60 L66 38" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Small leaves decoration */}
    <ellipse cx="25" cy="35" rx="4" ry="7" fill="#81c784" transform="rotate(-30 25 35)"/>
    <ellipse cx="75" cy="35" rx="4" ry="7" fill="#81c784" transform="rotate(30 75 35)"/>
  </IconWrapper>
));
SuccessIcon.displayName = 'SuccessIcon';

export {
  IconWrapper
};
