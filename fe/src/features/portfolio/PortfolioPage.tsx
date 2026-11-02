"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { MacOSDock, type DockApp } from "./components/MacOSDock";
import { MusicPlayer, type Track } from "./components/MusicPlayer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProjectDocuments } from "./data/types";
import { useProjectDocuments } from "./context/ProjectDocumentsContext";

gsap.registerPlugin(ScrollTrigger, Draggable);

const A = "/sites/rangga";
const work = ["Flow", "Riset", "Flox", "Velora", "GeoVision AI"];
const psychoKiller: Track = {
  id: "psycho-killer",
  title: "Play Hard",
  artist: "David Guetta",
  album: "Play Hard",
  artwork: `${A}/playimg.webp`,
  duration: 200,
  url: `${A}/audio/playhard.mp3`,
};

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`glass ${className}`}>{children}</div>;
}

function Icon({ name, alt = name }: { name: string; alt?: string }) {
  return <img src={`${A}/app-icons/${name}.png`} alt={alt} />;
}

function MiniCalendar() {
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthName =
    visibleMonth?.toLocaleString("en-US", { month: "long" }) ?? "Calendar";
  const year = visibleMonth?.getFullYear() ?? 0;
  const month = visibleMonth?.getMonth() ?? 0;
  const firstWeekday = visibleMonth ? new Date(year, month, 1).getDay() : 0;
  const daysInMonth = visibleMonth
    ? new Date(year, month + 1, 0).getDate()
    : 30;
  const bookedDays =
    year === 2025 && month === 5 ? new Set([17, 18, 19]) : new Set<number>();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const now = new Date();
      setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
      setSelectedDay(now.getDate());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const goToNextMonth = () => {
    if (!visibleMonth) return;
    setVisibleMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-heading">
        <b>
          {monthName} {year}
        </b>
        <button
          type="button"
          aria-label="Next month"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={goToNextMonth}
        >
          ›
        </button>
      </div>
      <div className="mini-calendar-weekdays">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mini-calendar-days">
        {Array.from({ length: 42 }, (_, index) => {
          if (index < firstWeekday || index >= firstWeekday + daysInMonth)
            return <span key={`empty-${index}`} aria-hidden="true" />;
          const day = index - firstWeekday + 1;
          const booked = bookedDays.has(day);
          return (
            <button
              key={day}
              type="button"
              className={`${selectedDay === day ? "is-selected" : ""} ${booked ? "is-booked" : ""}`}
              disabled={booked}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mini-calendar-footer">
        {selectedDay
          ? `${monthName.slice(0, 3)} ${selectedDay}, ${year}`
          : "Select a date"}
      </div>
    </div>
  );
}

function LiveTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setTime(new Date());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="clock">
      {time
        ? time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })
        : "--:--"}
    </span>
  );
}

const folderDetails: Record<string, { description: string; items: string[] }> =
  {
    Flow: {
      description:
        "Research workspace with workspace management and an Excalidraw brainstorming canvas.",
      items: [
        "Next.js, FastAPI, Supabase, Prisma, and PostgreSQL",
        "PDF upload and processing, Gemini summaries and embeddings",
        "Vector retrieval, document-grounded chat, and mindmap generation",
      ],
    },
    Riset: {
      description:
        "AI-driven academic web platform with a core brainstorming feature and managed database workflows.",
      items: [
        "Next.js, FastAPI, Supabase, Prisma, and PostgreSQL",
        "Private, student-focused research environment",
        "Used by 34 users",
      ],
    },
    Flox: {
      description:
        "Solana event-ticketing platform with organizer, validator, and attendee workflows.",
      items: [
        "Next.js, Anchor, wallet integration, and escrow-based payments",
        "Event creation, ticket tiers, and on-site QR validation",
        "AI assistant for event information",
      ],
    },
    Velora: {
      description:
        "Solana on-chain program for distributing SPL tokens through configurable vesting schedules.",
      items: [
        "Anchor and Rust with linear, cliff, cliff-plus-linear, and milestone schedules",
        "Next.js dashboard, claim, and create-vesting flows",
        "23 Anchor integration test cases",
      ],
    },
    "GeoVision AI": {
      description:
        "Smart-city satellite-image segmentation application using a PyTorch U-Net model with a ResNet34 encoder.",
      items: [
        "Next.js and FastAPI",
        "Six-class classification for buildings, land, roads, vegetation, water, and other areas",
        "Color-mask and pixel-statistics output",
      ],
    },
  };

