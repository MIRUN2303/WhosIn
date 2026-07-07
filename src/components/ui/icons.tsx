import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const createIcon = (paths: React.ReactNode): React.FC<IconProps> => {
  const Icon: React.FC<IconProps> = ({ size = 24, className, strokeWidth = 1.5 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths}
    </svg>
  );
  return Icon;
};

// =============================================
// NAVIGATION ICONS
// =============================================
export const IconHome = createIcon(
  <>
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
  </>
);

export const IconEvents = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <circle cx="12" cy="15" r="2" />
    <line x1="12" y1="15" x2="12" y2="13" />
  </>
);

export const IconStories = createIcon(
  <>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </>
);

export const IconGroups = createIcon(
  <>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </>
);

export const IconProfile = createIcon(
  <>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);

// =============================================
// ACTION / UTILITY ICONS
// =============================================
export const IconPlus = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>
);

export const IconBell = createIcon(
  <>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </>
);

export const IconSearch = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);

export const IconClose = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

export const IconCheck = createIcon(
  <>
    <polyline points="20 6 9 17 4 12" />
  </>
);

export const IconChevronLeft = createIcon(
  <>
    <polyline points="15 18 9 12 15 6" />
  </>
);

export const IconChevronRight = createIcon(
  <>
    <polyline points="9 18 15 12 9 6" />
  </>
);

export const IconArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);

export const IconArrowUp = createIcon(
  <>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </>
);

export const IconMoreHorizontal = createIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>
);

// =============================================
// SPORTS / FEATURE ICONS
// =============================================
export const IconLightning = createIcon(
  <>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </>
);

export const IconTrophy = createIcon(
  <>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V16" />
    <path d="M14 22V16" />
    <path d="M6 9h12v5a6 6 0 01-12 0V9z" />
  </>
);

export const IconMapPin = createIcon(
  <>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </>
);

export const IconClock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const IconCalendar = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);

export const IconUsers = createIcon(
  <>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </>
);

export const IconCamera = createIcon(
  <>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </>
);

export const IconEdit = createIcon(
  <>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>
);

export const IconTrash = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </>
);

export const IconMenu = createIcon(
  <>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);

export const IconMessageCircle = createIcon(
  <>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </>
);

export const IconHeart = createIcon(
  <>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </>
);

export const IconShare = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);

export const IconFilter = createIcon(
  <>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </>
);

export const IconRefresh = createIcon(
  <>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </>
);

export const IconFlag = createIcon(
  <>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </>
);

export const IconStar = createIcon(
  <>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </>
);

export const IconPlay = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </>
);

export const IconPause = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </>
);

export const IconSend = createIcon(
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>
);

export const IconSettings = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </>
);

export const IconInfo = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>
);

export const IconAlertCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </>
);

export const IconLogOut = createIcon(
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

export const IconDownload = createIcon(
  <>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);

export const IconTrendingUp = createIcon(
  <>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </>
);

export const IconActivity = createIcon(
  <>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </>
);

// =============================================
// WEATHER / STATUS ICONS (used in event cards)
// =============================================
export const IconSun = createIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>
);

export const IconCloud = createIcon(
  <>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </>
);

export const IconCloudRain = createIcon(
  <>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
    <line x1="12" y1="20" x2="12" y2="24" />
    <line x1="16" y1="20" x2="16" y2="22" />
    <line x1="8" y1="20" x2="8" y2="22" />
  </>
);

// =============================================
// SPORT ICONS (16)
// =============================================
export const IconBadminton = createIcon(
  <><path d="M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10 10 10 0 00-10-10z" opacity="0.1"/><path d="M11 12l-5 5M13 12l5-5M12 11l-5-5M12 13l5 5"/><circle cx="12" cy="12" r="2" fill="currentColor"/></>
);

export const IconCricket = createIcon(
  <><path d="M14 3l-4 4M10 7l-2 8 8-2M8 15l-3 3"/><path d="M16 5l3 3" strokeWidth="2"/></>
);

export const IconFootball = createIcon(
  <><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/><circle cx="12" cy="12" r="2" fill="currentColor"/></>
);

