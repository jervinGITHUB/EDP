import { useMemo, useState } from "react";

type IconName = "search" | "pin" | "bell" | "chevron" | "star" | "clock" | "heart" | "route" | "calendar" | "users" | "dumbbell" | "check" | "menu";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 7l-1.1-1.2a5.5 5.5 0 0 0-7.7 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
    route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h2a3 3 0 0 0 3-3v-5a3 3 0 0 1 3-3h2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    dumbbell: <><path d="m6 7 11 11M4 9l3-3M17 18l3-3M2 11l5-5M17 20l5-5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const gyms = [
  { id: 1, name: "Pulse Fitness Hub", area: "Bonifacio Global City", distance: 0.8, rating: 4.9, reviews: 214, price: 149, open: "Open until 11 PM", tag: "Top rated", image: "https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=900&q=85", x: "62%", y: "31%" },
  { id: 2, name: "The Foundry", area: "Makati City", distance: 1.4, rating: 4.8, reviews: 186, price: 179, open: "Open 24 hours", tag: "24/7 access", image: "https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=900&q=85", x: "35%", y: "57%" },
  { id: 3, name: "Common Ground Athletics", area: "Ortigas Center", distance: 2.3, rating: 4.7, reviews: 98, price: 120, open: "Open until 10 PM", tag: "Best value", image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=85", x: "73%", y: "67%" },
];

const filters = ["All gyms", "Under 1 km", "Open now", "Top rated"];

const adminSections = ["Dashboard", "Applications", "Gyms", "Trainers", "Memberships", "Bookings", "Users", "Reports"] as const;
type AdminSection = typeof adminSections[number];

const adminData: Record<Exclude<AdminSection, "Dashboard" | "Reports">, { headers: string[]; rows: string[][] }> = {
  Gyms: { headers: ["Gym", "Location", "Trainers", "Status"], rows: [["Pulse Fitness Hub", "BGC, Taguig", "6", "Active"], ["The Foundry", "Makati City", "8", "Active"], ["Common Ground Athletics", "Ortigas Center", "5", "Pending"]] },
  Trainers: { headers: ["Trainer", "Specialty", "Gym", "Availability"], rows: [["Mika Reyes", "Strength training", "Pulse Fitness Hub", "Available"], ["David Cruz", "Boxing", "The Foundry", "In session"], ["Ana Lim", "Yoga & mobility", "Common Ground", "Available"]] },
  Memberships: { headers: ["Plan", "Duration", "Price", "Subscribers"], rows: [["Day Pass", "1 day", "₱149", "184"], ["Weekly Fit", "7 days", "₱799", "426"], ["Unlimited", "30 days", "₱2,499", "674"]] },
  Bookings: { headers: ["Customer", "Gym / Trainer", "Schedule", "Status"], rows: [["Alex Morgan", "Pulse Fitness Hub", "May 24 · 2:30 PM", "Confirmed"], ["Jamie Santos", "Mika Reyes", "May 24 · 4:00 PM", "Confirmed"], ["Chris Tan", "The Foundry", "May 25 · 9:00 AM", "Pending"]] },
  Users: { headers: ["Customer", "Email", "Membership", "Status"], rows: [["Alex Morgan", "alex@example.com", "Day Pass", "Active"], ["Jamie Santos", "jamie@example.com", "Unlimited", "Active"], ["Chris Tan", "chris@example.com", "Weekly Fit", "Renewal due"]] },
  Applications: { headers: ["Applicant", "Requested role", "Proof submitted", "Status"], rows: [] },
};

type RoleApplication = { id: number; applicant: string; role: "Trainer" | "Gym Owner"; proof: string; status: "Pending" | "Approved" | "Declined" };