function FolderWindow({
  folder,
  onClose,
  onSelect,
  projectDocuments,
}: {
  folder: string;
  onClose: () => void;
  onSelect: (folder: string) => void;
  projectDocuments: ProjectDocuments;
}) {
  const windowRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);
  const detail = folderDetails[folder];
  const readmeProject =
    folder === "GeoVision AI" ? "geovision" : folder.toLowerCase();
  const projectDocument = projectDocuments[readmeProject] ?? {
    files: [],
    readme: null,
  };

  const loadReadme = async () => {
    setReadmeOpen(true);
    if (readme !== null) return;
    setReadme(
      projectDocument.readme ??
        "README.md is not available in docs/projects for this project.",
    );
  };
  const startWindowDrag = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    const element = windowRef.current;
    if (!element) return;
    event.preventDefault();
    element.setPointerCapture(event.pointerId);
    const parentRect = element.parentElement?.getBoundingClientRect();
    const windowRect = element.getBoundingClientRect();
    if (!parentRect) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: position.x,
      startOffsetY: position.y,
      minX: position.x + parentRect.left - windowRect.left,
      maxX: position.x + parentRect.right - windowRect.right,
      minY: position.y + parentRect.top - windowRect.top,
      maxY: position.y + parentRect.bottom - windowRect.bottom,
    };
  };
  const moveWindow = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const element = windowRef.current;
    if (!drag || !element || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    setPosition({
      x: Math.max(drag.minX, Math.min(drag.maxX, drag.startOffsetX + deltaX)),
      y: Math.max(drag.minY, Math.min(drag.maxY, drag.startOffsetY + deltaY)),
    });
  };
  const endWindowDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      windowRef.current?.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  };

  return (
    <section
      ref={windowRef}
      className="folder-window"
      style={{
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
      }}
      onPointerMove={moveWindow}
      onPointerUp={endWindowDrag}
      onPointerCancel={endWindowDrag}
      role="dialog"
      aria-modal="true"
      aria-label={`${folder} folder`}
    >
      <header className="folder-window-bar" onPointerDown={startWindowDrag}>
        <div className="folder-window-controls">
          <button
            type="button"
            className="folder-window-close"
            aria-label="Close folder"
            onClick={onClose}
          />
          <i />
          <i />
        </div>
        <b>{folder}</b>
        <span>⌕</span>
      </header>
      <div className="folder-window-toolbar">
        <button
          type="button"
          aria-label="Back"
          disabled={!readmeOpen}
          onClick={() => {
            setReadmeOpen(false);
            setSelectedFile(null);
          }}
        >
          ‹
        </button>
        <button type="button" aria-label="Forward" disabled>
          ›
        </button>
        <span>
          {readmeOpen ? `${folder} / README.md` : `${folder} — Project folder`}
        </span>
        <button type="button" aria-label="Change view">
          ▦
        </button>
      </div>
      <div className="folder-window-body">
        <nav className="folder-window-sidebar" aria-label="Folders">
          <small>Projects</small>
          {work.map((item) => (
            <button
              key={item}
              type="button"
              className={item === folder ? "is-active" : ""}
              onClick={() => {
                setReadmeOpen(false);
                setReadme(null);
                setSelectedFile(null);
                onSelect(item);
              }}
            >
              <Icon name="folder" alt="" />
              <span>{item}</span>
            </button>
          ))}
        </nav>
        <div
          className={`folder-window-content${readmeOpen ? " is-readme" : ""}`}
        >
          {readmeOpen ? (
            <article className="readme-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => (
                    <a href={href} {...props} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {readme ?? ""}
              </ReactMarkdown>
            </article>
          ) : (
            <>
              <Icon name="folder" alt="" />
              <h2>{folder}</h2>
              {detail ? (
                <>
                  <p>{detail.description}</p>
                  <ul>
                    {detail.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>This folder is part of the portfolio workspace.</p>
              )}
              <div className="folder-window-files">
                <small>Project files</small>
                {projectDocument.files.length ? (
                  projectDocument.files.map((file) => (
                    <button
                      key={file.name}
                      type="button"
                      className={selectedFile === file.name ? "is-active" : ""}
                      onClick={() => {
                        setSelectedFile(file.name);
                        if (file.name.toLowerCase() === "readme.md")
                          loadReadme();
                      }}
                    >
                      <span className="folder-window-file-icon">▤</span>
                      <span>{file.name}</span>
                      <em>{file.type}</em>
                    </button>
                  ))
                ) : (
                  <p className="folder-window-empty">
                    No project files available.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function AnalogClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [timeZone, setTimeZone] = useState("Local time");

  useEffect(() => {
    const update = () => {
      setTime(new Date());
    };
    const frame = window.requestAnimationFrame(() =>
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    );
    update();
    const interval = window.setInterval(update, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  const seconds = time?.getSeconds() ?? 0;
  const minutes = time?.getMinutes() ?? 0;
  const hours = time ? time.getHours() % 12 : 0;
  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5;
  const month = time?.toLocaleString("en-US", { month: "short" }) ?? "";
  const date = time ? `${month} ${time.getDate()}` : "";

  return (
    <div className="analog-face">
      {Array.from({ length: 60 }, (_, index) =>
        index % 5 === 0 ? (
          <span
            key={index}
            className="clock-number"
            style={{
              transform: `translate(-50%, -50%) rotate(${index * 6}deg) translateY(-51px) rotate(-${index * 6}deg)`,
            }}
          >
            {index === 0 ? "12" : index / 5}
          </span>
        ) : (
          <span
            key={index}
            className="clock-tick"
            style={{ transform: `rotate(${index * 6}deg)` }}
          />
        ),
      )}
      <span
        className="hand hour"
        style={{ transform: `rotate(${hourAngle}deg)` }}
      />
      <span
        className="hand minute"
        style={{ transform: `rotate(${minuteAngle}deg)` }}
      />
      <span
        className="hand second"
        style={{ transform: `rotate(${secondAngle}deg)` }}
      />
      <span className="clock-center" />
      <span className="clock-date">{date}</span>
      <span className="clock-zone">{timeZone}</span>
    </div>
  );
}

function DesktopHero() {
  const projectDocuments = useProjectDocuments();
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  return (
    <>
      <div className="desktop-hero">
        <div className="system-bar">
          <div>
            <b>RYS</b>
            <span>Rangga Yovie Saputra</span>
            <i>Information Technology</i>
          </div>
          <LiveTime />
        </div>
        <div className="desktop-work">
          {work.map((item, i) => (
            <div
              key={item}
              className="folder draggable"
              style={{ top: `${90 + i * 108}px` }}
              role="button"
              tabIndex={0}
              aria-label={`Open ${item} project folder`}
              onClick={(event) => {
                if (event.currentTarget.dataset.suppressClick === "true") {
                  delete event.currentTarget.dataset.suppressClick;
                  return;
                }
                setOpenFolder(item);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpenFolder(item);
                }
              }}
            >
              <Icon name="folder" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        {openFolder && (
          <FolderWindow
            folder={openFolder}
            onClose={() => setOpenFolder(null)}
            onSelect={setOpenFolder}
            projectDocuments={projectDocuments}
          />
        )}
        <Glass className="analog draggable">
          <AnalogClock />
        </Glass>
        <Glass className="calendar draggable">
          <MiniCalendar />
        </Glass>
        <Glass className="weather draggable">
          <small>Malang</small>
          <div className="forecast">
            {["We", "Th", "Fr", "Sa", "Su", "Mo", "Tu"].map((day, i) => (
              <div key={day}>
                <b>{day}</b>
                <span
                  className={i === 2 || i === 3 || i === 6 ? "cloud" : "sun"}
                >
                  {i === 2 || i === 3 || i === 6 ? "☁" : "☀"}
                </span>
                <em>{[31, 33, 29, 28, 30, 32, 27][i]}°</em>
              </div>
            ))}
          </div>
        </Glass>
        <Glass className="music draggable">
          <MusicPlayer currentTrack={psychoKiller} />
        </Glass>
        {/* <Glass className="app-dock draggable"><Icon name="notion" /><Icon name="cmux" /><Icon name="granola" /><Icon name="terminal" /><Icon name="claude" /></Glass> */}
        <div className="desktop-title">
          <h1>
            <span>I build practical tools.</span>
            <span>
              Across <strong>web</strong>, <strong>AI/ML</strong>, and{" "}
              <strong>Web3</strong>.
            </span>
          </h1>
          <p>
            Information Technology Education background with experience across
            full-stack web development, AI/ML, computer vision, data analysis,
            and Web3.
          </p>
        </div>
        <div className="desktop-photo draggable">
          <img src={`${A}/profporto.webp`} alt="Profile photo" />
        </div>
      </div>
    </>
  );
}

function MobileHero() {
  return (
    <section className="mobile-hero">
      <div className="mobile-top">
        <b>RYS</b>
        <span>Rangga Yovie Saputra</span>
        <i>Information Technology</i>
      </div>
      <div className="mobile-copy">
        <h1>
          I build practical tools.
          <br />
          Across <strong>web</strong>, <strong>AI/ML</strong>, and{" "}
          <strong>Web3</strong>.
        </h1>
        <p>
          Information Technology Education background with experience across
          full-stack web development, AI/ML, computer vision, data analysis, and
          Web3.
        </p>
      </div>
      <img
        className="mobile-photo"
        src={`${A}/profporto.jpg`}
        alt="Profile photo"
      />
      <div className="mobile-icons">
        <Icon name="linkedin" />
        <Icon name="gmail" />
        <Icon name="notion" />
        <Icon name="claude" />
      </div>
    </section>
  );
}

const dockApps: DockApp[] = [
  { id: "home", name: "Home", icon: "" },
  { id: "work", name: "Projects", icon: "" },
  { id: "achievements", name: "Certifications", icon: "" },
  { id: "about", name: "Profile", icon: "" },
  // { id: "calendar", name: "Book a meeting", icon: "" },
  { id: "contact", name: "Contact", icon: "" },
];

function SiteDock() {
  const destinations: Record<string, string> = {
    work: "#projects",
    achievements: "#certifications",
    about: "#about",
    calendar: "#publications",
    contact: "#contact",
  };
  return (
    <div className="site-dock-shell">
      <MacOSDock
        apps={dockApps}
        className="site-dock"
        onAppClick={(appId) => {
          if (appId === "home") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          const target = document.querySelector(destinations[appId]);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
    </div>
  );
}

function CertificationIcon({ url, label }: { url: string; label: string }) {
  return (
    <img
      className="certification-icon"
      src={`https://www.google.com/s2/favicons?domain=${url}&sz=128`}
      alt={`${label} icon`}
    />
  );
}

function Certifications() {
  const items = [
    [
      "Software Engineer",
      "Badan Nasional Sertifikasi Profesi",
      "2026",
      "Assessed and certified by Badan Nasional Sertifikasi Profesi.",
      "bnsp.go.id",
    ],
    [
      "Google Analytics",
      "Google",
      "2026",
      "Assessed and certified by Google.",
      "google.com",
    ],
    [
      "Microsoft Office Desktop Application",
      "Trust Training Partners",
      "",
      "Certificate organization: Trust Training Partners.",
      "education.trusttrain.com",
    ],
  ];
  return (
    <section id="certifications" className="achievements">
      <h2>Certifications</h2>
      <div className="achievement-grid experience-grid">
        {items.map(([title, organization, years, description, domain], i) => (
          <article key={title}>
            <div className={`achievement-icon icon-${i}`}>
              <CertificationIcon url={domain} label={organization} />
            </div>
            <h3>{title}</h3>
            <p className="experience-org">
              {organization}
              {years ? ` · ${years}` : ""}
            </p>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PublicationIcon({ domain }: { domain: string }) {
  return (
    <img
      className="publication-icon"
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
    />
  );
}

function Press() {
  const stories = [
    {
      source: "FILKOM UB",
      domain: "filkom.ub.ac.id",
      title: "ExploraGeo: Media Pembelajaran Geografi Interaktif",
      detail: "Developed video and interactive learning content",
      href: "https://filkom.ub.ac.id/project/2025/06/explorageo-media-pembelajaran-geografi-interaktif/",
    },
    {
      source: "J-PTIIK",
      domain: "j-ptiik.ub.ac.id",
      title: "Jurnal Pengembangan Teknologi Informasi dan Ilmu Komputer",
      detail: "Article 16912",
      href: "https://j-ptiik.ub.ac.id/index.php/j-ptiik/article/view/16912",
    },
  ];
  return (
    <section id="publications" className="press">
      <div className="section-label">Publications</div>
      <div className="press-row">
        {stories.map((story) => (
          <a
            href={story.href}
            key={story.href}
            target="_blank"
            rel="noreferrer"
          >
            <div className="press-source press-source-name">
              <PublicationIcon domain={story.domain} />
              <span>{story.source}</span>
            </div>
            <h3>{story.title}</h3>
            <span>{story.detail}</span>
            <em>Read the article ↗</em>
          </a>
        ))}
      </div>
    </section>
  );
}

function VentureStudio() {
  const projects = [
    [
      "Flow",
      "Research workspace with Next.js, FastAPI, Supabase, Prisma, PostgreSQL, PDF processing, Gemini summaries and embeddings, vector retrieval, document-grounded chat, and mindmap generation.",
      "https://github.com/ranggays/flow",
    ],
    [
      "Riset",
      "AI-driven academic web platform with a core brainstorming feature and managed database workflows in a private student-focused environment used by 34 users.",
      "https://github.com/ranggays",
    ],
    [
      "Flox",
      "Solana event-ticketing platform with wallet integration, event creation, ticket tiers, escrow-based payments, QR validation, organizer and validator workflows, and an AI assistant.",
      "https://github.com/ranggays/flox",
    ],
    [
      "Velora",
      "Solana token-distribution protocol using Anchor and Rust with linear, cliff, cliff-plus-linear, and milestone vesting schedules, plus a Next.js dashboard.",
      "https://github.com/ranggays/token-distribution-protocol",
    ],
    [
      "GeoVision AI",
      "Smart-city satellite-image segmentation application using Next.js, FastAPI, PyTorch U-Net, a ResNet34 encoder, six-class classification, color masks, and pixel statistics.",
      "https://github.com/ranggays/geovision",
    ],
  ];
  return (
    <section id="projects" className="venture">
      <div className="venture-heading">
        <h2>Selected projects</h2>
        <p>Full-stack, AI/ML, and Web3 work</p>
      </div>
      <div className="venture-list">
        {projects.map(([name, description, href]) => (
          <div key={name}>
            <b>{name}</b>
            <div className="venture-project-detail">
              <p>{description}</p>
              <a href={href} target="_blank" rel="noreferrer">
                View project ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Superpower({
  number,
  title,
  body,
  link,
  stats,
  tone = "blue",
  imageSrc,
  imageAlt = "Experience visual",
}: {
  number: string;
  title: string;
  body: string;
  link: string;
  stats: string[];
  tone?: string;
  imageSrc?: string | string[];
  imageAlt?: string;
}) {
  const experienceImages = imageSrc
    ? Array.isArray(imageSrc)
      ? imageSrc
      : [imageSrc]
    : number === "1"
      ? ["/images/webp/BRIN activity.webp"]
      : number === "3"
        ? ["/images/webp/Certif SE.webp"]
        : [];
  const experienceAlt =
    imageAlt ??
    (number === "1"
      ? "Rangga Yovie Saputra during a BRIN activity"
      : "Certificate for Rangga Yovie Saputra from the Learning Technology Lab");
  return (
    <>
      <section className={`superpower ${tone}`} data-link={link}>
        <div className="super-copy">
          <p className="section-label">Experience nº{number}</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="superpower-card">
          <div className="superpower-card-tab">
            {number === "1"
              ? "BRIN"
              : number === "2"
                ? "Web3"
                : number === "3"
                  ? "Data"
                  : "Organization"}
          </div>
          <div className="stats">
            <ul>
              {stats.map((stat) => (
                <li key={stat}>{stat}</li>
              ))}
            </ul>
          </div>
          <div
            className={`experience-visual-placeholder${experienceImages.length > 1 ? " is-multi" : ""}`}
            aria-label={
              experienceImages.length
                ? experienceAlt
                : "Image placeholder for future experience project visual"
            }
          >
            {experienceImages.length ? (
              experienceImages.map((src) => (
                <img key={src} src={src} alt={experienceAlt} />
              ))
            ) : (
              <span>Image placeholder</span>
            )}
          </div>
        </div>
      </section>
      {number === "4" && <VentureStudio />}
    </>
  );
}

function Playground() {
  return (
    <>
      <section id="playground" className="playground">
        <a
          href="https://github.com/ranggays"
          className="playground-link"
          target="_blank"
          rel="noreferrer"
        >
          <span>More</span>
          <span>on GitHub</span>
        </a>
        <p>Explore more of my work and experiments on GitHub.</p>
      </section>
      <section id="about" className="about">
        <div className="window-bar">
          <i />
          <i />
          <i />
          <span>profile.txt</span>
        </div>
        <div className="about-grid">
          <div>
            <p className="about-label">Profile</p>
            <p>
              Information Technology Education background with experience across
              full-stack web development, AI/ML, computer vision, data analysis,
              and Web3. Builds practical applications that turn research,
              academic, and user workflows into more intuitive tools.
            </p>
            <p className="about-label about-sub-label">Education</p>
            <p>
              Bachelor of Education in Information Technology at Universitas
              Brawijaya, 2022–2026. GPA: 3.75 out of 4.
            </p>
          </div>
          <div>
            <p className="about-label">Technical skills</p>
            <ul className="skill-list">
              <li>
                <b>Web:</b> Next.js, React, TypeScript, FastAPI, database
                management
              </li>
              <li>
                <b>AI/ML:</b> PyTorch, OpenCV, NumPy, U-Net, RAG, sentiment
                analysis
              </li>
              <li>
                <b>Blockchain:</b> Solana, Anchor, Rust, SPL tokens, smart
                contracts, Web3
              </li>
              <li>
                <b>Data:</b> Supabase, PostgreSQL, Prisma, LangChain, Google
                Gemini
              </li>
            </ul>
            <p className="about-label about-sub-label">Certifications</p>
            <p>Software Engineer — BNSP · Google Analytics — Google</p>
            <p className="about-label about-sub-label">Organization</p>
            <p>
              Expert Staff Member, EM Universitas Brawijaya (2024–2025) · PK2MB
              Committee Staff (2023)
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function PortfolioPage() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          const isDesktop = Boolean(conditions?.desktop);
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          const dragInstances: Draggable[] = [];
          const dragCleanups: Array<() => void> = [];
          const ambient: gsap.core.Tween[] = [];
          if (isDesktop) {
            intro
              .fromTo(
                ".desktop-hero .draggable",
                { autoAlpha: 0, y: 8 },
                { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
              )
              .fromTo(
                ".desktop-title h1",
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.7 },
                "-=0.3",
              )
              .fromTo(
                ".desktop-title > p:last-child",
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.55 },
                "-=0.35",
              );
            gsap.utils
              .toArray<HTMLElement>(".desktop-hero .draggable:not(.folder)")
              .forEach((element) => {
                const parent = element.parentElement;
                const bounds = parent
                  ? {
                      minX: -element.offsetLeft,
                      maxX:
                        parent.clientWidth -
                        element.offsetLeft -
                        element.offsetWidth,
                      minY: -element.offsetTop,
                      maxY:
                        parent.clientHeight -
                        element.offsetTop -
                        element.offsetHeight,
                    }
                  : undefined;
                let dragged = false;
                const click = (event: MouseEvent) => {
                  if (!dragged) return;
                  event.preventDefault();
                  event.stopPropagation();
                  dragged = false;
                };
                const [instance] = Draggable.create(element, {
                  type: "x,y",
                  bounds,
                  cursor: "grab",
                  activeCursor: "grabbing",
                  minimumMovement: 3,
                  dragClickables: true,
                  allowNativeTouchScrolling: false,
                  onPress: () => element.classList.add("is-dragging"),
                  onDragStart: () => {
                    dragged = true;
                    element.classList.add("is-dragging");
                  },
                  onDragEnd: () => {
                    element.classList.remove("is-dragging");
                  },
                  onRelease: () => element.classList.remove("is-dragging"),
                });
                element.addEventListener("click", click, true);
                dragInstances.push(instance);
                dragCleanups.push(() =>
                  element.removeEventListener("click", click, true),
                );
              });
            gsap.utils
              .toArray<HTMLElement>(".desktop-hero .folder")
              .forEach((element) => {
                const parent = element.offsetParent as HTMLElement | null;
                if (!parent) return;
                let active = false;
                let pointerId = -1;
                let startX = 0;
                let startY = 0;
                let originX = 0;
                let originY = 0;
                let moved = false;
                const down = (event: PointerEvent) => {
                  if (event.pointerType === "mouse" && event.button !== 0)
                    return;
                  event.preventDefault();
                  active = true;
                  pointerId = event.pointerId;
                  startX = event.clientX;
                  startY = event.clientY;
                  originX = element.offsetLeft;
                  originY = element.offsetTop;
                  moved = false;
                  element.setPointerCapture?.(pointerId);
                  element.classList.add("is-dragging");
                };
                const move = (event: PointerEvent) => {
                  if (!active || event.pointerId !== pointerId) return;
                  if (
                    Math.abs(event.clientX - startX) > 3 ||
                    Math.abs(event.clientY - startY) > 3
                  )
                    moved = true;
                  const maxX = parent.clientWidth - element.offsetWidth;
                  const maxY = parent.clientHeight - element.offsetHeight;
                  const nextX = Math.max(
                    0,
                    Math.min(maxX, originX + event.clientX - startX),
                  );
                  const nextY = Math.max(
                    28,
                    Math.min(maxY, originY + event.clientY - startY),
                  );
                  element.style.left = `${nextX}px`;
                  element.style.right = "auto";
                  element.style.top = `${nextY}px`;
                  event.preventDefault();
                };
                const up = (event: PointerEvent) => {
                  if (!active || event.pointerId !== pointerId) return;
                  active = false;
                  if (moved) element.dataset.suppressClick = "true";
                  element.releasePointerCapture?.(pointerId);
                  element.classList.remove("is-dragging");
                };
                element.addEventListener("pointerdown", down);
                element.addEventListener("pointermove", move, {
                  passive: false,
                });
                element.addEventListener("pointerup", up);
                element.addEventListener("pointercancel", up);
                dragCleanups.push(() => {
                  element.removeEventListener("pointerdown", down);
                  element.removeEventListener("pointermove", move);
                  element.removeEventListener("pointerup", up);
                  element.removeEventListener("pointercancel", up);
                });
              });
            ambient.push(
              gsap.to(".app-dock img", {
                y: -4,
                duration: 1.6,
                repeat: -1,
                yoyo: true,
                stagger: { each: 0.16, from: "random" },
                ease: "sine.inOut",
              }),
            );
            ambient.push(
              gsap.to(".desktop-photo img", {
                scale: 1.025,
                duration: 2.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              }),
            );
          } else {
            intro
              .fromTo(
                ".mobile-top, .mobile-copy h1, .mobile-copy > p:last-child",
                { autoAlpha: 0, y: 18 },
                { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 },
              )
              .fromTo(
                ".mobile-photo, .mobile-icons",
                { autoAlpha: 0, y: 12 },
                { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1 },
                "-=0.25",
              );
            ambient.push(
              gsap.to(".mobile-icons img", {
                y: -4,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                stagger: { each: 0.14, from: "random" },
                ease: "sine.inOut",
              }),
            );
            ambient.push(
              gsap.to(".mobile-photo", {
                scale: 1.025,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              }),
            );
          }
          const revealTargets = gsap.utils.toArray<HTMLElement>(
            ".achievement-grid article, .venture-list > div, .press-row > a, .playground, .about, .content footer",
          );
          revealTargets.forEach((element) =>
            gsap.fromTo(
              element,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: element,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              },
            ),
          );
          const cards = gsap.utils.toArray<HTMLElement>(".superpower-card");
          const superpowers = gsap.utils.toArray<HTMLElement>(".superpower");
          const highlights = document.querySelector<HTMLElement>("#projects");
          let superpowersReleased = false;
          let releaseTweens: gsap.core.Tween[] = [];
          const updateSuperpowers = () => {
            if (!highlights || !isDesktop || !root.current) return;
            const shouldRelease =
              highlights.getBoundingClientRect().top <= window.innerHeight;
            if (shouldRelease === superpowersReleased) return;
            releaseTweens.forEach((tween) => tween.kill());
            releaseTweens = [];
            if (shouldRelease) {
              const visibleTops = superpowers.map(
                (section) => section.getBoundingClientRect().top,
              );
              root.current.classList.add("superpowers-released");
              superpowers.forEach((section, index) => {
                const naturalTop = section.getBoundingClientRect().top;
                gsap.set(section, { y: visibleTops[index] - naturalTop });
              });
              releaseTweens = superpowers.map((section) =>
                gsap.to(section, {
                  y: 0,
                  duration: 0.35,
                  ease: "power2.out",
                  overwrite: "auto",
                }),
              );
            } else {
              root.current.classList.remove("superpowers-released");
              superpowers.forEach((section) => gsap.set(section, { y: 0 }));
            }
            superpowersReleased = shouldRelease;
          };
          if (highlights && isDesktop) {
            window.addEventListener("scroll", updateSuperpowers, {
              passive: true,
            });
            updateSuperpowers();
          }
          superpowers.forEach((section) => {
            const card = section.querySelector<HTMLElement>(".superpower-card");
            if (!card) return;
            gsap.fromTo(
              card,
              { y: 32, scale: 0.98, autoAlpha: 0.5 },
              {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 86%",
                  end: "top 30%",
                  scrub: 0.6,
                },
              },
            );
          });
          const hoverHandlers: Array<{
            card: HTMLElement;
            enter: () => void;
            leave: () => void;
          }> = [];
          cards.forEach((card) => {
            const enter = () =>
              gsap.to(card, {
                y: -6,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 22px 48px rgba(0,0,0,.24)",
                overwrite: "auto",
              });
            const leave = () =>
              gsap.to(card, {
                y: 0,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 14px 30px rgba(0,0,0,.18)",
                overwrite: "auto",
              });
            card.addEventListener("mouseenter", enter);
            card.addEventListener("mouseleave", leave);
            card.addEventListener("focusin", enter);
            card.addEventListener("focusout", leave);
            card.dataset.gsapHover = "ready";
            hoverHandlers.push({ card, enter, leave });
          });
          root.current?.classList.remove("page-loading");
          return () => {
            dragInstances.forEach((instance) => instance.kill());
            dragCleanups.forEach((cleanup) => cleanup());
            window.removeEventListener("scroll", updateSuperpowers);
            releaseTweens.forEach((tween) => tween.kill());
            root.current?.classList.remove("superpowers-released");
            ambient.forEach((tween) => tween.kill());
            hoverHandlers.forEach(({ card, enter, leave }) => {
              card.removeEventListener("mouseenter", enter);
              card.removeEventListener("mouseleave", leave);
              card.removeEventListener("focusin", enter);
              card.removeEventListener("focusout", leave);
            });
          };
        },
      );
    }, root);
    return () => context.revert();
  }, []);

  return (
    <main ref={root} className="page-loading">
      <div className="hero-wrap">
        <DesktopHero />
        <MobileHero />
      </div>
      <SiteDock />
      <div className="content">
        <Certifications />
        <Press />
        <Superpower
          number="1"
          title="Building full-stack web applications."
          body="At Badan Riset dan Inovasi Nasional (BRIN), I led end-to-end development of a web-based research platform, including its interactive brainstorming feature. I also built a feature that transforms PDF documents into visual concept maps and managed the project database using Supabase."
          link="View selected projects"
          stats={[
            "Full-Stack Developer Intern · Jun 2025 – Aug 2025",
            "Badan Riset dan Inovasi Nasional (BRIN) · Indonesia",
            "Web-based research platform, interactive brainstorming, PDF-to-concept-map workflow, Supabase database",
          ]}
        />
        <Superpower
          number="2"
          title="Building smart-contract and frontend projects."
          body="As a Cohort Web3 Developer in the Mancer x Superteam Scholarship, I built smart-contract and frontend projects in the Solana blockchain ecosystem through hands-on learning and mentorship."
          link="View selected projects"
          tone="orange"
          imageSrc="/images/webp/Web3.webp"
          imageAlt="Mancer certificate for Rangga Yovie Saputra's Token Distribution Protocol work trial"
          stats={[
            "Cohort Web3 Developer · Apr 2026 – Jun 2026",
            "Mancer x Superteam Scholarship · Remote",
            "Solana ecosystem, smart-contract development, frontend development",
          ]}
        />
        <Superpower
          number="3"
          title="Supporting research with data analysis."
          body="At the Learning Technology Lab in the Faculty of Computer Science, Universitas Brawijaya, I supported research activities by processing data, conducting basic analyses, and preparing preliminary analysis to help the research team identify and discuss initial findings."
          link="View selected projects"
          tone="green"
          stats={[
            "Data Analyst Intern · Aug 2025 – Dec 2025",
            "Learning Technology Lab, Faculty of Computer Science, Universitas Brawijaya · Malang, East Java",
            "Data processing, basic analysis, preliminary findings",
          ]}
        />
        <Superpower
          number="4"
          title="Contributing through design and organization."
          body="At EM Universitas Brawijaya, I designed Instagram content for the official university account in collaboration with multiple teams and created visual and informational posts for the university community. I also supported logistics and event operations for PK2MB new-student orientation activities."
          link="View selected projects"
          tone="purple"
          imageSrc={[
            "/images/webp/EM_page-0001.webp",
            "/images/webp/Sertif RABRAW_page-0001.webp",
          ]}
          imageAlt="Certificates documenting Rangga Yovie Saputra's EM Universitas Brawijaya and RAJA Brawijaya activities"
          stats={[
            "Expert Staff Member · EM Universitas Brawijaya · 2024–2025",
            "PK2MB Committee Staff · Universitas Brawijaya · 2023",
            "Instagram content, visual and informational posts, logistics, and event operations",
          ]}
        />
        <Playground />
        <footer id="contact">
          <div>
            <b>Rangga Yovie Saputra.</b>
            <span>Full-stack, AI/ML, and Web3 developer.</span>
          </div>
          <div className="footer-icons">
            <a
              href="https://www.linkedin.com/in/rangga-yovie-saputra/"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="linkedin" alt="LinkedIn" />
            </a>
            <a href="mailto:ranggayoviesaputra@gmail.com">
              <Icon name="gmail" alt="Email" />
            </a>
            <a
              className="footer-github-mark"
              href="https://github.com/ranggays"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.16c-3.22.7-3.9-1.55-3.9-1.55-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.74 0-1.27.45-2.3 1.18-3.11-.12-.29-.51-1.47-.11-3.06 0 0 .96-.31 3.16 1.19a10.92 10.92 0 0 1 5.75 0c2.2-1.5 3.16-1.19 3.16-1.19.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.11 0 4.46-2.71 5.44-5.29 5.73.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
                />
              </svg>
            </a>
          </div>
          <div className="footer-links">
            <a href="mailto:ranggayoviesaputra@gmail.com">Email →</a>
            <a
              href="https://www.linkedin.com/in/rangga-yovie-saputra/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn →
            </a>
            <a
              href="https://github.com/ranggays"
              target="_blank"
              rel="noreferrer"
            >
              GitHub →
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