export const IconPickleball = createIcon(
  <><ellipse cx="12" cy="12" rx="5" ry="9" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M7 7l10 10"/></>
);

export const IconVolleyball = createIcon(
  <><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 3-2 9 0 12M12 3c2 3 2 9 0 12M21 12c-3-2-9-2-12 0M21 12c-3 2-9 2-12 0"/></>
);

export const IconBasketball = createIcon(
  <><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><path d="M5.5 5.5a12 12 0 0013 0M5.5 18.5a12 12 0 0113 0"/></>
);

export const IconRunning = createIcon(
  <><circle cx="15" cy="4" r="2" fill="currentColor"/><path d="M10 20l2-7 3 2 1 6M14 11l3-3 2 2M6 14l3 1"/></>
);

export const IconCycling = createIcon(
  <><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18l3-8h3l2 4h4M12 10l2-3M8 12h4"/></>
);

export const IconTrekking = createIcon(
  <><path d="M4 22l3-8 3 1 2 7M10 15l2-3 3 1"/><circle cx="13" cy="4" r="2" fill="currentColor"/><path d="M18 22v-5l-3-3 1-4 3 2v4"/></>
);

export const IconSwimming = createIcon(
  <><path d="M3 16c2-1 4 2 6 0s4 2 6 0 4 2 6 0M3 20c2-1 4 2 6 0s4 2 6 0 4 2 6 0"/><path d="M10 8l4-3 3 2-2 4-5-3z"/></>
);

export const IconMovie = createIcon(
  <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16"/><rect x="2" y="9" width="20" height="6"/></>
);

export const IconCafe = createIcon(
  <><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>
);

export const IconCar = createIcon(
  <><path d="M5 17v2a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-2M5 17l2-6h10l2 6M5 17H3M21 17h2"/><circle cx="7" cy="14" r="1.5" fill="currentColor"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/></>
);

export const IconGaming = createIcon(
  <><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 12h4M8 10v4"/><circle cx="15" cy="10" r="1" fill="currentColor"/><circle cx="19" cy="14" r="1" fill="currentColor"/></>
);

export const IconDice = createIcon(
  <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5" fill="currentColor"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><circle cx="9" cy="15" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/></>
);

export const IconSparkle = createIcon(
  <><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/></>
);

// =============================================
// BADGE / ACHIEVEMENT ICONS
// =============================================
export const IconTarget = createIcon(
  <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></>
);

export const IconMedal = createIcon(
  <><circle cx="12" cy="10" r="6"/><path d="M8 21l4-3 4 3V10H8z"/></>
);

export const IconCrown = createIcon(
  <><path d="M2 18l3-12 4 5 3-8 3 8 4-5 3 12H2z"/><path d="M2 18h20v2H2z"/></>
);

export const IconFlame = createIcon(
  <><path d="M12 22c-4 0-7-3-7-7 0-4 3-7 7-10 4 3 7 6 7 10 0 4-3 7-7 7z"/><path d="M12 22c-2 0-3-1.5-3-4 0-2 1.5-4 3-5 1.5 1 3 3 3 5 0 2.5-1 4-3 4z"/></>
);

export const IconGem = createIcon(
  <><path d="M12 2l3 6h6l-4 5 2 6-7-3-7 3 2-6-4-5h6z"/></>
);

export const IconShield = createIcon(
  <><path d="M12 2l7 3v8c0 4-3 8-7 9-4-1-7-5-7-9V5l7-3z"/><path d="M9 12l2 2 4-4"/></>
);

export const IconCrossSwords = createIcon(
  <><path d="M7 2l2 7-5 3 3 2M18 2l-2 7 5 3-3 2M10 12l-2 9M14 12l2 9"/></>
);

export const IconMedalStar = createIcon(
  <><circle cx="12" cy="10" r="6"/><path d="M8 21l4-3 4 3V10H8z"/><circle cx="12" cy="10" r="2" fill="currentColor"/></>
);

