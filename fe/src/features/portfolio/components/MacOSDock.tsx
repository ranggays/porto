"use client";

import { useMemo, useState } from "react";

export interface DockApp {
  id: string;
  name: string;
  icon: string;
}

interface MacOSDockProps {
  apps: DockApp[];
  onAppClick: (appId: string) => void;
  className?: string;
}

function DockGlyph({ id }: { id: string }) {
  if (id === "home") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="m3.5 10.7 8.5-7 8.5 7v8.1a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7v-8.1Zm3.4 8.1h3.2v-5.2h3.8v5.2h3.2v-7.1L12 7.1l-5.1 4.6v7.1Z" /> </svg>;
  if (id === "calendar") return <><span className="dock-calendar-day">Sun</span><span className="dock-calendar-number">18</span></>;
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    {id === "work" && <path d="M3 7.4A2.4 2.4 0 0 1 5.4 5h4.1c.66 0 1.29.26 1.76.72l1.04 1.03c.47.46 1.1.72 1.76.72h4.54A2.4 2.4 0 0 1 21 9.87v6.73A2.4 2.4 0 0 1 18.6 19H5.4A2.4 2.4 0 0 1 3 16.6Z" />}
    {id === "achievements" && <path d="M9.5 4.5c.6 3.9 3.1 6.4 7 7-3.9.6-6.4 3.1-7 7-.6-3.9-3.1-6.4-7-7 3.9-.6 6.4-3.1 7-7Zm8.25-1c.3 2.1 1.4 3.2 3.5 3.5-2.1.3-3.2 1.4-3.5 3.5-.3-2.1-1.4-3.2-3.5-3.5 2.1-.3 3.2-1.4 3.5-3.5Zm-.65 11c.2 1.44.96 2.2 2.4 2.4-1.44.2-2.2.96-2.4 2.4-.2-1.44-.96-2.2-2.4-2.4 1.44-.2 2.2-.96 2.4-2.4Z" />}
    {id === "about" && <path d="M12 20.2c-4.9-3.5-8.6-6.7-8.6-10.5 0-2.7 2.1-4.8 4.65-4.8 1.6 0 3.05.85 3.95 2.2.9-1.35 2.35-2.2 3.95-2.2 2.55 0 4.65 2.1 4.65 4.8 0 3.8-3.7 7-8.6 10.5Z" />}
    {id === "contact" && <><path fillRule="evenodd" d="M6.6 3.5h8a3.1 3.1 0 0 1 3.1 3.1v10.8a3.1 3.1 0 0 1-3.1 3.1h-8a3.1 3.1 0 0 1-3.1-3.1V6.6a3.1 3.1 0 0 1 3.1-3.1Zm4 8.7a2.45 2.45 0 1 0 0-4.9 2.45 2.45 0 0 0 0 4.9ZM6.35 17.3c0-2.45 1.95-3.85 4.25-3.85s4.25 1.4 4.25 3.85v.2H6.35Z" /><path d="M19.1 4.6H21v3.6h-1.9zm0 5.6H21v3.6h-1.9zm0 5.6H21v3.6h-1.9z" /></>}
  </svg>;
}

export function MacOSDock({ apps, onAppClick, className = "" }: MacOSDockProps) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);
  const scales = useMemo(() => apps.map((_, index) => {
    if (mouseX === null) return 1;
    const distance = Math.abs(mouseX - (index + 0.5) / apps.length);
    return 1 + Math.max(0, 1 - distance * apps.length * 2.2) * 0.25;
  }), [apps, mouseX]);

  return <div
    className={`mac-os-dock ${className}`}
    onMouseMove={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setMouseX((event.clientX - rect.left) / rect.width);
    }}
    onMouseLeave={() => setMouseX(null)}
  >
    {apps.map((app, index) => <span className="dock-item-group" key={app.id}>
      <button
        type="button"
        className={`mac-os-dock-item dock-icon-${app.id}${clicked === app.id ? " is-clicked" : ""}`}
        aria-label={app.name}
        title={app.name}
        onClick={() => {
          setClicked(app.id);
          window.setTimeout(() => setClicked(null), 240);
          onAppClick(app.id);
        }}
        style={{ transform: `scale(${scales[index]})` }}
      >
        <DockGlyph id={app.id} />
      </button>
      {/* {index === 0 && <i className="dock-divider" aria-hidden="true" />} */}
    </span>)}
  </div>;
}
