"use client";

export function Icon({ path, className, filled }: { path: string; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      <path d={path} />
    </svg>
  );
}

const P = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9.5 21v-6h5v6",
  palette: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.6-2.2-.3-1 .4-1.8 1.4-1.8H18a3 3 0 0 0 3-3c0-5-4-9-9-9ZM7.5 10a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm3-3.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm5 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm3.5 3.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z",
  hanger: "M12 6.5 5 16a1 1 0 0 0 .9 1.5h12.2a1 1 0 0 0 .9-1.5L12 6.5Zm0 0a1.75 1.75 0 1 1 1.75-1.75",
  sparkles: "M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3ZM19 15l.9 2.3 2.2.9-2.2.9-.9 2.3-.9-2.3-2.2-.9 2.2-.9.9-2.3Z",
  chat: "M21 12a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2v-6a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8ZM8 12h.01M12 12h.01M16 12h.01",
  image: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4 8 3-3 4 4m-5.5-5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  bag: "M6 7h12l1 13H5L6 7Zm3 0a3 3 0 0 1 6 0",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 8a8 8 0 0 1 16 0",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  camera: "M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  trash: "M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13",
  send: "M4 12l16-7-4 14-5-4-7-3Zm16-7-8.5 8.5M12 19l4-4",
  close: "M6 6l12 12M18 6 6 18",
  check: "M4 12.5 9.5 18 20 6.5",
  lock: "M6 11h12v9H6v-9Zm2-2V7a4 4 0 0 1 8 0v2",
  weather: "M12 3a6 6 0 0 0-5.5 8.6A4 4 0 0 0 9 19h7a5 5 0 0 0 .6-10A6 6 0 0 0 12 3Z",
  logout: "M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4m-6-5 4-4-4-4m4 4H3",
  shield: "M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6l8-3Z",
};

export function HomeIcon(props: { className?: string }) {
  return <Icon path={P.home} {...props} />;
}
export function PaletteIcon(props: { className?: string }) {
  return <Icon path={P.palette} {...props} />;
}
export function HangerIcon(props: { className?: string }) {
  return <Icon path={P.hanger} {...props} />;
}
export function SparklesIcon(props: { className?: string }) {
  return <Icon path={P.sparkles} {...props} />;
}
export function ChatIcon(props: { className?: string }) {
  return <Icon path={P.chat} {...props} />;
}
export function ImageIcon(props: { className?: string }) {
  return <Icon path={P.image} {...props} />;
}
export function BagIcon(props: { className?: string }) {
  return <Icon path={P.bag} {...props} />;
}
export function UserIcon(props: { className?: string }) {
  return <Icon path={P.user} {...props} />;
}
export function ArrowIcon(props: { className?: string }) {
  return <Icon path={P.arrow} {...props} />;
}
export function PlusIcon(props: { className?: string }) {
  return <Icon path={P.plus} {...props} />;
}
export function CameraIcon(props: { className?: string }) {
  return <Icon path={P.camera} {...props} />;
}
export function TrashIcon(props: { className?: string }) {
  return <Icon path={P.trash} {...props} />;
}
export function SendIcon(props: { className?: string }) {
  return <Icon path={P.send} {...props} />;
}
export function CloseIcon(props: { className?: string }) {
  return <Icon path={P.close} {...props} />;
}
export function CheckIcon(props: { className?: string }) {
  return <Icon path={P.check} {...props} />;
}
export function LockIcon(props: { className?: string }) {
  return <Icon path={P.lock} {...props} />;
}
export function WeatherIcon(props: { className?: string }) {
  return <Icon path={P.weather} {...props} />;
}
export function LogoutIcon(props: { className?: string }) {
  return <Icon path={P.logout} {...props} />;
}
export function ShieldIcon(props: { className?: string }) {
  return <Icon path={P.shield} {...props} />;
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient ${className ?? ""}`}>
      <span className="h-3.5 w-3.5 rounded-full border-2 border-white" />
    </span>
  );
}