export const IconEagle = createIcon(
  <><path d="M12 2C7 2 3 6 3 11c0 4 2 7 5 9v2h8v-2c3-2 5-5 5-9 0-5-4-9-9-9z"/><path d="M8 11l2 2 4-4"/></>
);

// =============================================
// STATUS / UI ICONS
// =============================================
export const IconCheckCircle = createIcon(
  <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>
);

export const IconXCircle = createIcon(
  <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
);

export const IconLive = createIcon(
  <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor"/></>
);

export const IconPauseCircle = createIcon(
  <><circle cx="12" cy="12" r="10"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></>
);

export const IconX = createIcon(
  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
);

export const IconSunrise = createIcon(
  <><circle cx="12" cy="10" r="4"/><path d="M12 2v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 14h2M20 14h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><path d="M2 22h20"/></>
);

export const IconSunSet = createIcon(
  <><circle cx="12" cy="10" r="4"/><path d="M12 2v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 14h2M20 14h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><path d="M2 22h20"/></>
);

export const IconMoon = createIcon(
  <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>
);

export const IconTrendingDown = createIcon(
  <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>
);

// =============================================
// ICON MAP — maps string keys to icon components for data-driven rendering
// =============================================
import type { FC } from 'react';

export const ICON_MAP: Record<string, FC<IconProps>> = {
  // Sports
  badminton: IconBadminton,
  cricket: IconCricket,
  football: IconFootball,
  pickleball: IconPickleball,
  volleyball: IconVolleyball,
  basketball: IconBasketball,
  running: IconRunning,
  cycling: IconCycling,
  trekking: IconTrekking,
  swimming: IconSwimming,
  movie: IconMovie,
  cafe: IconCafe,
  roadtrip: IconCar,
  gaming: IconGaming,
  boardgames: IconDice,
  custom: IconSparkle,
  // Badges
  first_match: IconTarget,
  first_win: IconTrophy,
  weekend_warrior: IconCrossSwords,
  five_wins: IconMedal,
  ten_wins: IconSparkle,
  twentyfive_wins: IconGem,
  hundred_wins: IconCrown,
  full_attendance: IconStar,
  captain: IconEagle,
  iron_player: IconLightning,
  mvp: IconMedalStar,
  longest_streak: IconFlame,
  // Status
  check: IconCheck,
  cross: IconX,
  check_circle: IconCheckCircle,
  x_circle: IconXCircle,
  live: IconLive,
  pause: IconPauseCircle,
  // General
  trophy: IconTrophy,
  lightning: IconLightning,
  calendar: IconCalendar,
  users: IconUsers,
  map_pin: IconMapPin,
  clock: IconClock,
  edit: IconEdit,
  trash: IconTrash,
  search: IconSearch,
  settings: IconSettings,
  activity: IconActivity,
  trending_up: IconTrendingUp,
  trending_down: IconTrendingDown,
  flame: IconFlame,
  medal: IconMedal,
  crown: IconCrown,
  gem: IconGem,
  shield: IconShield,
  star: IconStar,
  flag: IconFlag,
  camera: IconCamera,
  heart: IconHeart,
  share: IconShare,
  message: IconMessageCircle,
  bell: IconBell,
  plus: IconPlus,
  close: IconClose,
  menu: IconMenu,
  refresh: IconRefresh,
  download: IconDownload,
  send: IconSend,
  play: IconPlay,
  filter: IconFilter,
  info: IconInfo,
  alert: IconAlertCircle,
  logout: IconLogOut,
  more: IconMoreHorizontal,
  arrow_right: IconArrowRight,
  arrow_up: IconArrowUp,
  chevron_left: IconChevronLeft,
  chevron_right: IconChevronRight,
};

/**
 * Iconic — render an icon from ICON_MAP by string key.
 * Falls back to rendering the key as text if not found.
 */
export const Iconic: React.FC<IconProps & { name: string }> = ({ name, size = 20, className, strokeWidth = 1.5 }) => {
  const Icon = ICON_MAP[name];
  if (!Icon) return <span className={className} style={{ fontSize: size }}>{name}</span>;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
};