function AdminDashboard({ onExit, applications, onUpdateApplication }: { onExit: () => void; applications: RoleApplication[]; onUpdateApplication: (id: number, status: "Approved" | "Declined") => void }) {
  const [section, setSection] = useState<AdminSection>("Dashboard");
  const [message, setMessage] = useState("");
  const action = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2400);
  };

  return (
    <main className="min-h-screen bg-[#eef1eb] text-[#14231d] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-black/5 bg-[#153c2e] p-4 text-white lg:fixed lg:inset-y-0 lg:w-[250px] lg:border-b-0 lg:p-6">
        <div className="flex items-center justify-between lg:block">
          <div className="flex items-center gap-2.5"><div className="grid size-10 place-items-center rounded-xl bg-[#dff86a] text-[#153c2e]"><Icon name="dumbbell" /></div><div><p className="font-bold">FitMap</p><p className="text-xs text-white/55">Administrator</p></div></div>
          <button onClick={onExit} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold lg:hidden">User app</button>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-1">
          {adminSections.map((item) => <button key={item} onClick={() => setSection(item)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition lg:w-full ${section === item ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{item}</button>)}
        </nav>
        <button onClick={onExit} className="absolute bottom-6 left-6 right-6 hidden rounded-xl border border-white/15 py-3 text-sm font-semibold text-white/75 hover:bg-white/10 lg:block">Back to user app</button>
      </aside>

      <section className="min-w-0 p-5 sm:p-8 lg:col-start-2 lg:p-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Admin console</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{section === "Applications" ? "Role applications" : section === "Gyms" ? "Gym management" : section === "Trainers" ? "Trainer management" : section === "Memberships" ? "Membership management" : section === "Bookings" ? "Booking management" : section === "Users" ? "User management" : section === "Reports" ? "Reports & analytics" : "Dashboard"}</h1></div>
          <button onClick={() => action("No new critical alerts.")} className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-sm"><Icon name="bell" className="size-5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-[#f27c54]" /></button>
        </header>

        {section === "Dashboard" && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[["₱684,320", "Monthly revenue", "+12.4%"], ["1,284", "Active members", "+8.2%"], ["342", "Total bookings", "+18.7%"], ["19", "Partner gyms", "+2 this month"]].map(([value, label, change]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#718078]">{label}</p><p className="mt-3 text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-3 text-xs font-semibold text-[#4c8069]">{change}</p></article>)}
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Booking activity</h2><p className="mt-1 text-xs text-[#718078]">Last 7 days</p></div><button onClick={() => setSection("Reports")} className="text-xs font-semibold text-[#3f705b]">View report</button></div><div className="mt-8 flex h-48 items-end gap-3">{[48, 62, 43, 78, 66, 92, 76].map((height, i) => <div key={i} className="flex flex-1 flex-col items-center gap-2"><div style={{ height: `${height}%` }} className="w-full max-w-10 rounded-t-lg bg-[#dff86a]" /><span className="text-[10px] text-[#819088]">{["M", "T", "W", "T", "F", "S", "S"][i]}</span></div>)}</div></article>
            <article className="rounded-3xl bg-[#153c2e] p-6 text-white shadow-sm"><h2 className="text-lg font-semibold">System health</h2><div className="mt-6 space-y-5">{[["Database", "Operational"], ["Booking service", "Operational"], ["Location API", "Operational"], ["Notifications", "Operational"]].map(([name, status]) => <div key={name} className="flex items-center justify-between"><span className="text-sm text-white/65">{name}</span><span className="flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-[#dff86a]" />{status}</span></div>)}</div></article>
          </div>
          <article className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Recent bookings</h2><button onClick={() => setSection("Bookings")} className="text-xs font-semibold text-[#3f705b]">Manage all</button></div><div className="space-y-1">{adminData.Bookings.rows.map((row) => <div key={row[0]} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl px-3 py-3 hover:bg-[#f4f6f1]"><div><p className="text-sm font-semibold">{row[0]}</p><p className="mt-0.5 text-xs text-[#718078]">{row[1]} · {row[2]}</p></div><span className="rounded-full bg-[#edf3d1] px-3 py-1 text-xs font-semibold">{row[3]}</span></div>)}</div></article>
        </>}

        {section !== "Dashboard" && section !== "Reports" && <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-black/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex h-11 max-w-sm flex-1 items-center gap-2 rounded-xl bg-[#f1f3ef] px-3"><Icon name="search" className="size-4 text-[#718078]" /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder={`Search ${section.toLowerCase()}...`} /></label>
            {section !== "Applications" ? <button onClick={() => action(`New ${section.slice(0, -1).toLowerCase()} form opened.`)} className="rounded-xl bg-[#153c2e] px-4 py-3 text-sm font-semibold text-white">Add new {section.slice(0, -1).toLowerCase()}</button> : <span className="rounded-full bg-[#fff1cb] px-3 py-2 text-xs font-semibold text-[#7a5a14]">{applications.filter((item) => item.status === "Pending").length} awaiting review</span>}
          </div>
          {section !== "Applications" && <div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left"><thead><tr>{adminData[section].headers.map((header) => <th key={header} className="border-b border-black/5 px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#718078]">{header}</th>)}<th className="border-b border-black/5 px-5 py-4" /></tr></thead><tbody>{adminData[section].rows.map((row) => <tr key={row[0]} className="hover:bg-[#f8f9f6]">{row.map((cell, i) => <td key={cell} className={`border-b border-black/5 px-5 py-4 text-sm ${i === 0 ? "font-semibold" : "text-[#637169]"}`}>{cell}</td>)}<td className="border-b border-black/5 px-5 py-4 text-right"><button onClick={() => action(`${row[0]} is ready to edit.`)} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold">Manage</button></td></tr>)}</tbody></table></div>}
          {section === "Applications" && <div className="p-5">
            {applications.length === 0 ? <div className="rounded-2xl border border-dashed border-black/15 p-10 text-center"><p className="font-semibold">No role applications yet</p><p className="mt-2 text-sm text-[#718078]">Trainer and Gym Owner requests will appear here after submission.</p></div> : <div className="space-y-3">{applications.map((item) => <article key={item.id} className="rounded-2xl border border-black/5 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-semibold">{item.applicant}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${item.status === "Approved" ? "bg-[#e7f1b2] text-[#345442]" : item.status === "Declined" ? "bg-[#ffe2dc] text-[#8b3f31]" : "bg-[#fff1cb] text-[#7a5a14]"}`}>{item.status}</span></div><p className="mt-1 text-sm text-[#637169]">Requests <b>{item.role}</b> access · {item.proof}</p></div><div className="flex gap-2">{item.status === "Pending" ? <><button onClick={() => { onUpdateApplication(item.id, "Declined"); action(`${item.applicant}'s request was declined.`); }} className="rounded-xl border border-[#d66d58]/30 px-4 py-2.5 text-xs font-semibold text-[#9c4938]">Decline</button><button onClick={() => { onUpdateApplication(item.id, "Approved"); action(`${item.applicant} is now an approved ${item.role}.`); }} className="rounded-xl bg-[#153c2e] px-4 py-2.5 text-xs font-semibold text-white">Approve</button></> : <button onClick={() => action(`${item.applicant}'s submitted proofs opened.`)} className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold">View proofs</button>}</div></div></article>)}</div>}
          </div>}
        </div>}

        {section === "Reports" && <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><article className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Revenue by membership</h2><div className="mt-8 space-y-5">{[["Monthly", "58%", "bg-[#153c2e]"], ["Weekly", "27%", "bg-[#78a48d]"], ["Daily", "15%", "bg-[#dff86a]"]].map(([name, value, color]) => <div key={name}><div className="mb-2 flex justify-between text-sm"><span>{name}</span><b>{value}</b></div><div className="h-3 overflow-hidden rounded-full bg-[#edf0ea]"><div style={{ width: value }} className={`h-full rounded-full ${color}`} /></div></div>)}</div></article><article className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Generate report</h2><p className="mt-2 text-sm leading-6 text-[#718078]">Export current platform data for management review.</p><div className="mt-5 space-y-2">{["Membership summary", "Booking performance", "Customer analytics", "Trainer schedules"].map((report) => <button onClick={() => action(`${report} PDF generated.`)} key={report} className="flex w-full items-center justify-between rounded-xl border border-black/5 p-3 text-left text-sm font-semibold hover:bg-[#f4f6f1]">{report}<span>Download</span></button>)}</div></article></div>}
      </section>
      {message && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#14231d] px-5 py-3 text-sm font-semibold text-white shadow-xl">{message}</div>}
    </main>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All gyms");
  const [selected, setSelected] = useState(1);
  const [saved, setSaved] = useState<number[]>([]);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [signedIn, setSignedIn] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [panel, setPanel] = useState<"bookings" | "memberships" | "notifications" | "profile" | null>(null);
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState<"Recommended" | "Nearest first">("Recommended");
  const [adminMode, setAdminMode] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [applicationRole, setApplicationRole] = useState<"Trainer" | "Gym Owner">("Trainer");
  const [applicationSent, setApplicationSent] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [roleApplications, setRoleApplications] = useState<RoleApplication[]>([]);
  const [activeNav, setActiveNav] = useState("home");
  const [gymDetails, setGymDetails] = useState<number | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [ownerGymLocation, setOwnerGymLocation] = useState({ x: 58, y: 43, address: "32nd Street, Bonifacio Global City, Taguig" });
  const [roleDashboardOpen, setRoleDashboardOpen] = useState(false);
  const [trainerDetails, setTrainerDetails] = useState<string | null>(null);
  const [trainerRequests, setTrainerRequests] = useState([
    { id: 1, client: "Nicole Garcia", session: "Strength assessment", schedule: "May 28 · 10:00 AM", status: "Pending" },
    { id: 2, client: "Paolo Reyes", session: "Personal training", schedule: "May 29 · 3:30 PM", status: "Pending" },
  ]);
  const [membershipCheckout, setMembershipCheckout] = useState<{ gym: string; plan: string; price: string } | null>(null);
  const [activeMembership, setActiveMembership] = useState<{ gym: string; plan: string; price: string } | null>(null);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const enterRolePreview = (role: "Member" | "Trainer" | "Gym Owner" | "Admin") => {
    setAuthOpen(false);
    setSignedIn(true);
    setPanel(null);
    if (role === "Admin") {
      setAdminMode(true);
      return;
    }
    setAdminMode(false);
    if (role === "Member") {
      setRoleApplications([]);
      setApplicationSent(false);
      notify("Member preview loaded.");
      return;
    }
    setApplicationRole(role);
    setApplicationSent(true);
    setRoleApplications([{ id: Date.now(), applicant: "Alex Morgan", role, proof: "Preview credentials", status: "Approved" }]);
    setRoleDashboardOpen(true);
    notify(`${role} preview loaded.`);
  };

  const visible = useMemo(() => gyms.filter((gym) => {
    const matches = `${gym.name} ${gym.area}`.toLowerCase().includes(query.toLowerCase());
    if (filter === "Under 1 km") return matches && gym.distance < 1;
    if (filter === "Top rated") return matches && gym.rating >= 4.8;
    return matches;
  }), [query, filter]);
  const approvedProfessionalRole = roleApplications[roleApplications.length - 1]?.status === "Approved" ? applicationRole : null;

  if (adminMode) return <AdminDashboard onExit={() => setAdminMode(false)} applications={roleApplications} onUpdateApplication={(id, status) => setRoleApplications((items) => items.map((item) => item.id === id ? { ...item, status } : item))} />;

  return (
    <main className={`min-h-screen bg-[#f7f8f4] text-[#14231d] transition-[padding] duration-300 ${!signedIn || sidebarHidden ? "lg:pl-0" : "lg:pl-[248px]"}`}>
      {signedIn && <aside className={`fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#102c22] p-6 text-white transition-transform duration-300 lg:flex ${sidebarHidden ? "-translate-x-full" : "translate-x-0"}`}>
        <div className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-[#dff86a] text-[#153c2e]"><Icon name="dumbbell" /></div>
          <div><p className="text-xl font-bold tracking-[-0.04em]">FitMap</p><p className="text-[10px] uppercase tracking-wider text-white/45">{approvedProfessionalRole ? `${approvedProfessionalRole} account` : "Member portal"}</p></div>
        </div>
        <nav className="mt-10 space-y-1">
          <button onClick={() => { setActiveNav("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "home" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>Home</button>
          {approvedProfessionalRole && <button onClick={() => { setActiveNav("workspace"); setRoleDashboardOpen(true); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "workspace" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{approvedProfessionalRole === "Trainer" ? "Trainer workspace" : "Gym Owner workspace"}</button>}
          <button onClick={() => { setActiveNav("gyms"); document.getElementById("gyms")?.scrollIntoView({ behavior: "smooth" }); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "gyms" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>Find gyms</button>
          <button onClick={() => { setActiveNav("trainers"); document.getElementById("trainers")?.scrollIntoView({ behavior: "smooth" }); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "trainers" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>Trainers</button>
          <button onClick={() => { setActiveNav("memberships"); setPanel("memberships"); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "memberships" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>Memberships</button>
          <button onClick={() => { setActiveNav("bookings"); signedIn ? setPanel("bookings") : setAuthOpen(true); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "bookings" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>My bookings</button>
          <button onClick={() => { setActiveNav("about"); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "about" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>About FitMap</button>
          <button onClick={() => { setActiveNav("reports"); setReportsOpen(true); }} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "reports" ? "bg-[#dff86a] text-[#153c2e]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>Reports</button>
        </nav>
        <div className="mt-auto space-y-2 border-t border-white/10 pt-5">
          <button onClick={() => { setActiveNav("partner"); signedIn ? setApplicationOpen(true) : setAuthOpen(true); }} className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${activeNav === "partner" ? "border-[#dff86a] bg-[#dff86a] text-[#153c2e]" : "border-white/15 text-white/80 hover:bg-white/10"}`}>Become a partner</button>
          <button onClick={() => setAdminMode(true)} className="w-full rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white">Administrator portal</button>
        </div>
      </aside>}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f8f4]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center gap-8 px-5 lg:px-10">
          <div className={`items-center gap-2.5 ${signedIn ? "flex lg:hidden" : "flex"}`}>
            <div className="grid size-10 place-items-center rounded-xl bg-[#153c2e] text-[#dff86a]"><Icon name="dumbbell" /></div>
            <span className="text-xl font-bold tracking-[-0.04em]">FitMap</span>
          </div>
          {signedIn && <button onClick={() => setSidebarHidden((value) => !value)} aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"} className="hidden size-10 place-items-center rounded-xl border border-black/10 bg-white shadow-sm hover:bg-[#eef1eb] lg:grid">
            <Icon name="menu" className="size-5" />
          </button>}
          {signedIn ? <div className="hidden items-center gap-3 lg:flex"><p className="text-sm text-[#68766f]">{approvedProfessionalRole === "Trainer" ? "Manage bookings, clients, schedules, and ratings." : approvedProfessionalRole === "Gym Owner" ? "Manage your gym, memberships, trainers, and customers." : "Discover gyms, trainers, and memberships near you."}</p><span className="rounded-full bg-[#fff1cb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7a5a14]">Preview data</span></div> : <nav className="ml-auto hidden items-center gap-7 text-sm font-medium lg:flex"><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button><button onClick={() => document.getElementById("gyms")?.scrollIntoView({ behavior: "smooth" })} className="text-[#68766f] hover:text-[#153c2e]">Gyms</button><button onClick={() => document.getElementById("trainers")?.scrollIntoView({ behavior: "smooth" })} className="text-[#68766f] hover:text-[#153c2e]">Trainers</button><button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className="text-[#68766f] hover:text-[#153c2e]">About</button></nav>}
          <div className="ml-auto flex items-center gap-3">
            {signedIn && <button onClick={() => setPanel("notifications")} aria-label="Notifications" className="relative grid size-10 place-items-center rounded-full border border-black/10 bg-white hover:bg-[#eef1eb]">
              <Icon name="bell" className="size-4.5" /><span className="absolute right-2 top-2 size-2 rounded-full bg-[#f27c54] ring-2 ring-white" />
            </button>}
            {!signedIn && <button onClick={() => { setAuthMode("register"); setAuthOpen(true); }} className="hidden rounded-full bg-[#153c2e] px-5 py-2.5 text-sm font-semibold text-white sm:block">Register</button>}
            <button onClick={() => signedIn ? setPanel("profile") : (setAuthMode("login"), setAuthOpen(true))} className="flex items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold">
              <span className="grid size-8 place-items-center rounded-full bg-[#e4efb1] text-xs">{signedIn ? approvedProfessionalRole === "Trainer" ? "TR" : approvedProfessionalRole === "Gym Owner" ? "GO" : "AM" : "IN"}</span>
              <span className="hidden sm:inline">{signedIn ? approvedProfessionalRole ?? "Alex Morgan" : "Sign in"}</span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#09140f] text-white">
        <img src="https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=1800&q=88" alt="Modern fitness center interior" className="absolute inset-0 size-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110d] via-[#07110d]/90 to-[#07110d]/25" />
        <div className="relative mx-auto grid min-h-[590px] max-w-[1500px] items-center px-5 py-16 lg:grid-cols-[1fr_.7fr] lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#dff86a]">Fitness, made easier</p>
            <h1 className="text-5xl font-semibold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Find gyms.<br />Book trainers.<br /><span className="text-[#dff86a]">Reach your goals.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/65">Discover quality fitness centers near you, compare qualified trainers, and choose the membership that fits your routine—all in one place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => document.getElementById("gyms")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 rounded-xl bg-[#dff86a] px-5 py-3.5 text-sm font-bold text-[#153c2e]">Find gyms near me <Icon name="pin" className="size-4" /></button>
              <button onClick={() => setAuthOpen(true)} className="rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-semibold backdrop-blur">Create free account</button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-white/60"><span><b className="block text-xl text-white">19+</b>Partner gyms</span><span><b className="block text-xl text-white">48</b>Expert trainers</span><span><b className="block text-xl text-white">4.8</b>Average rating</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-12 lg:px-10 lg:py-16">
        <div className="mb-8 text-center"><p className="text-sm font-semibold text-[#59806f]">YOUR FITNESS JOURNEY</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">How FitMap works</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[["01", "Find gyms", "Discover quality gyms near your location."], ["02", "Choose a trainer", "Compare specialties and availability."], ["03", "Book & subscribe", "Reserve a trainer and select a plan."], ["04", "Pay securely", "Complete your reservation online."], ["05", "Get confirmed", "Receive instant booking confirmation."]].map(([number, title, description]) => <article key={number} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-xl bg-[#edf3d1] text-xs font-bold text-[#3f705b]">{number}</span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#718078]">{description}</p></article>)}
        </div>
      </section>

      <section id="gyms" className="mx-auto max-w-[1500px] scroll-mt-24 px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#59806f]">SMART GYM LOCATOR</p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">Find your space.<br />Start your strongest chapter.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#68766f]">Explore top-rated gyms near you, meet expert trainers, and book your next session in minutes.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); document.getElementById("gym-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 shadow-sm focus-within:border-[#59806f] focus-within:ring-2 focus-within:ring-[#dff86a]/60">
            <Icon name="search" className="size-5 text-[#6f7c76]" />
            <input list="gym-search-options" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a958f]" placeholder="Search gym, neighborhood, or city" />
            <datalist id="gym-search-options">{gyms.flatMap((gym) => [<option key={gym.name} value={gym.name} />, <option key={gym.area} value={gym.area} />])}</datalist>
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f0f2ed] text-sm font-semibold">×</button>}
          </label>
          <button type="submit" className="h-14 rounded-2xl bg-[#dff86a] px-6 text-sm font-bold text-[#153c2e] hover:bg-[#d6ef61] sm:w-auto">Search gyms</button>
          <button type="button" onClick={() => {
            if (!navigator.geolocation) return notify("Location is unavailable in this browser.");
            navigator.geolocation.getCurrentPosition(() => { setQuery(""); setFilter("All gyms"); notify("Location updated — showing gyms near BGC."); document.getElementById("gym-results")?.scrollIntoView({ behavior: "smooth" }); }, () => notify("Location access was not granted."));
          }} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#153c2e] px-5 text-sm font-semibold text-white hover:bg-[#1c4b3a] sm:w-auto">
            <Icon name="pin" className="size-4.5 text-[#dff86a]" /> Use my location
          </button>
        </form>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${filter === item ? "bg-[#dff86a] text-[#153c2e]" : "border border-black/10 bg-white text-[#64716a] hover:border-[#153c2e]"}`}>{item}</button>)}
        </div>

        <div id="gym-results" className="scroll-mt-28 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(500px,0.95fr)]">
          <div className="order-2 xl:order-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">{visible.length} gyms near you</p>
              <button onClick={() => setSortBy((value) => value === "Recommended" ? "Nearest first" : "Recommended")} className="flex items-center gap-1 text-sm font-medium text-[#68766f]">{sortBy} <Icon name="chevron" className="size-4 rotate-90" /></button>
            </div>
            <div className="space-y-4">
              {[...visible].sort((a, b) => sortBy === "Nearest first" ? a.distance - b.distance : b.rating - a.rating).map((gym) => (
                <article onClick={() => setSelected(gym.id)} key={gym.id} className={`group grid cursor-pointer gap-4 rounded-3xl border bg-white p-3 transition sm:grid-cols-[220px_1fr] ${selected === gym.id ? "border-[#153c2e] shadow-[0_12px_35px_rgba(21,60,46,.10)]" : "border-black/5 hover:border-black/15"}`}>
                  <div className="relative h-48 overflow-hidden rounded-2xl sm:h-full">
                    <img src={gym.image} alt={`${gym.name} gym interior`} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur">{gym.tag}</span>
                    <button onClick={(e) => { e.stopPropagation(); setSaved((v) => v.includes(gym.id) ? v.filter((id) => id !== gym.id) : [...v, gym.id]); }} aria-label="Save gym" className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full backdrop-blur ${saved.includes(gym.id) ? "bg-[#dff86a] text-[#153c2e]" : "bg-white/90"}`}><Icon name="heart" className={`size-4 ${saved.includes(gym.id) ? "fill-current" : ""}`} /></button>
                  </div>
                  <div className="flex min-w-0 flex-col p-2 sm:py-3 sm:pr-3">
                    <div className="flex items-start justify-between gap-3">
                      <div><h2 className="text-xl font-semibold tracking-[-0.025em]">{gym.name}</h2><p className="mt-1 text-sm text-[#6e7a74]">{gym.area} · {gym.distance} km away</p></div>
                      <div className="flex items-center gap-1 text-sm font-semibold"><Icon name="star" className="size-4 fill-[#f4bd50] stroke-[#f4bd50]" />{gym.rating}<span className="font-normal text-[#8a958f]">({gym.reviews})</span></div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#526159]">
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f1f3ef] px-3 py-1.5"><Icon name="clock" className="size-3.5" /> {gym.open}</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[#f1f3ef] px-3 py-1.5"><Icon name="users" className="size-3.5" /> 6 trainers</span>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-6">
                      <p><span className="text-xl font-bold">₱{gym.price}</span><span className="text-sm text-[#77837c]"> / day</span></p>
                      <button onClick={(e) => { e.stopPropagation(); setSelected(gym.id); setGymDetails(gym.id); }} className="rounded-xl bg-[#153c2e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4d3b]">View details</button>
                    </div>
                  </div>
                </article>
              ))}
              {visible.length === 0 && <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center text-[#68766f]">No gyms match your search. Try another area.</div>}
            </div>
          </div>

          <div className="order-1 h-[470px] overflow-hidden rounded-3xl border border-black/5 bg-[#dfe8dc] shadow-sm xl:sticky xl:top-28 xl:order-2 xl:h-[calc(100vh-9rem)]">
            <div className="map-grid relative size-full overflow-hidden">
              <div className="absolute inset-0 opacity-70">
                <span className="road absolute left-[-10%] top-[27%] h-3 w-[120%] rotate-[-8deg]" />
                <span className="road absolute left-[-10%] top-[62%] h-4 w-[120%] rotate-[12deg]" />
                <span className="road absolute left-[47%] top-[-10%] h-[120%] w-3 rotate-[20deg]" />
                <span className="road absolute left-[18%] top-[-10%] h-[120%] w-2 rotate-[-15deg]" />
              </div>
              <div className="absolute left-5 top-5 rounded-xl bg-white/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur">Bonifacio Global City</div>
              {visible.map((gym) => <button key={gym.id} onClick={() => setSelected(gym.id)} style={{ left: gym.x, top: gym.y }} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-bold shadow-lg transition hover:-translate-y-[55%] ${selected === gym.id ? "z-10 bg-[#153c2e] text-white ring-4 ring-[#dff86a]/50" : "bg-white text-[#153c2e]"}`}>₱{gym.price}</button>)}
              {visible.length === 0 && <div className="absolute left-1/2 top-1/2 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-5 text-center shadow-lg"><p className="font-semibold">No map results</p><p className="mt-1 text-xs text-[#718078]">Clear your search or try a nearby city.</p></div>}
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-semibold shadow-lg"><span className="size-2.5 rounded-full bg-[#3e8b70] ring-4 ring-[#3e8b70]/20" /> You are here</div>
              <button onClick={() => notify("Route preview enabled. Select a gym pin for directions.")} aria-label="Show route" className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white shadow-lg"><Icon name="route" className="size-5" /></button>
            </div>
          </div>
        </div>
      </section>

      <section id="trainers" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-[#59806f]">EXPERT GUIDANCE</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">Popular trainers</h2></div><p className="max-w-md text-sm leading-6 text-[#718078]">Meet qualified coaches who can help turn your fitness goals into a practical, sustainable plan.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Coach Michael Reyes", "Strength & conditioning", "4.9", "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?auto=format&fit=crop&w=700&q=85"],
              ["Coach David Cruz", "Bodybuilding specialist", "4.8", "https://images.unsplash.com/photo-1585892478508-130c50eb7a69?auto=format&fit=crop&w=700&q=85"],
              ["Coach Marco Santos", "Functional fitness", "4.9", "https://images.unsplash.com/photo-1738523686578-f18348c8292b?auto=format&fit=crop&w=700&q=85"],
              ["Coach Luis Mendoza", "HIIT & mobility", "4.7", "https://images.unsplash.com/photo-1708011108842-30966718105a?auto=format&fit=crop&w=700&q=85"],
            ].map(([name, specialty, rating, image]) => <article key={name} className="overflow-hidden rounded-3xl border border-black/5 bg-[#f7f8f4]"><div className="h-56 overflow-hidden"><img src={image} alt={`${name}, ${specialty}`} className="size-full object-cover object-top transition duration-500 hover:scale-105" /></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{name}</h3><p className="mt-1 text-xs text-[#718078]">{specialty}</p></div><span className="flex items-center gap-1 text-sm font-bold"><Icon name="star" className="size-3.5 fill-[#f4bd50] stroke-[#f4bd50]" />{rating}</span></div><button onClick={() => setTrainerDetails(name)} className="mt-5 w-full rounded-xl bg-[#153c2e] py-3 text-sm font-semibold text-white">View profile & schedule</button></div></article>)}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 border-t border-black/5 bg-[#153c2e] text-white">
        <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#dff86a]">Why FitMap exists</p>
              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">Fitness discovery should feel effortless, not outdated.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/65">FitMap brings gyms, qualified trainers, flexible memberships, and online reservations into one accessible platform—removing the need to visit multiple fitness centers just to compare services and pricing.</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Discover nearby gyms", "Use location-based search and an interactive map to compare quality facilities, services, distance, and availability."],
              ["02", "Book with confidence", "Explore trainer qualifications and specialties, reserve preferred schedules, and receive automated confirmation online."],
              ["03", "Join on your terms", "Choose daily, weekly, or monthly plans and manage memberships without lengthy in-person registration."],
            ].map(([number, title, description]) => <article key={number} className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"><span className="text-sm font-bold text-[#dff86a]">{number}</span><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/60">{description}</p></article>)}
          </div>

          <div className="mt-5 grid overflow-hidden rounded-3xl bg-[#dff86a] text-[#153c2e] lg:grid-cols-[1fr_1.2fr]">
            <div className="p-7 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-wider text-[#4f705f]">Built for fitness businesses</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">One system for smoother operations.</h3>
              <p className="mt-4 text-sm leading-6 text-[#466354]">Gym owners gain a centralized workspace for managing profiles, trainers, packages, reservations, customer records, and performance reports.</p>
              {signedIn ? <button onClick={() => setAdminMode(true)} className="mt-7 flex items-center gap-2 rounded-xl bg-[#153c2e] px-5 py-3 text-sm font-semibold text-white">Explore admin portal <Icon name="chevron" className="size-4" /></button> : <button onClick={() => { setAuthMode("register"); setAuthOpen(true); }} className="mt-7 flex items-center gap-2 rounded-xl bg-[#153c2e] px-5 py-3 text-sm font-semibold text-white">Join FitMap <Icon name="chevron" className="size-4" /></button>}
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#153c2e]/15">
              {[["19", "Partner gyms"], ["48", "Qualified trainers"], ["1.2K+", "Active members"], ["342", "Monthly bookings"]].map(([value, label]) => <div key={label} className="grid min-h-32 place-content-center bg-[#dff86a] p-5 text-center"><p className="text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-1 text-xs font-medium text-[#557060]">{label}</p></div>)}
            </div>
          </div>

          <footer className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-white"><div className="grid size-8 place-items-center rounded-lg bg-[#dff86a] text-[#153c2e]"><Icon name="dumbbell" className="size-4" /></div><span className="font-bold">FitMap</span></div>
            <p>Connecting people, trainers, and fitness centers through smarter technology.</p>
          </footer>
        </div>
      </section>

      {booking && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#0d2119]/45 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setBooking(false)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            {!confirmed ? <>
              <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Quick booking</p><h2 className="mt-1 text-2xl font-semibold">{gyms.find(g => g.id === selected)?.name}</h2></div><button onClick={() => setBooking(false)} className="grid size-9 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button></div>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-2xl border border-black/10 p-4 text-left"><span className="flex items-center gap-3"><Icon name="calendar" /><span><b className="block text-sm">Tomorrow, May 24</b><small className="text-[#718078]">Choose another date</small></span></span><Icon name="chevron" className="size-4" /></button>
                <div className="grid grid-cols-3 gap-2">{["9:00 AM", "2:30 PM", "6:00 PM"].map((time, i) => <button key={time} className={`rounded-xl py-3 text-sm font-semibold ${i === 1 ? "bg-[#dff86a]" : "border border-black/10"}`}>{time}</button>)}</div>
              </div>
              <button onClick={() => setConfirmed(true)} className="mt-6 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Confirm booking · ₱{gyms.find(g => g.id === selected)?.price}</button>
            </> : <div className="py-8 text-center"><div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-[#dff86a]"><Icon name="check" className="size-8" /></div><h2 className="text-2xl font-semibold">You’re all set!</h2><p className="mt-2 text-sm leading-6 text-[#68766f]">Your gym pass is confirmed for tomorrow at 2:30 PM. We’ve sent the details to your account.</p><button onClick={() => { setBooking(false); setConfirmed(false); }} className="mt-6 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Done</button></div>}
          </section>
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#0d2119]/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setAuthOpen(false)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-[#153c2e] text-[#dff86a]"><Icon name="dumbbell" /></div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Welcome to FitMap</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{authMode === "login" ? "Good to see you again." : "Start your fitness journey."}</h2>
              </div>
              <button onClick={() => setAuthOpen(false)} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button>
            </div>
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f0f2ed] p-1">
              <button onClick={() => setAuthMode("login")} className={`rounded-lg py-2.5 text-sm font-semibold ${authMode === "login" ? "bg-white shadow-sm" : "text-[#718078]"}`}>Login</button>
              <button onClick={() => setAuthMode("register")} className={`rounded-lg py-2.5 text-sm font-semibold ${authMode === "register" ? "bg-white shadow-sm" : "text-[#718078]"}`}>Register</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSignedIn(true); setAuthOpen(false); }} className="space-y-4">
              {authMode === "register" && <label className="block"><span className="mb-1.5 block text-sm font-semibold">Full name</span><input required placeholder="Enter your full name" className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f] focus:ring-2 focus:ring-[#dff86a]" /></label>}
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">Email address</span><input required type="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f] focus:ring-2 focus:ring-[#dff86a]" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><input required minLength={8} type="password" placeholder="At least 8 characters" className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f] focus:ring-2 focus:ring-[#dff86a]" /></label>
              {authMode === "register" && <label className="flex items-start gap-2 text-xs leading-5 text-[#68766f]"><input required type="checkbox" className="mt-1 accent-[#153c2e]" /> I agree to the Terms of Service and Privacy Policy.</label>}
              {authMode === "login" && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-[#68766f]"><input type="checkbox" className="accent-[#153c2e]" /> Remember me</label><button onClick={() => notify("Password reset link sent to your email.")} type="button" className="font-semibold text-[#356650]">Forgot password?</button></div>}
              <button type="submit" className="w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white hover:bg-[#1d4d3b]">{authMode === "login" ? "Secure login" : "Create my account"}</button>
            </form>
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#8b5b20]"><span className="size-2 rounded-full bg-[#e2a441]" /> Preview only — do not enter real passwords or personal information</div>
            <div className="mt-6 border-t border-black/5 pt-5">
              <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Role preview</p><p className="mt-1 text-xs text-[#718078]">Frontend-only test access; no real authentication or payments.</p></div><span className="rounded-full bg-[#fff1cb] px-2 py-1 text-[10px] font-bold text-[#7a5a14]">DEMO</span></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(["Member", "Trainer", "Gym Owner", "Admin"] as const).map((role) => <button type="button" onClick={() => enterRolePreview(role)} key={role} className="rounded-xl border border-black/10 px-3 py-3 text-xs font-semibold hover:border-[#59806f] hover:bg-[#f7f8f4]">Continue as {role}</button>)}
              </div>
            </div>
          </section>
        </div>
      )}

      {reportsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#0d2119]/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setReportsOpen(false)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-t-3xl bg-[#f7f8f4] p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="mb-7 flex items-start justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Admin tools</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Reports center</h2><p className="mt-2 text-sm text-[#68766f]">A live overview of memberships, bookings, and customers.</p></div>
              <button onClick={() => setReportsOpen(false)} className="grid size-9 place-items-center rounded-full bg-white text-lg">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["1,284", "Members"], ["342", "Bookings"], ["48", "Trainers"], ["₱684K", "Revenue"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-white p-4"><p className="text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-xs text-[#718078]">{label} this month</p></div>)}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl bg-white">
              {["Membership performance", "Trainer schedules", "Customer statistics"].map((report, i) => <div key={report} className="flex items-center justify-between border-b border-black/5 p-4 last:border-0"><div><p className="text-sm font-semibold">{report}</p><p className="mt-1 text-xs text-[#7a867f]">Updated {i === 0 ? "just now" : `${i + 1} hours ago`}</p></div><button onClick={() => notify(`${report} report generated successfully.`)} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold hover:bg-[#f0f2ed]">Generate PDF</button></div>)}
            </div>
          </section>
        </div>
      )}

      {panel && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#0d2119]/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setPanel(null)}>
          <section onMouseDown={(e) => e.stopPropagation()} className={`w-full rounded-t-3xl bg-[#f7f8f4] p-6 shadow-2xl sm:rounded-3xl sm:p-8 ${panel === "memberships" ? "max-w-3xl" : "max-w-xl"}`}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">FitMap account</p>
                <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">
                  {panel === "bookings" ? "My bookings" : panel === "memberships" ? "Membership plans" : panel === "notifications" ? "Notifications" : "My profile"}
                </h2>
              </div>
              <button onClick={() => setPanel(null)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-white text-lg">×</button>
            </div>

            {panel === "bookings" && <div className="rounded-2xl bg-white p-5"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-[#e7f1b2] px-2.5 py-1 text-xs font-bold text-[#345442]">CONFIRMED</span><h3 className="mt-3 text-lg font-semibold">Pulse Fitness Hub</h3><p className="mt-1 text-sm text-[#718078]">Tomorrow · 2:30 PM · Day pass</p></div><button onClick={() => notify("Booking added to your calendar.")} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold">Add to calendar</button></div><button onClick={() => { setPanel(null); setBooking(true); }} className="mt-5 w-full rounded-xl bg-[#153c2e] py-3 text-sm font-semibold text-white">Manage booking</button></div>}

            {panel === "memberships" && <div>
              {activeMembership && <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#edf3d1] p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Active membership</p><p className="mt-1 font-semibold">{activeMembership.gym} · {activeMembership.plan}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#345442]">Active</span></div>}
              <div className="space-y-4">{gyms.map((gym, gymIndex) => <article key={gym.id} className="overflow-hidden rounded-2xl bg-white"><div className="flex items-center gap-3 border-b border-black/5 p-4"><img src={gym.image} alt="" className="size-14 rounded-xl object-cover" /><div className="min-w-0"><h3 className="truncate font-semibold">{gym.name}</h3><p className="mt-1 text-xs text-[#718078]">{gym.area} · {gym.rating} rating</p></div></div><div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">{[["Daily", `₱${gym.price}`], ["Weekly", `₱${gymIndex === 0 ? "799" : gymIndex === 1 ? "899" : "699"}`], ["Monthly", `₱${gymIndex === 0 ? "2,499" : gymIndex === 1 ? "2,799" : "2,199"}`], ["Yearly", `₱${gymIndex === 0 ? "24,990" : gymIndex === 1 ? "27,990" : "21,990"}`]].map(([plan, price]) => <button onClick={() => setMembershipCheckout({ gym: gym.name, plan, price })} key={plan} className="rounded-xl border border-black/5 p-3 text-left hover:border-[#59806f] hover:bg-[#f7f8f4]"><span className="block text-xs font-semibold">{plan}</span><span className="mt-1 block text-sm font-bold">{price}</span></button>)}</div></article>)}</div>
            </div>}

            {panel === "notifications" && <div className="space-y-2">{[["Booking confirmed", "Your Pulse Fitness Hub pass is ready.", "Just now"], ["New gym nearby", "The Foundry is now available in Makati.", "2h"], ["Membership offer", "Save 23% on a weekly fitness pass.", "Yesterday"]].map(([title, body, time]) => <button onClick={() => notify(`Opened: ${title}`)} key={title} className="flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left"><span className="mt-1 size-2 rounded-full bg-[#f27c54]" /><span className="flex-1"><b className="block text-sm">{title}</b><span className="mt-1 block text-xs text-[#718078]">{body}</span></span><small className="text-[#88938d]">{time}</small></button>)}</div>}

            {panel === "profile" && <div className="rounded-2xl bg-white p-5"><div className="flex items-center gap-4"><span className="grid size-14 place-items-center rounded-full bg-[#e4efb1] font-bold">AM</span><div><h3 className="font-semibold">Alex Morgan</h3><p className="text-sm text-[#718078]">alex.morgan@example.com</p><span className="mt-2 inline-block rounded-full bg-[#eef1eb] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{roleApplications[roleApplications.length - 1]?.status === "Approved" ? applicationRole : "Member"}</span></div></div>{applicationSent && <div className={`mt-5 rounded-xl p-3 text-xs font-medium ${roleApplications[roleApplications.length - 1]?.status === "Approved" ? "bg-[#edf3d1] text-[#345442]" : roleApplications[roleApplications.length - 1]?.status === "Declined" ? "bg-[#ffe2dc] text-[#8b3f31]" : "bg-[#fff5d9] text-[#765a1c]"}`}>{applicationRole} application status: {roleApplications[roleApplications.length - 1]?.status ?? "Pending"}.</div>}<div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => notify("Profile editing enabled.")} className="rounded-xl border border-black/10 py-3 text-sm font-semibold">Edit profile</button><button onClick={() => { setPanel(null); setApplicationOpen(true); }} className="rounded-xl border border-black/10 py-3 text-sm font-semibold">Request role</button>{roleApplications[roleApplications.length - 1]?.status === "Approved" && <button onClick={() => { setPanel(null); setRoleDashboardOpen(true); }} className="col-span-2 rounded-xl bg-[#dff86a] py-3 text-sm font-semibold text-[#153c2e]">Open {applicationRole} dashboard</button>}{applicationRole === "Gym Owner" && roleApplications[roleApplications.length - 1]?.status === "Approved" && <button onClick={() => { setPanel(null); setLocationEditorOpen(true); }} className="col-span-2 rounded-xl border border-black/10 py-3 text-sm font-semibold">Manage gym location</button>}<button onClick={() => { setSignedIn(false); setPanel(null); notify("You have been signed out."); }} className="col-span-2 rounded-xl bg-[#153c2e] py-3 text-sm font-semibold text-white">Sign out</button></div></div>}
          </section>
        </div>
      )}

      {applicationOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-[#0d2119]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setApplicationOpen(false)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            {applicationSent ? <div className="py-8 text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-[#dff86a] text-[#153c2e]"><Icon name="check" className="size-8" /></div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Application received</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Submitted successfully!</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718078]">Your {applicationRole} request and supporting proofs were sent to the FitMap administrators for verification. You can track its status from your profile.</p>
              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-[#fff5d9] p-3 text-sm font-semibold text-[#765a1c]">Status: Pending administrator review</div>
              <button onClick={() => setApplicationOpen(false)} className="mt-6 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Return to FitMap</button>
            </div> : <>
            <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Partner verification</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Request a professional role</h2><p className="mt-2 text-sm text-[#718078]">Your account remains a Member until an administrator verifies your documents.</p></div><button onClick={() => setApplicationOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button></div>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {(["Trainer", "Gym Owner"] as const).map((role) => <button key={role} onClick={() => setApplicationRole(role)} className={`rounded-xl border p-4 text-left ${applicationRole === role ? "border-[#153c2e] bg-[#edf3d1]" : "border-black/10"}`}><b className="block text-sm">{role}</b><span className="mt-1 block text-xs text-[#718078]">{role === "Trainer" ? "Offer coaching services" : "List and manage a gym"}</span></button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setApplicationSent(true); setRoleApplications((items) => [...items, { id: Date.now(), applicant: "Alex Morgan", role: applicationRole, proof: "Supporting documents uploaded", status: "Pending" }]); notify(`${applicationRole} request submitted for admin review.`); }} className="space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">{applicationRole === "Trainer" ? "Professional specialty" : "Registered gym name"}</span><input required placeholder={applicationRole === "Trainer" ? "e.g. Strength and conditioning" : "Enter official business name"} className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f]" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">{applicationRole === "Trainer" ? "Years of experience" : "Business registration number"}</span><input required placeholder={applicationRole === "Trainer" ? "e.g. 5 years" : "Enter registration number"} className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f]" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">Supporting proofs</span><span className="mb-2 block text-xs leading-5 text-[#718078]">{applicationRole === "Trainer" ? "Upload a valid ID, certifications, and relevant training credentials." : "Upload a valid ID, business permit, registration, and proof of gym ownership."}</span><input required multiple type="file" accept=".pdf,.jpg,.jpeg,.png" className="w-full rounded-xl border border-dashed border-black/15 bg-[#fafbf8] p-4 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#153c2e] file:px-3 file:py-2 file:font-semibold file:text-white" /></label>
              <label className="flex items-start gap-2 text-xs leading-5 text-[#68766f]"><input required type="checkbox" className="mt-1 accent-[#153c2e]" /> I certify that the information and proofs provided are authentic and may be verified by FitMap administrators.</label>
              <button type="submit" className="w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Submit for verification</button>
            </form>
            </>}
          </section>
        </div>
      )}

      {gymDetails && (() => {
        const gym = gyms.find((item) => item.id === gymDetails)!;
        const pin = gym.id === 1 ? { x: `${ownerGymLocation.x}%`, y: `${ownerGymLocation.y}%` } : { x: gym.x, y: gym.y };
        return <div className="fixed inset-0 z-[60] grid place-items-end bg-[#0d2119]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setGymDetails(null)}>
          <section onMouseDown={(e) => e.stopPropagation()} className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="relative h-56"><img src={gym.image} alt={`${gym.name} interior`} className="size-full object-cover sm:rounded-t-3xl" /><button onClick={() => setGymDetails(null)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-lg shadow">×</button></div>
            <div className="p-6 sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="rounded-full bg-[#edf3d1] px-3 py-1 text-xs font-semibold text-[#345442]">Verified gym</span><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{gym.name}</h2><p className="mt-2 text-sm text-[#718078]">{gym.area} · {gym.distance} km away · {gym.open}</p></div><div className="flex items-center gap-1 font-semibold"><Icon name="star" className="size-4 fill-[#f4bd50] stroke-[#f4bd50]" /> {gym.rating} <span className="text-sm font-normal text-[#718078]">({gym.reviews} reviews)</span></div></div>
              <div className="mt-7 grid gap-5 md:grid-cols-[1fr_1.1fr]"><div><h3 className="font-semibold">About this gym</h3><p className="mt-2 text-sm leading-6 text-[#718078]">A modern fitness space with quality equipment, expert trainers, clean facilities, and flexible membership options for every fitness level.</p><div className="mt-5 flex flex-wrap gap-2">{["Cardio", "Strength area", "Locker rooms", "Personal training"].map((item) => <span key={item} className="rounded-full bg-[#f0f2ed] px-3 py-1.5 text-xs font-medium">{item}</span>)}</div></div><div><h3 className="mb-2 font-semibold">Gym location</h3><div className="map-grid relative h-48 overflow-hidden rounded-2xl border border-black/5"><span style={{ left: pin.x, top: pin.y }} className="absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#153c2e] text-[#dff86a] shadow-lg ring-4 ring-white"><Icon name="pin" className="size-5" /></span></div><p className="mt-2 flex items-start gap-2 text-xs leading-5 text-[#718078]"><Icon name="pin" className="mt-0.5 size-3.5 shrink-0" />{gym.id === 1 ? ownerGymLocation.address : `${gym.area}, Metro Manila`}</p></div></div>
              <div className="mt-7"><div className="mb-3"><h3 className="font-semibold">Membership plans</h3><p className="mt-1 text-xs text-[#718078]">Choose the access period that works for you.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Daily", `₱${gym.price}`], ["Weekly", `₱${gym.id === 1 ? "799" : gym.id === 2 ? "899" : "699"}`], ["Monthly", `₱${gym.id === 1 ? "2,499" : gym.id === 2 ? "2,799" : "2,199"}`], ["Yearly", `₱${gym.id === 1 ? "24,990" : gym.id === 2 ? "27,990" : "21,990"}`]].map(([plan, price]) => <button onClick={() => { setGymDetails(null); signedIn ? setMembershipCheckout({ gym: gym.name, plan, price }) : setAuthOpen(true); }} key={plan} className="rounded-xl border border-black/10 p-3 text-left transition hover:border-[#153c2e] hover:bg-[#edf3d1]"><span className="block text-xs font-semibold">{plan}</span><span className="mt-1 block text-lg font-bold">{price}</span><span className="mt-1 block text-[10px] text-[#718078]">Select plan</span></button>)}</div></div>
              <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Available trainers</h3><span className="text-xs text-[#718078]">Schedules updated today</span></div><div className="grid gap-2 sm:grid-cols-2">{[["Coach Michael Reyes", "Strength & conditioning", "Today · 4:00 PM"], ["Coach Sarah Lim", "Mobility & weight loss", "Tomorrow · 9:30 AM"]].map(([name, specialty, schedule]) => <button onClick={() => { setGymDetails(null); setTrainerDetails(name); }} key={name} className="flex items-center justify-between rounded-2xl border border-black/5 p-3 text-left hover:bg-[#f7f8f4]"><div><p className="text-sm font-semibold">{name}</p><p className="mt-1 text-xs text-[#718078]">{specialty}</p></div><div className="text-right"><p className="text-xs font-semibold text-[#3f705b]">{schedule}</p><p className="mt-1 text-[10px] text-[#718078]">View schedule</p></div></button>)}</div></div>
              <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#f4f6f1] p-4 sm:flex-row"><p><span className="text-2xl font-bold">₱{gym.price}</span><span className="text-sm text-[#718078]"> / daily access</span></p><button onClick={() => { setGymDetails(null); setBooking(true); }} className="w-full rounded-xl bg-[#153c2e] px-6 py-3 text-sm font-semibold text-white sm:w-auto">Book this gym</button></div>
            </div>
          </section>
        </div>;
      })()}

      {trainerDetails && <div className="fixed inset-0 z-[60] grid place-items-end bg-[#0d2119]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setTrainerDetails(null)}>
        <section onMouseDown={(e) => e.stopPropagation()} className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
          <div className="flex items-start justify-between"><div><span className="rounded-full bg-[#edf3d1] px-3 py-1 text-xs font-semibold text-[#345442]">Verified trainer</span><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{trainerDetails}</h2><p className="mt-2 text-sm text-[#718078]">Strength & conditioning · 8 years experience</p></div><button onClick={() => setTrainerDetails(null)} className="grid size-9 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button></div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm"><span className="flex items-center gap-1 rounded-full bg-[#f7f8f4] px-3 py-2"><Icon name="star" className="size-4 fill-[#f4bd50] stroke-[#f4bd50]" /> 4.9 rating</span><span className="rounded-full bg-[#f7f8f4] px-3 py-2">126 reviews</span><span className="rounded-full bg-[#f7f8f4] px-3 py-2">342 sessions</span></div>
          <div className="mt-6 rounded-2xl bg-[#f7f8f4] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[#59806f]">Assigned gym</p><p className="mt-2 font-semibold">Pulse Fitness Hub</p><p className="mt-1 text-xs text-[#718078]">32nd Street, BGC · 0.8 km away</p><button onClick={() => { setTrainerDetails(null); setGymDetails(1); }} className="mt-3 text-xs font-semibold text-[#3f705b]">View gym details</button></div>
          <div className="mt-6"><h3 className="font-semibold">Available schedule</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{["Today · 4:00 PM", "Tomorrow · 9:30 AM", "Tomorrow · 2:00 PM", "May 27 · 10:00 AM", "May 27 · 5:30 PM", "May 28 · 1:00 PM"].map((slot, i) => <button onClick={() => notify(`${slot} selected.`)} key={slot} className={`rounded-xl border p-3 text-xs font-semibold ${i === 1 ? "border-[#153c2e] bg-[#edf3d1]" : "border-black/10 hover:border-[#59806f]"}`}>{slot}</button>)}</div></div>
          <button onClick={() => signedIn ? (setTrainerDetails(null), setBooking(true)) : (setTrainerDetails(null), setAuthOpen(true))} className="mt-6 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Book this trainer</button>
        </section>
      </div>}

      {locationEditorOpen && <div className="fixed inset-0 z-[60] grid place-items-end bg-[#0d2119]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setLocationEditorOpen(false)}>
        <section onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Gym Owner tools</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">Pin your gym location</h2><p className="mt-2 text-sm text-[#718078]">Click anywhere on the map to place the exact public location pin.</p></div><button onClick={() => setLocationEditorOpen(false)} className="grid size-9 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button></div>
          <div onClick={(e) => { const box = e.currentTarget.getBoundingClientRect(); setOwnerGymLocation((value) => ({ ...value, x: ((e.clientX - box.left) / box.width) * 100, y: ((e.clientY - box.top) / box.height) * 100 })); }} className="map-grid relative h-72 cursor-crosshair overflow-hidden rounded-2xl border border-black/5"><span style={{ left: `${ownerGymLocation.x}%`, top: `${ownerGymLocation.y}%` }} className="absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#153c2e] text-[#dff86a] shadow-xl ring-4 ring-white"><Icon name="pin" className="size-5" /></span></div>
          <label className="mt-4 block"><span className="mb-1.5 block text-sm font-semibold">Complete gym address</span><input value={ownerGymLocation.address} onChange={(e) => setOwnerGymLocation((value) => ({ ...value, address: e.target.value }))} className="h-12 w-full rounded-xl border border-black/10 bg-[#fafbf8] px-4 text-sm outline-none focus:border-[#59806f]" /></label>
          <button onClick={() => { setLocationEditorOpen(false); notify("Gym location saved and is now visible to users."); }} className="mt-5 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Save public location</button>
        </section>
      </div>}

      {roleDashboardOpen && <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#eef1eb]">
        <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#153c2e] text-[#dff86a]"><Icon name={applicationRole === "Trainer" ? "users" : "dumbbell"} /></div><div><p className="font-bold">FitMap {applicationRole}</p><p className="text-xs text-[#718078]">Professional dashboard</p></div></div><button onClick={() => setRoleDashboardOpen(false)} className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold">Back to FitMap</button></div></header>
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">{applicationRole} workspace</p><h2 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Welcome back, Alex.</h2><p className="mt-2 text-sm text-[#718078]">{applicationRole === "Trainer" ? "Manage clients, sessions, availability, and your professional reputation." : "Monitor your gym, reservations, members, trainers, and membership performance."}</p></div><button onClick={() => notify(applicationRole === "Trainer" ? "Availability calendar opened." : "Gym editing tools opened.")} className="rounded-xl bg-[#153c2e] px-5 py-3 text-sm font-semibold text-white">{applicationRole === "Trainer" ? "Update availability" : "Edit gym profile"}</button></div>

          {applicationRole === "Trainer" ? <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["4.9", "Average rating", "126 reviews"], ["18", "Sessions this week", "+4 from last week"], ["42", "Active clients", "8 new this month"], ["₱28,450", "Monthly earnings", "+14.2%"]].map(([value, label, detail]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#718078]">{label}</p><p className="mt-3 text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-2 text-xs font-medium text-[#4c8069]">{detail}</p></article>)}</div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><article className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Upcoming sessions</h3><p className="mt-1 text-xs text-[#718078]">Today’s confirmed bookings</p></div><button onClick={() => notify("Full trainer calendar opened.")} className="text-xs font-semibold text-[#3f705b]">View calendar</button></div><div className="mt-5 space-y-3">{[["Jamie Santos", "Strength assessment", "9:00 AM"], ["Chris Tan", "Upper body program", "1:30 PM"], ["Bea Cruz", "Functional training", "4:00 PM"]].map(([client, session, time]) => <div key={client} className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4"><div><p className="text-sm font-semibold">{client}</p><p className="mt-1 text-xs text-[#718078]">{session}</p></div><div className="text-right"><p className="text-sm font-bold">{time}</p><button onClick={() => notify(`${client}'s session details opened.`)} className="mt-1 text-xs text-[#3f705b]">View booking</button></div></div>)}</div></article><article className="rounded-3xl bg-[#153c2e] p-6 text-white shadow-sm"><h3 className="text-lg font-semibold">Rating overview</h3><div className="mt-6 flex items-end gap-2"><span className="text-5xl font-bold">4.9</span><span className="pb-1 text-sm text-white/55">/ 5.0</span></div><div className="mt-4 flex gap-1 text-[#dff86a]">{[1,2,3,4,5].map((star) => <Icon key={star} name="star" className="size-5 fill-current" />)}</div><p className="mt-5 text-sm leading-6 text-white/60">“Excellent guidance and a program that actually fits my schedule.”</p><button onClick={() => notify("All trainer reviews opened.")} className="mt-5 w-full rounded-xl bg-white/10 py-3 text-sm font-semibold">Read all 126 reviews</button></article></div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <article className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Pending booking requests</h3><p className="mt-1 text-xs text-[#718078]">Accept or decline new client requests</p></div><span className="rounded-full bg-[#fff1cb] px-3 py-1 text-xs font-semibold text-[#7a5a14]">{trainerRequests.filter((item) => item.status === "Pending").length} pending</span></div><div className="mt-5 space-y-3">{trainerRequests.map((request) => <div key={request.id} className="rounded-2xl border border-black/5 p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">{request.client}</p><p className="mt-1 text-xs text-[#718078]">{request.session} · {request.schedule}</p></div>{request.status === "Pending" ? <div className="flex gap-2"><button onClick={() => setTrainerRequests((items) => items.map((item) => item.id === request.id ? {...item, status: "Declined"} : item))} className="rounded-lg border border-[#d66d58]/30 px-3 py-2 text-xs font-semibold text-[#9c4938]">Decline</button><button onClick={() => { setTrainerRequests((items) => items.map((item) => item.id === request.id ? {...item, status: "Accepted"} : item)); notify(`${request.client}'s booking was added to your schedule.`); }} className="rounded-lg bg-[#153c2e] px-3 py-2 text-xs font-semibold text-white">Accept</button></div> : <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "Accepted" ? "bg-[#edf3d1] text-[#345442]" : "bg-[#ffe2dc] text-[#8b3f31]"}`}>{request.status}</span>}</div></div>)}</div></article>
              <article className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="text-lg font-semibold">Weekly availability</h3><p className="mt-1 text-xs text-[#718078]">Your public booking schedule</p><div className="mt-5 space-y-2">{[["Monday", "9 AM – 5 PM"], ["Tuesday", "1 PM – 7 PM"], ["Wednesday", "Unavailable"], ["Thursday", "9 AM – 5 PM"], ["Friday", "10 AM – 4 PM"]].map(([day, time]) => <button onClick={() => notify(`${day} availability editor opened.`)} key={day} className="flex w-full justify-between rounded-xl bg-[#f7f8f4] p-3 text-sm"><span className="font-semibold">{day}</span><span className="text-[#718078]">{time}</span></button>)}</div></article>
            </div>
          </> : <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["₱184,600", "Monthly revenue", "+11.8%"], ["87", "Active members", "+9 this month"], ["64", "Bookings this week", "+16.4%"], ["6", "Active trainers", "All verified"]].map(([value, label, detail]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#718078]">{label}</p><p className="mt-3 text-3xl font-bold tracking-[-0.04em]">{value}</p><p className="mt-2 text-xs font-medium text-[#4c8069]">{detail}</p></article>)}</div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><article className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Recent reservations</h3><p className="mt-1 text-xs text-[#718078]">Latest member activity</p></div><button onClick={() => notify("All gym reservations opened.")} className="text-xs font-semibold text-[#3f705b]">View all</button></div><div className="mt-5 space-y-3">{[["Jamie Santos", "Monthly membership", "Paid"], ["Chris Tan", "Day pass · May 26", "Confirmed"], ["Bea Cruz", "Weekly membership", "Paid"]].map(([member, booking, status]) => <div key={member} className="flex items-center justify-between rounded-2xl bg-[#f7f8f4] p-4"><div><p className="text-sm font-semibold">{member}</p><p className="mt-1 text-xs text-[#718078]">{booking}</p></div><span className="rounded-full bg-[#edf3d1] px-3 py-1 text-xs font-semibold text-[#345442]">{status}</span></div>)}</div></article><article className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="text-lg font-semibold">Quick management</h3><div className="mt-5 space-y-2">{["Manage trainers", "Membership plans", "Customer records", "Business reports"].map((item) => <button onClick={() => notify(`${item} opened.`)} key={item} className="flex w-full items-center justify-between rounded-xl border border-black/5 p-3 text-left text-sm font-semibold hover:bg-[#f4f6f1]">{item}<Icon name="chevron" className="size-4" /></button>)}<button onClick={() => { setRoleDashboardOpen(false); setLocationEditorOpen(true); }} className="flex w-full items-center justify-between rounded-xl bg-[#dff86a] p-3 text-left text-sm font-semibold text-[#153c2e]">Update map location<Icon name="pin" className="size-4" /></button></div></article></div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
              <article className="overflow-hidden rounded-3xl bg-white shadow-sm"><div className="border-b border-black/5 p-6"><h3 className="text-lg font-semibold">Membership subscribers</h3><p className="mt-1 text-xs text-[#718078]">All active weekly, monthly, and yearly members</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr>{["Member", "Plan", "Started", "Renewal", "Status"].map((item) => <th key={item} className="border-b border-black/5 px-5 py-3 text-xs uppercase tracking-wider text-[#718078]">{item}</th>)}</tr></thead><tbody>{[["Jamie Santos", "Monthly", "May 2", "Jun 2", "Active"], ["Bea Cruz", "Weekly", "May 20", "May 27", "Active"], ["Nicole Garcia", "Yearly", "Jan 15", "Jan 15, 2027", "Active"], ["Paolo Reyes", "Monthly", "Apr 28", "May 28", "Renewal due"]].map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={`border-b border-black/5 px-5 py-4 text-sm ${i === 0 ? "font-semibold" : "text-[#637169]"}`}>{cell}</td>)}</tr>)}</tbody></table></div></article>
              <article className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Trainer schedules</h3><p className="mt-1 text-xs text-[#718078]">Today at Pulse Fitness</p></div><button onClick={() => notify("Trainer management opened.")} className="text-xs font-semibold text-[#3f705b]">Manage</button></div><div className="mt-5 space-y-3">{[["Michael Reyes", "9 AM – 5 PM", "3 sessions"], ["Sarah Lim", "10 AM – 6 PM", "4 sessions"], ["David Cruz", "1 PM – 8 PM", "2 sessions"]].map(([name, hours, load]) => <div key={name} className="rounded-2xl bg-[#f7f8f4] p-4"><div className="flex justify-between"><p className="text-sm font-semibold">{name}</p><span className="text-xs font-semibold text-[#3f705b]">{load}</span></div><p className="mt-1 text-xs text-[#718078]">{hours}</p></div>)}</div></article>
            </div>
          </>}
        </div>
      </div>}

      {membershipCheckout && <div className="fixed inset-0 z-[70] grid place-items-end bg-[#0d2119]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5" onMouseDown={() => setMembershipCheckout(null)}>
        <section onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#59806f]">Membership checkout</p><h2 className="mt-1 text-2xl font-semibold">Confirm your plan</h2></div><button onClick={() => setMembershipCheckout(null)} className="grid size-9 place-items-center rounded-full bg-[#f0f2ed] text-lg">×</button></div>
          <div className="mt-6 rounded-2xl bg-[#edf3d1] p-5"><p className="text-sm font-semibold">{membershipCheckout.gym}</p><div className="mt-3 flex items-end justify-between"><div><p className="text-2xl font-bold">{membershipCheckout.plan}</p><p className="mt-1 text-xs text-[#637169]">Starts immediately after confirmation</p></div><p className="text-2xl font-bold">{membershipCheckout.price}</p></div></div>
          <div className="mt-5"><p className="mb-2 text-sm font-semibold">Payment method</p><label className="flex items-center gap-3 rounded-xl border border-[#153c2e] bg-[#f7f8f4] p-4 text-sm font-semibold"><input defaultChecked type="radio" name="payment" className="accent-[#153c2e]" /> Secure online payment</label></div>
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#f7f8f4] p-3 text-xs leading-5 text-[#718078]"><Icon name="check" className="mt-0.5 size-4 shrink-0 text-[#3f705b]" />Your membership will appear in your account immediately after payment confirmation.</div>
          <button onClick={() => { setActiveMembership(membershipCheckout); notify(`${membershipCheckout.plan} membership activated at ${membershipCheckout.gym}.`); setMembershipCheckout(null); setPanel("memberships"); }} className="mt-6 w-full rounded-2xl bg-[#153c2e] py-4 font-semibold text-white">Pay {membershipCheckout.price} and activate</button>
        </section>
      </div>}

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#14231d] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}
    </main>
  );
}
