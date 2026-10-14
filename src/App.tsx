import { useMemo, useState } from "react";

type Role = "Member" | "Trainer" | "Gym Owner" | "Admin";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  specialty?: string;
  gymName?: string;
  avatarBg?: string;
};

type IconName =
  | "search"
  | "pin"
  | "bell"
  | "chevron"
  | "star"
  | "clock"
  | "heart"
  | "route"
  | "calendar"
  | "users"
  | "dumbbell"
  | "check"
  | "menu"
  | "grid"
  | "card"
  | "shield"
  | "user"
  | "logout"
  | "building"
  | "edit"
  | "swap"
  | "printer"
  | "x";

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    heart: (
      <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 7l-1.1-1.2a5.5 5.5 0 0 0-7.7 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    route: (
      <>
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="5" r="2" />
        <path d="M8 19h2a3 3 0 0 0 3-3v-5a3 3 0 0 1 3-3h2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    dumbbell: <path d="m6 7 11 11M4 9l3-3M17 18l3-3M2 11l5-5M17 20l5-5" />,
    check: <path d="m5 12 4 4L19 6" />,
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    card: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    user: (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </>
    ),
    swap: (
      <>
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </>
    ),
    printer: (
      <>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>
    ),
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

// Initial Mock Datasets
const defaultGyms = [
  {
    id: 1,
    name: "Iron Zone Fitness",
    area: "San Jose, Nueva Ecija",
    distance: 0.6,
    rating: 4.8,
    reviews: 142,
    price: 150,
    open: "Open until 10 PM",
    tag: "Verified Gym",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",
    x: "58%",
    y: "43%",
    address: "Maharlika Highway, San Jose City, Nueva Ecija",
    phone: "0917 123 4567",
    facilities: ["Cardio Zone", "Heavy Weights", "Crossfit Rig", "Showers", "Locker Room", "Parking"],
  },
  {
    id: 2,
    name: "Pulse Fitness Hub",
    area: "Bonifacio Global City",
    distance: 0.8,
    rating: 4.9,
    reviews: 214,
    price: 149,
    open: "Open until 11 PM",
    tag: "Top Rated",
    image: "https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=900&q=85",
    x: "62%",
    y: "31%",
    address: "32nd Street corner 9th Ave, Bonifacio Global City, Taguig",
    phone: "0918 555 1234",
    facilities: ["Sauna", "Cardio Deck", "Strength Machines", "Smoothie Bar", "Lockers"],
  },
  {
    id: 3,
    name: "Powerhouse Gym",
    area: "Cabanatuan City",
    distance: 1.4,
    rating: 4.7,
    reviews: 186,
    price: 160,
    open: "Open 24 hours",
    tag: "24/7 Access",
    image: "https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?auto=format&fit=crop&w=900&q=85",
    x: "35%",
    y: "57%",
    address: "Burgos Ave, Cabanatuan City, Nueva Ecija",
    phone: "0920 333 7890",
    facilities: ["Olympic Racks", "Dumbbells up to 120lbs", "Boxing Ring", "Functional Turf"],
  },
  {
    id: 4,
    name: "Common Ground Athletics",
    area: "Ortigas Center",
    distance: 2.3,
    rating: 4.7,
    reviews: 98,
    price: 120,
    open: "Open until 10 PM",
    tag: "Best Value",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=85",
    x: "73%",
    y: "67%",
    address: "Emerald Avenue, Ortigas Center, Pasig",
    phone: "0915 888 2211",
    facilities: ["Yoga Studio", "Calisthenics Area", "Lockers", "Shower Area"],
  },
];

const defaultTrainers = [
  {
    id: 1,
    name: "Coach Michael Reyes",
    specialty: "Strength & Conditioning",
    gymName: "Iron Zone Fitness",
    rating: 4.9,
    reviews: 128,
    experience: "8 years",
    hourlyRate: 600,
    image: "https://images.unsplash.com/photo-1758875568932-0eefd3e60090?auto=format&fit=crop&w=700&q=85",
    availableSlots: ["Tomorrow · 9:30 AM", "Tomorrow · 2:00 PM", "May 27 · 10:00 AM"],
  },
  {
    id: 2,
    name: "Coach David Cruz",
    specialty: "Bodybuilding & Hypertrophy",
    gymName: "Powerhouse Gym",
    rating: 4.8,
    reviews: 95,
    experience: "6 years",
    hourlyRate: 550,
    image: "https://images.unsplash.com/photo-1585892478508-130c50eb7a69?auto=format&fit=crop&w=700&q=85",
    availableSlots: ["Today · 4:00 PM", "May 28 · 1:00 PM", "May 29 · 5:30 PM"],
  },
  {
    id: 3,
    name: "Coach Mika Reyes",
    specialty: "Functional Movement & Mobility",
    gymName: "Pulse Fitness Hub",
    rating: 4.9,
    reviews: 110,
    experience: "7 years",
    hourlyRate: 650,
    image: "https://images.unsplash.com/photo-1738523686578-f18348c8292b?auto=format&fit=crop&w=700&q=85",
    availableSlots: ["Tomorrow · 8:00 AM", "May 27 · 3:30 PM", "May 30 · 11:00 AM"],
  },
  {
    id: 4,
    name: "Coach Luis Mendoza",
    specialty: "Boxing & High-Intensity Conditioning",
    gymName: "Common Ground Athletics",
    rating: 4.7,
    reviews: 74,
    experience: "5 years",
    hourlyRate: 500,
    image: "https://images.unsplash.com/photo-1708011108842-30966718105a?auto=format&fit=crop&w=700&q=85",
    availableSlots: ["Today · 6:00 PM", "Tomorrow · 10:30 AM", "May 29 · 4:00 PM"],
  },
];

const demoUsers: Record<Role, UserProfile> = {
  Member: {
    id: 7,
    name: "John Dela Cruz",
    email: "john@example.com",
    role: "Member",
    phone: "0919 555 6666",
    avatarBg: "bg-[#22c55e]",
  },
  Trainer: {
    id: 1,
    name: "Coach Michael Reyes",
    email: "michael@fitmap.com",
    role: "Trainer",
    specialty: "Strength & Conditioning",
    gymName: "Iron Zone Fitness",
    phone: "0917 888 9999",
    avatarBg: "bg-[#22c55e]",
  },
  "Gym Owner": {
    id: 2,
    name: "Carlos Mendoza",
    email: "carlos@ironzone.com",
    role: "Gym Owner",
    gymName: "Iron Zone Fitness",
    phone: "0917 123 4567",
    avatarBg: "bg-[#22c55e]",
  },
  Admin: {
    id: 99,
    name: "System Administrator",
    email: "admin@fitmap.com",
    role: "Admin",
    phone: "0918 000 1111",
    avatarBg: "bg-[#22c55e]",
  },
};

type RoleApplication = {
  id: number;
  applicant: string;
  role: "Trainer" | "Gym Owner";
  proof: string;
  specialtyOrGym: string;
  status: "Pending" | "Approved" | "Declined";
  date: string;
};

type BookingItem = {
  id: number;
  customerName: string;
  gymName: string;
  trainerName: string;
  sessionType: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  price: number;
};

export default function App() {
  // Authentication & Profile State
  const [signedIn, setSignedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(demoUsers.Member);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("john@example.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<Role>("Member");
  const [regDetail, setRegDetail] = useState("");
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Navigation: The sidebar sets this and DOES NOT SCROLL the page!
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // App Data State
  const [gymsList, setGymsList] = useState(defaultGyms);
  const [trainersList] = useState(defaultTrainers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All gyms");
  const [sortBy, setSortBy] = useState<"Recommended" | "Nearest first">("Recommended");
  const [savedGyms, setSavedGyms] = useState<number[]>([1]);

  // Bookings State
  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 101,
      customerName: "John Dela Cruz",
      gymName: "Iron Zone Fitness",
      trainerName: "Coach Michael Reyes",
      sessionType: "Strength Assessment",
      date: "Tomorrow",
      time: "9:30 AM",
      status: "Confirmed",
      price: 600,
    },
    {
      id: 102,
      customerName: "John Dela Cruz",
      gymName: "Pulse Fitness Hub",
      trainerName: "Facility Access",
      sessionType: "Day Pass",
      date: "May 28",
      time: "2:30 PM",
      status: "Confirmed",
      price: 149,
    },
    {
      id: 103,
      customerName: "John Dela Cruz",
      gymName: "Powerhouse Gym",
      trainerName: "Coach David Cruz",
      sessionType: "Bodybuilding Session",
      date: "May 30",
      time: "4:00 PM",
      status: "Pending",
      price: 550,
    },
  ]);

  // Memberships State
  const [userMembership, setUserMembership] = useState<{
    planName: string;
    gymName: string;
    validUntil: string;
    price: string;
    status: "Active" | "Expired";
  }>({
    planName: "30 Days Pass",
    gymName: "Iron Zone Fitness",
    validUntil: "June 24, 2026",
    price: "₱2,200",
    status: "Active",
  });

  // Role Applications State (for Admin review and Member apply)
  const [roleApplications, setRoleApplications] = useState<RoleApplication[]>([
    {
      id: 1,
      applicant: "Bea Cruz",
      role: "Trainer",
      specialtyOrGym: "HIIT & Rehab Coach",
      proof: "PRC License #882194 + NASM Certificate",
      status: "Pending",
      date: "May 23, 2026",
    },
    {
      id: 2,
      applicant: "Carlos Mendoza",
      role: "Gym Owner",
      specialtyOrGym: "Iron Zone Fitness",
      proof: "DTI Registration #0492190 & City Mayor Permit",
      status: "Approved",
      date: "May 20, 2026",
    },
  ]);

  // Trainer Schedule Slots (Interactive toggle)
  const [trainerSchedule, setTrainerSchedule] = useState([
    { id: 1, day: "Monday", time: "08:00 AM - 10:00 AM", isBooked: true },
    { id: 2, day: "Monday", time: "10:00 AM - 12:00 PM", isBooked: false },
    { id: 3, day: "Monday", time: "02:00 PM - 04:00 PM", isBooked: false },
    { id: 4, day: "Tuesday", time: "09:00 AM - 11:00 AM", isBooked: true },
    { id: 5, day: "Tuesday", time: "01:00 PM - 03:00 PM", isBooked: false },
    { id: 6, day: "Wednesday", time: "08:00 AM - 10:00 AM", isBooked: false },
    { id: 7, day: "Wednesday", time: "04:00 PM - 06:00 PM", isBooked: true },
    { id: 8, day: "Thursday", time: "10:00 AM - 12:00 PM", isBooked: false },
    { id: 9, day: "Friday", time: "09:00 AM - 11:00 AM", isBooked: false },
    { id: 10, day: "Saturday", time: "08:00 AM - 10:00 AM", isBooked: true },
  ]);

  // Trainer Incoming Requests
  const [trainerRequests, setTrainerRequests] = useState([
    { id: 1, client: "Nicole Garcia", session: "Strength Assessment", schedule: "Tomorrow · 10:00 AM", status: "Pending" },
    { id: 2, client: "Paolo Reyes", session: "Personal Training", schedule: "May 29 · 3:30 PM", status: "Pending" },
  ]);

  // Gym Owner Profile Form
  const [gymProfile, setGymProfile] = useState({
    name: "Iron Zone Fitness",
    address: "Maharlika Highway, San Jose City, Nueva Ecija",
    phone: "0917 123 4567",
    hours: "Mon - Sun: 6:00 AM - 10:00 PM",
    description: "Modern fitness space with heavy weights, crossfit turf, certified coaches, and clean lockers.",
    pinX: 58,
    pinY: 43,
  });

  // Modal Controls
  const [selectedGymForModal, setSelectedGymForModal] = useState<number | null>(null);
  const [bookingModalTrainer, setBookingModalTrainer] = useState<number | null>(null);
  const [bookingModalGym, setBookingModalGym] = useState<number>(1);
  const [bookingDateInput, setBookingDateInput] = useState("2026-05-25");
  const [bookingTimeInput, setBookingTimeInput] = useState("09:30 AM");
  const [bookingTypeInput, setBookingTypeInput] = useState("Personal Training");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [subscribeModalGym, setSubscribeModalGym] = useState<string | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState("");
  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(""), 2800);
  };

  // Switch active POV / Role cleanly
  const switchRole = (role: Role) => {
    setCurrentUser(demoUsers[role]);
    setSignedIn(true);
    setActiveTab("dashboard");
    notify(`Switched to ${role} POV (${demoUsers[role].name})`);
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Match demo accounts or create dynamic profile
    let targetRole: Role = "Member";
    let targetName = "John Dela Cruz";
    if (loginEmail.toLowerCase().includes("trainer") || loginEmail.toLowerCase().includes("michael")) {
      targetRole = "Trainer";
      targetName = "Coach Michael Reyes";
    } else if (loginEmail.toLowerCase().includes("owner") || loginEmail.toLowerCase().includes("carlos")) {
      targetRole = "Gym Owner";
      targetName = "Carlos Mendoza";
    } else if (loginEmail.toLowerCase().includes("admin")) {
      targetRole = "Admin";
      targetName = "System Administrator";
    } else {
      targetName = loginEmail.split("@")[0] || "FitMap User";
    }

    setCurrentUser({
      id: Date.now(),
      name: targetName,
      email: loginEmail,
      role: targetRole,
      phone: "0917 555 7777",
      avatarBg: "bg-[#22c55e]",
    });
    setSignedIn(true);
    setAuthModalOpen(false);
    setActiveTab("dashboard");
    notify(`Welcome back, ${targetName}! Signed in as ${targetRole}.`);
  };

  // Register handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      notify("Please fill in your name and email.");
      return;
    }
    const newUser: UserProfile = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      phone: "0919 000 0000",
      specialty: regRole === "Trainer" ? regDetail || "Strength Coach" : undefined,
      gymName: regRole === "Gym Owner" ? regDetail || "Partner Gym" : undefined,
      avatarBg: "bg-[#22c55e]",
    };

    setCurrentUser(newUser);
    setSignedIn(true);
    setAuthModalOpen(false);
    setActiveTab("dashboard");
    notify(`Account created successfully! Welcome to FitMap, ${regName}.`);
  };

  // Filtered Gyms for Discovery & Find Gyms
  const visibleGyms = useMemo(() => {
    return gymsList.filter((gym) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        gym.name.toLowerCase().includes(q) ||
        gym.area.toLowerCase().includes(q) ||
        gym.facilities.some((f) => f.toLowerCase().includes(q));

      if (!matchesQuery) return false;
      if (selectedFilter === "Under 1 km") return gym.distance < 1.0;
      if (selectedFilter === "Top rated") return gym.rating >= 4.8;
      if (selectedFilter === "Open now") return gym.open.includes("24") || gym.open.includes("11");
      return true;
    });
  }, [gymsList, searchQuery, selectedFilter]);

  // Sidebar navigation configuration depending on active role
  const getSidebarNavItems = () => {
    if (currentUser.role === "Member") {
      return [
        { id: "dashboard", label: "Dashboard", icon: "grid" as IconName },
        { id: "bookings", label: "My Bookings", icon: "calendar" as IconName },
        { id: "memberships", label: "My Memberships", icon: "card" as IconName },
        { id: "trainers", label: "Find Trainers", icon: "users" as IconName },
        { id: "partner", label: "Apply as Partner", icon: "check" as IconName },
        { id: "gyms", label: "Find Gyms", icon: "dumbbell" as IconName },
      ];
    }
    if (currentUser.role === "Trainer") {
      return [
        { id: "dashboard", label: "Dashboard", icon: "grid" as IconName },
        { id: "requests", label: "Client Requests", icon: "bell" as IconName },
        { id: "schedule", label: "My Schedule", icon: "calendar" as IconName },
        { id: "clients", label: "My Clients", icon: "users" as IconName },
        { id: "gyms", label: "Partner Gyms", icon: "dumbbell" as IconName },
      ];
    }
    if (currentUser.role === "Gym Owner") {
      return [
        { id: "dashboard", label: "Dashboard", icon: "grid" as IconName },
        { id: "gym-profile", label: "Gym Profile & Edit", icon: "edit" as IconName },
        { id: "subscribers", label: "Subscribers", icon: "card" as IconName },
        { id: "trainers", label: "Trainer Roster", icon: "users" as IconName },
        { id: "location", label: "Map Location Pin", icon: "pin" as IconName },
        { id: "reservations", label: "Reservations", icon: "calendar" as IconName },
      ];
    }
    // Admin Role
    return [
      { id: "dashboard", label: "Dashboard", icon: "grid" as IconName },
      { id: "applications", label: "Partner Applications", icon: "shield" as IconName },
      { id: "gyms-admin", label: "Gyms Directory", icon: "building" as IconName },
      { id: "trainers-admin", label: "Trainers Directory", icon: "users" as IconName },
      { id: "memberships-admin", label: "Membership Plans", icon: "card" as IconName },
      { id: "bookings-admin", label: "All Bookings", icon: "calendar" as IconName },
      { id: "reports", label: "Management Reports", icon: "printer" as IconName },
    ];
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#111827] flex flex-col font-sans">
      {/* 
        NO TOP BAR from Screenshot 1!
        Screenshot 1 top bar (FitMap PyCharm / SQLite Edition | DB: fitmap.db Switch POV) is removed.
      */}

      {/* When signed in: Fixed Sidebar + Main Content Layout */}
      {signedIn ? (
        <div className="flex-1 flex">
          {/* 
            LEFT SIDEBAR matching Screenshot 2:
            - Green circle avatar with user silhouette
            - User Dashboard / Role POV header
            - Fixed layout that NEVER scrolls with the page
            - Bright green active item pill with dark text
          */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d2116] text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
              sidebarOpenMobile ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Top User Header & Role (Matching Screenshot 2) */}
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="size-11 rounded-2xl bg-[#22c55e] text-[#0d2116] flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  <Icon name="user" className="size-6 text-[#0d2116]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-white text-base leading-tight truncate">
                    {currentUser.role === "Member"
                      ? "User Dashboard"
                      : currentUser.role === "Trainer"
                      ? "Trainer Dashboard"
                      : currentUser.role === "Gym Owner"
                      ? "Owner Dashboard"
                      : "Admin Console"}
                  </h2>
                  <p className="text-xs font-semibold text-[#22c55e] mt-0.5">
                    {currentUser.role} POV
                  </p>
                </div>
              </div>

              {/* Navigation Items (Matches Screenshot 2: Click does NOT scroll window!) */}
              <nav className="mt-6 space-y-1.5">
                {getSidebarNavItems().map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpenMobile(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left cursor-pointer ${
                        isActive
                          ? "bg-[#22c55e] text-[#0d2116] font-bold shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon name={item.icon} className="size-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {item.id === "applications" &&
                        roleApplications.filter((a) => a.status === "Pending").length > 0 && (
                          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b] text-black">
                            {roleApplications.filter((a) => a.status === "Pending").length}
                          </span>
                        )}
                      {item.id === "requests" &&
                        trainerRequests.filter((r) => r.status === "Pending").length > 0 && (
                          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f59e0b] text-black">
                            {trainerRequests.filter((r) => r.status === "Pending").length}
                          </span>
                        )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer: User Card & Sign Out */}
            <div className="p-4 border-t border-white/10 bg-[#0a1910]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-8 rounded-full bg-[#22c55e] text-[#0d2116] font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-white/50 truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSignedIn(false);
                  notify("You have signed out.");
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Icon name="logout" className="size-4" /> Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA for Signed-In User */}
          <main className="flex-1 lg:pl-64 min-h-screen flex flex-col bg-[#f7f8f4]">
            {/* Top Header inside Dashboard */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpenMobile((prev) => !prev)}
                  className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
                  aria-label="Toggle Navigation"
                >
                  <Icon name="menu" className="size-5" />
                </button>
                <div>
                  <h1 className="text-lg font-extrabold text-gray-900 leading-tight">
                    FitMap · {currentUser.role} Space
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Logged in as <b className="text-gray-800">{currentUser.name}</b> ({currentUser.email})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => notify("No new notifications")}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 relative"
                  aria-label="Notifications"
                >
                  <Icon name="bell" className="size-4.5" />
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="size-8 rounded-full bg-[#22c55e] text-[#0d2116] font-bold text-xs flex items-center justify-center">
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <p className="font-bold text-gray-900 leading-tight">{currentUser.name}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Content Switcher based on Active Tab */}
            <div className="p-5 sm:p-8 flex-1 max-w-6xl w-full mx-auto">
              {/* =========================================
                  1. MEMBER POV TABS
                  ========================================= */}
              {currentUser.role === "Member" && (
                <>
                  {/* Member: Dashboard Tab */}
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      <div className="bg-[#0b1c14] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
                        <div className="relative z-10 max-w-2xl">
                          <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#86efac] text-xs font-bold uppercase tracking-wider">
                            Active Member Portal
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                            Ready for your next workout, {currentUser.name.split(" ")[0]}?
                          </h2>
                          <p className="text-sm text-gray-300 mt-2">
                            You have an upcoming training session tomorrow at Iron Zone Fitness with Coach Michael Reyes.
                          </p>
                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              onClick={() => setActiveTab("bookings")}
                              className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow hover:bg-[#1eb354] transition"
                            >
                              View My Bookings
                            </button>
                            <button
                              onClick={() => setActiveTab("trainers")}
                              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
                            >
                              Book Another Coach
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4 Stats Cards */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upcoming Sessions</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">
                            {bookings.filter((b) => b.status === "Confirmed").length}
                          </p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">Confirmed with coaches</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pass</p>
                          <p className="text-3xl font-black text-[#22c55e] mt-2">Monthly</p>
                          <p className="text-xs text-gray-500 mt-1">Iron Zone Fitness</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">₱3,550</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">All memberships & coaches</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workout Streak</p>
                          <p className="text-3xl font-black text-amber-500 mt-2">14 Days</p>
                          <p className="text-xs text-gray-500 mt-1">Top 5% of members</p>
                        </div>
                      </div>

                      {/* Recent Bookings Preview */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-gray-900 text-lg">Upcoming Schedule</h3>
                          <button
                            onClick={() => setActiveTab("bookings")}
                            className="text-xs font-bold text-emerald-700 hover:underline"
                          >
                            View All Bookings →
                          </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {bookings.map((b) => (
                            <div key={b.id} className="py-3.5 flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <p className="font-bold text-sm text-gray-900">{b.sessionType}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {b.gymName} · {b.trainerName} · <b className="text-gray-700">{b.date} at {b.time}</b>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                    b.status === "Confirmed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {b.status}
                                </span>
                                <span className="font-bold text-sm text-gray-900">₱{b.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Member: My Bookings Tab */}
                  {activeTab === "bookings" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900">My Reserved Sessions</h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Manage your trainer appointments and gym day passes.
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("trainers")}
                          className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs shadow hover:bg-[#1eb354] transition"
                        >
                          + Book New Trainer
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {bookings.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4">
                              <div className="size-12 rounded-2xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold text-xl shrink-0">
                                🏋️
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-extrabold text-base text-gray-900">{b.sessionType}</h3>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      b.status === "Confirmed"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Coach: <b className="text-gray-900">{b.trainerName}</b> · Facility:{" "}
                                  <b className="text-gray-900">{b.gymName}</b>
                                </p>
                                <p className="text-xs text-emerald-700 font-semibold mt-1">
                                  🗓️ {b.date} · ⏰ {b.time}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                              <span className="font-black text-base text-gray-900 mr-2">₱{b.price}</span>
                              <button
                                onClick={() => notify(`Session on ${b.date} rescheduled.`)}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setBookings((list) => list.filter((item) => item.id !== b.id));
                                  notify("Booking cancelled.");
                                }}
                                className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member: My Memberships Tab (Active item in Screenshot 2!) */}
                  {activeTab === "memberships" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">My Memberships</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          View active facility access passes and explore partner gym plans.
                        </p>
                      </div>

                      {/* Active Membership Digital Card */}
                      <div className="bg-gradient-to-br from-[#102c22] to-[#0a1b15] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-500/20 relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-5">
                          <div>
                            <span className="px-3 py-1 rounded-full bg-[#22c55e] text-[#0d2116] text-xs font-extrabold uppercase tracking-wider">
                              {userMembership.status} PASS
                            </span>
                            <h3 className="text-2xl font-black mt-2 text-white">{userMembership.planName}</h3>
                            <p className="text-sm text-gray-300 mt-0.5">Facility: {userMembership.gymName}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400">Valid Until</span>
                            <p className="text-lg font-bold text-[#86efac]">{userMembership.validUntil}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-32 bg-white/20 rounded flex items-center justify-center font-mono text-xs tracking-widest text-white/80">
                              ||||||| | ||| ||
                            </div>
                            <span className="text-xs text-gray-400">Pass ID: #FM-2026-0982</span>
                          </div>
                          <button
                            onClick={() => notify("Membership renewed for another 30 days!")}
                            className="px-5 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow hover:bg-[#1eb354] transition"
                          >
                            Renew Access Now
                          </button>
                        </div>
                      </div>

                      {/* Available Gym Plans to Subscribe */}
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-lg mb-4">
                          Explore More Gym Plans & Passes
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { name: "Day Pass", duration: "1 Day", price: "₱150", desc: "Single entry access" },
                            { name: "Weekly Fit", duration: "7 Days", price: "₱700", desc: "7 days full gym access" },
                            { name: "30 Days Pass", duration: "30 Days", price: "₱2,200", desc: "30 days full gym access" },
                            { name: "Quarterly Pass", duration: "90 Days", price: "₱5,800", desc: "Includes free assessment" },
                          ].map((plan) => (
                            <div
                              key={plan.name}
                              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  {plan.duration}
                                </span>
                                <h4 className="font-bold text-gray-900 text-base mt-2">{plan.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                                <p className="text-2xl font-black text-gray-900 mt-4">{plan.price}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setUserMembership({
                                    planName: plan.name,
                                    gymName: "Iron Zone Fitness",
                                    validUntil: "30 days from today",
                                    price: plan.price,
                                    status: "Active",
                                  });
                                  notify(`Subscribed to ${plan.name} at Iron Zone Fitness!`);
                                }}
                                className="mt-4 w-full py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs hover:bg-[#1eb354] transition"
                              >
                                Subscribe
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Member: Find Trainers Tab */}
                  {activeTab === "trainers" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Certified Coaches & Trainers</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Book one-on-one sessions, strength assessments, and customized programs.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {trainersList.map((tr) => (
                          <div
                            key={tr.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-52 overflow-hidden">
                                <img src={tr.image} alt={tr.name} className="size-full object-cover" />
                                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                  {tr.experience} experience
                                </span>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-1">
                                  <div>
                                    <h3 className="font-bold text-sm text-gray-900">{tr.name}</h3>
                                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">{tr.specialty}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">📍 {tr.gymName}</p>
                                  </div>
                                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                    ★ {tr.rating}
                                  </span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Rate:</span>
                                  <span className="font-bold text-gray-900">₱{tr.hourlyRate}/session</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 pt-0">
                              <button
                                onClick={() => {
                                  setBookingModalTrainer(tr.id);
                                  setBookingModalGym(1);
                                }}
                                className="w-full py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs hover:bg-[#1eb354] transition"
                              >
                                Book Session
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Member: Apply as Partner Tab */}
                  {activeTab === "partner" && (
                    <div className="max-w-2xl bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                      <div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                          Partnership Application
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 mt-2">Become a Verified Partner</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Submit your coaching credentials or gym business permits for Admin verification.
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const target = e.currentTarget as HTMLFormElement;
                          const requestedRole = (target.elements.namedItem("partner_role") as HTMLSelectElement).value as
                            | "Trainer"
                            | "Gym Owner";
                          const specialtyOrGym = (target.elements.namedItem("partner_title") as HTMLInputElement).value;
                          const proofs = (target.elements.namedItem("partner_proofs") as HTMLTextAreaElement).value;

                          const newApp: RoleApplication = {
                            id: Date.now(),
                            applicant: currentUser.name,
                            role: requestedRole,
                            specialtyOrGym,
                            proof: proofs,
                            status: "Pending",
                            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                          };

                          setRoleApplications((prev) => [newApp, ...prev]);
                          notify("Application submitted! Admin will review your credentials.");
                          setActiveTab("dashboard");
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Applying As</label>
                          <select
                            name="partner_role"
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white"
                          >
                            <option value="Trainer">Certified Fitness Trainer / Coach</option>
                            <option value="Gym Owner">Gym Facility Owner / Operator</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Specialty Focus or Gym Business Name
                          </label>
                          <input
                            name="partner_title"
                            required
                            placeholder="e.g. Olympic Weightlifting & Rehab or Iron Elite Gym"
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Certifications, License Numbers & Proof
                          </label>
                          <textarea
                            name="partner_proofs"
                            required
                            rows={3}
                            placeholder="Provide your certification IDs, issuing body, years experience, and city permit references..."
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                          <Icon name="shield" className="size-4 shrink-0 text-[#22c55e]" />
                          Once approved by FitMap Admin, your account gains access to the Trainer or Gym Owner workspace.
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-sm shadow hover:bg-[#1eb354] transition"
                        >
                          Submit Application for Review
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Member: Find Gyms Tab */}
                  {activeTab === "gyms" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900">Partner Gyms & Fitness Centers</h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Discover verified facilities, check pricing, and view equipment.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search gym or area..."
                            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                        {visibleGyms.map((gym) => (
                          <div
                            key={gym.id}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative h-44">
                                <img src={gym.image} alt={gym.name} className="size-full object-cover" />
                                <span className="absolute top-2.5 left-2.5 bg-white/95 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                  {gym.tag}
                                </span>
                                <span className="absolute top-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur">
                                  {gym.distance} km
                                </span>
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between">
                                  <h3 className="font-bold text-base text-gray-900">{gym.name}</h3>
                                  <span className="text-xs font-bold text-amber-500">★ {gym.rating}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">📍 {gym.area}</p>
                                <p className="text-[11px] text-emerald-600 font-semibold mt-1">● {gym.open}</p>
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {gym.facilities.slice(0, 3).map((f) => (
                                    <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="p-4 pt-2 border-t border-gray-50 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                From <b className="text-gray-900 text-sm">₱{gym.price}</b>
                              </span>
                              <button
                                onClick={() => setSelectedGymForModal(gym.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =========================================
                  2. TRAINER POV TABS
                  ========================================= */}
              {currentUser.role === "Trainer" && (
                <>
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      <div className="bg-[#0b1c14] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#86efac] text-xs font-bold uppercase tracking-wider">
                          Certified Trainer Workspace
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                          Coach Michael Reyes · Iron Zone Fitness
                        </h2>
                        <p className="text-sm text-gray-300 mt-2">
                          You have 2 pending client session requests and 18 confirmed bookings this week.
                        </p>
                        <div className="mt-5 flex gap-3">
                          <button
                            onClick={() => setActiveTab("requests")}
                            className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow"
                          >
                            Review Client Requests ({trainerRequests.filter((r) => r.status === "Pending").length})
                          </button>
                          <button
                            onClick={() => setActiveTab("schedule")}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                          >
                            Update Availability
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Coach Rating</p>
                          <p className="text-3xl font-black text-amber-500 mt-2">★ 4.9</p>
                          <p className="text-xs text-gray-500 mt-1">Based on 128 client reviews</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Sessions This Week</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">18</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">+4 from last week</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Active Clients</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">42</p>
                          <p className="text-xs text-gray-500 mt-1">Regular trainees</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Monthly Earnings</p>
                          <p className="text-3xl font-black text-[#22c55e] mt-2">₱28,450</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">+14.2% growth</p>
                        </div>
                      </div>

                      {/* Today's Schedule Overview */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                        <h3 className="font-extrabold text-gray-900 text-lg mb-4">Today’s Confirmed Sessions</h3>
                        <div className="space-y-3">
                          {[
                            { client: "Jamie Santos", focus: "Strength Assessment & Mobility", time: "9:00 AM" },
                            { client: "Chris Tan", focus: "Upper Body Hypertrophy", time: "1:30 PM" },
                            { client: "Bea Cruz", focus: "Functional Conditioning", time: "4:00 PM" },
                          ].map((s) => (
                            <div
                              key={s.client}
                              className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-bold text-sm text-gray-900">{s.client}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{s.focus}</p>
                              </div>
                              <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                                {s.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trainer: Client Requests Tab (Accept / Decline) */}
                  {activeTab === "requests" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Client Booking Requests</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Accept or decline incoming training sessions from FitMap members.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {trainerRequests.map((req) => (
                          <div
                            key={req.id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base text-gray-900">{req.client}</h3>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    req.status === "Pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : req.status === "Accepted"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Session: <b className="text-gray-800">{req.session}</b>
                              </p>
                              <p className="text-xs text-emerald-700 font-semibold mt-0.5">🗓️ {req.schedule}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status === "Pending" ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setTrainerRequests((list) =>
                                        list.map((item) => (item.id === req.id ? { ...item, status: "Declined" } : item))
                                      );
                                      notify(`Declined request from ${req.client}.`);
                                    }}
                                    className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => {
                                      setTrainerRequests((list) =>
                                        list.map((item) => (item.id === req.id ? { ...item, status: "Accepted" } : item))
                                      );
                                      notify(`Accepted ${req.client}'s session! Added to your schedule.`);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#22c55e] text-white hover:bg-[#1eb354] text-xs font-bold shadow"
                                  >
                                    Accept Booking
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 font-semibold">Managed</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainer: Weekly Schedule Tab (Interactive toggle) */}
                  {activeTab === "schedule" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Weekly Availability & Schedule</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Click any time slot below to toggle between Available and Booked status.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {trainerSchedule.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => {
                              setTrainerSchedule((list) =>
                                list.map((item) => (item.id === slot.id ? { ...item, isBooked: !item.isBooked } : item))
                              );
                              notify(
                                `${slot.day} ${slot.time} toggled to ${
                                  !slot.isBooked ? "Booked" : "Available"
                                }`
                              );
                            }}
                            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                              slot.isBooked
                                ? "bg-amber-50 border-amber-200 text-amber-900"
                                : "bg-emerald-50 border-emerald-200 text-emerald-950 hover:border-emerald-400"
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                              {slot.day}
                            </span>
                            <p className="text-xs font-bold mt-1 leading-tight">{slot.time}</p>
                            <span
                              className={`mt-3 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                slot.isBooked ? "bg-amber-200 text-amber-900" : "bg-[#22c55e] text-white"
                              }`}
                            >
                              {slot.isBooked ? "Booked" : "Available (Click to toggle)"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainer: My Clients Tab */}
                  {activeTab === "clients" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Active Clients Roster</h2>
                        <p className="text-sm text-gray-500 mt-1">Trainee progress and past session notes.</p>
                      </div>

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: "Nicole Garcia", goal: "Hypertrophy & Squat Depth", sessions: 12, phone: "0918 111 2222" },
                          { name: "John Dela Cruz", goal: "Marathon & Core Endurance", sessions: 8, phone: "0919 555 6666" },
                          { name: "Paolo Reyes", goal: "Fat Loss & Conditioning", sessions: 5, phone: "0920 333 4444" },
                        ].map((c) => (
                          <div key={c.name} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="size-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                                {c.name.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-gray-900">{c.name}</h3>
                                <p className="text-xs text-gray-500">{c.phone}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">
                              Focus: <b className="text-gray-900">{c.goal}</b>
                            </p>
                            <p className="text-xs text-emerald-700 font-semibold mt-1">
                              {c.sessions} completed sessions
                            </p>
                            <button
                              onClick={() => notify(`Opened training notes for ${c.name}.`)}
                              className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-xs font-bold hover:bg-gray-50"
                            >
                              View Notes & Logs
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainer: Partner Gyms Tab */}
                  {activeTab === "gyms" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-gray-900">Affiliated Gym Locations</h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {gymsList.map((g) => (
                          <div key={g.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                            <img src={g.image} alt={g.name} className="size-20 rounded-xl object-cover shrink-0" />
                            <div>
                              <h3 className="font-bold text-base text-gray-900">{g.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{g.address}</p>
                              <p className="text-xs text-emerald-600 font-semibold mt-1">● {g.open}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =========================================
                  3. GYM OWNER POV TABS
                  ========================================= */}
              {currentUser.role === "Gym Owner" && (
                <>
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      <div className="bg-[#0b1c14] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#86efac] text-xs font-bold uppercase tracking-wider">
                          Gym Management Workspace
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                          {gymProfile.name} Operations Hub
                        </h2>
                        <p className="text-sm text-gray-300 mt-2">
                          Address: {gymProfile.address} · Phone: {gymProfile.phone}
                        </p>
                        <div className="mt-5 flex gap-3">
                          <button
                            onClick={() => setActiveTab("gym-profile")}
                            className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow"
                          >
                            Edit Gym Details
                          </button>
                          <button
                            onClick={() => setActiveTab("location")}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                          >
                            Update Map Pin
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Monthly Revenue</p>
                          <p className="text-3xl font-black text-[#22c55e] mt-2">₱184,600</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">+11.8% vs last month</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Active Subscribers</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">87</p>
                          <p className="text-xs text-gray-500 mt-1">Daily, weekly, monthly</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Weekly Check-Ins</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">64</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">High facility usage</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                          <p className="text-xs font-bold text-gray-400 uppercase">Rostered Coaches</p>
                          <p className="text-3xl font-black text-gray-900 mt-2">6</p>
                          <p className="text-xs text-gray-500 mt-1">All verified</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gym Owner: Gym Profile & Edit Tab */}
                  {activeTab === "gym-profile" && (
                    <div className="max-w-2xl bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Edit Gym Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Update your gym public information visible to all fitness seekers.
                        </p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          notify("Gym Profile details saved successfully!");
                          setActiveTab("dashboard");
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gym Name</label>
                          <input
                            value={gymProfile.name}
                            onChange={(e) => setGymProfile({ ...gymProfile, name: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Complete Address</label>
                          <input
                            value={gymProfile.address}
                            onChange={(e) => setGymProfile({ ...gymProfile, address: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                            <input
                              value={gymProfile.phone}
                              onChange={(e) => setGymProfile({ ...gymProfile, phone: e.target.value })}
                              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Operating Hours</label>
                            <input
                              value={gymProfile.hours}
                              onChange={(e) => setGymProfile({ ...gymProfile, hours: e.target.value })}
                              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Facility Description</label>
                          <textarea
                            rows={3}
                            value={gymProfile.description}
                            onChange={(e) => setGymProfile({ ...gymProfile, description: e.target.value })}
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-sm shadow hover:bg-[#1eb354] transition"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Gym Owner: Subscribers Tab */}
                  {activeTab === "subscribers" && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900">Current Members & Subscribers</h2>
                        <span className="text-xs text-gray-500 font-semibold">87 Active</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                              <th className="p-3">Member</th>
                              <th className="p-3">Plan</th>
                              <th className="p-3">Started</th>
                              <th className="p-3">Renewal Date</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {[
                              { name: "John Dela Cruz", plan: "30 Days Pass", start: "May 24", renewal: "Jun 24", status: "Active" },
                              { name: "Jamie Santos", plan: "30 Days Pass", start: "May 2", renewal: "Jun 2", status: "Active" },
                              { name: "Bea Cruz", plan: "Weekly Pass", start: "May 20", renewal: "May 27", status: "Renewal Due" },
                              { name: "Nicole Garcia", plan: "Quarterly Pass", start: "Jan 15", renewal: "Apr 15", status: "Active" },
                            ].map((row) => (
                              <tr key={row.name} className="hover:bg-gray-50">
                                <td className="p-3 font-bold text-gray-900">{row.name}</td>
                                <td className="p-3 font-medium text-gray-700">{row.plan}</td>
                                <td className="p-3 text-gray-500">{row.start}</td>
                                <td className="p-3 font-semibold text-emerald-700">{row.renewal}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full font-bold ${
                                      row.status === "Active"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Gym Owner: Map Location Pin Tab */}
                  {activeTab === "location" && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-5">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Pin Gym Map Location</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Click anywhere inside the map area below to reposition the public pin for your facility.
                        </p>
                      </div>

                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const newX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                          const newY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                          setGymProfile((prev) => ({ ...prev, pinX: newX, pinY: newY }));
                          notify(`Pin placed at ${newX}%, ${newY}%`);
                        }}
                        className="map-grid relative h-72 cursor-crosshair rounded-2xl border border-gray-200 overflow-hidden shadow-inner"
                      >
                        <span
                          style={{ left: `${gymProfile.pinX}%`, top: `${gymProfile.pinY}%` }}
                          className="absolute z-10 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#102c22] text-[#22c55e] flex items-center justify-center shadow-2xl ring-4 ring-white animate-bounce"
                        >
                          <Icon name="pin" className="size-6 text-[#22c55e]" />
                        </span>
                        <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-xl text-xs font-bold shadow text-gray-700">
                          📍 {gymProfile.address}
                        </div>
                      </div>

                      <button
                        onClick={() => notify("Gym map location saved and published!")}
                        className="w-full py-3.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-sm shadow hover:bg-[#1eb354] transition"
                      >
                        Save Public Map Location
                      </button>
                    </div>
                  )}

                  {/* Gym Owner: Trainer Roster */}
                  {activeTab === "trainers" && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-gray-900">Assigned Gym Coaches</h2>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {trainersList.slice(0, 3).map((t) => (
                          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                            <img src={t.image} alt={t.name} className="size-16 rounded-full object-cover mx-auto mb-2" />
                            <h3 className="font-bold text-center text-sm">{t.name}</h3>
                            <p className="text-xs text-center text-gray-500">{t.specialty}</p>
                            <p className="text-xs text-center text-amber-500 font-bold mt-1">★ {t.rating}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gym Owner: Reservations */}
                  {activeTab === "reservations" && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                      <h2 className="text-xl font-black text-gray-900 mb-4">Facility Check-Ins & Reservations</h2>
                      <div className="space-y-3">
                        {bookings.map((b) => (
                          <div key={b.id} className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-gray-900">{b.customerName}</p>
                              <p className="text-xs text-gray-500">{b.sessionType} · {b.date} at {b.time}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* =========================================
                  4. ADMIN POV TABS
                  ========================================= */}
              {currentUser.role === "Admin" && (
                <>
                  {activeTab === "dashboard" && (
                    <div className="space-y-6">
                      <div className="bg-[#1f2937] text-white rounded-3xl p-6 sm:p-8 relative shadow-lg">
                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#86efac] text-xs font-bold uppercase tracking-wider">
                          FitMap Central Administration
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                          Platform Telemetry & Governance
                        </h2>
                        <p className="text-sm text-gray-300 mt-2">
                          Manage gym verifications, trainer licensing approvals, and financial logs.
                        </p>
                      </div>

                      {/* 6 Admin Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-gray-900">{gymsList.length}</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Gyms</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-gray-900">{trainersList.length}</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Trainers</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-gray-900">152</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Total Users</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-gray-900">{bookings.length + 40}</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Bookings</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-gray-900">96</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Active Passes</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-xs">
                          <p className="text-2xl font-black text-[#22c55e]">₱298,450</p>
                          <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Gross Revenue</p>
                        </div>
                      </div>

                      {/* Partner Applications Queue */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-extrabold text-gray-900 text-lg">Partner Role Verification Requests</h3>
                          <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full">
                            {roleApplications.filter((a) => a.status === "Pending").length} Pending Review
                          </span>
                        </div>
                        <div className="space-y-3">
                          {roleApplications.map((app) => (
                            <div
                              key={app.id}
                              className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-gray-900">{app.applicant}</h4>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                    {app.role}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      app.status === "Approved"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : app.status === "Pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {app.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                  Focus: <b className="text-gray-800">{app.specialtyOrGym}</b> · Credentials: {app.proof}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {app.status === "Pending" ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setRoleApplications((list) =>
                                          list.map((item) => (item.id === app.id ? { ...item, status: "Declined" } : item))
                                        );
                                        notify(`Declined ${app.applicant}'s request.`);
                                      }}
                                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
                                    >
                                      Decline
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRoleApplications((list) =>
                                          list.map((item) => (item.id === app.id ? { ...item, status: "Approved" } : item))
                                        );
                                        notify(`Approved ${app.applicant} as a verified ${app.role}!`);
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg bg-[#22c55e] text-white hover:bg-[#1eb354] text-xs font-bold shadow"
                                    >
                                      Approve
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs font-bold text-gray-400">Processed</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin: Applications Tab */}
                  {activeTab === "applications" && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                      <h2 className="text-xl font-black text-gray-900">Partner Applications</h2>
                      <div className="space-y-3">
                        {roleApplications.map((app) => (
                          <div key={app.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm">{app.applicant} ({app.role})</p>
                              <p className="text-xs text-gray-500">{app.specialtyOrGym} · {app.proof}</p>
                            </div>
                            <span className="font-bold text-xs">{app.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin: Reports Tab */}
                  {activeTab === "reports" && (
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900">Platform Analytics & Management Report</h2>
                          <p className="text-xs text-gray-500 mt-1">Export official system report for management review</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 rounded-xl bg-[#22c55e] text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <Icon name="printer" className="size-4" /> Print Report
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="p-3 bg-white rounded-xl shadow-xs text-center">
                          <p className="text-xs font-bold text-gray-400">Total Gyms</p>
                          <p className="text-2xl font-black text-gray-900 mt-1">{gymsList.length}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-xs text-center">
                          <p className="text-xs font-bold text-gray-400">Total Trainers</p>
                          <p className="text-2xl font-black text-gray-900 mt-1">{trainersList.length}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-xs text-center">
                          <p className="text-xs font-bold text-gray-400">Total Users</p>
                          <p className="text-2xl font-black text-gray-900 mt-1">152</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-xs text-center">
                          <p className="text-xs font-bold text-gray-400">Gross Revenue</p>
                          <p className="text-2xl font-black text-[#22c55e] mt-1">₱298,450</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-3">Membership Breakdown</h3>
                        <div className="space-y-2">
                          {[
                            { name: "30 Days Pass", percent: "58%", color: "bg-[#102c22]" },
                            { name: "Weekly Fit Pass", percent: "27%", color: "bg-[#22c55e]" },
                            { name: "Daily Pass", percent: "15%", color: "bg-[#f59e0b]" },
                          ].map((item) => (
                            <div key={item.name} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span>{item.name}</span>
                                <b>{item.percent}</b>
                              </div>
                              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                <div style={{ width: item.percent }} className={`h-full rounded-full ${item.color}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin: Gyms Directory Tab */}
                  {activeTab === "gyms-admin" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                              Facility Infrastructure
                            </span>
                          </div>
                          <h2 className="text-2xl font-black text-gray-900 mt-1">Gyms Directory</h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Manage physical partner facilities, verify business permits, and monitor public map listings.
                          </p>
                        </div>
                        <button
                          onClick={() => notify("New partner gym onboarding form opened.")}
                          className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow hover:bg-[#1eb354] transition shrink-0"
                        >
                          + Add Partner Gym
                        </button>
                      </div>

                      {/* Gyms Table */}
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                              <tr>
                                <th className="p-3.5">Gym Facility</th>
                                <th className="p-3.5">Location / Address</th>
                                <th className="p-3.5">Operating Hours</th>
                                <th className="p-3.5">Assigned Coaches</th>
                                <th className="p-3.5">Rating</th>
                                <th className="p-3.5">Verification</th>
                                <th className="p-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {gymsList.map((gym) => (
                                <tr key={gym.id} className="hover:bg-gray-50/80">
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={gym.image}
                                        alt={gym.name}
                                        className="size-10 rounded-xl object-cover shrink-0"
                                      />
                                      <div>
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{gym.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">ID: #{gym.id} · {gym.phone}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-gray-600 max-w-xs truncate">{gym.address}</td>
                                  <td className="p-3.5 font-medium text-gray-700">{gym.open}</td>
                                  <td className="p-3.5">
                                    <span className="font-semibold text-gray-900">
                                      {gym.id === 1 ? "3 Coaches" : gym.id === 2 ? "4 Coaches" : "2 Coaches"}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-bold text-amber-500">★ {gym.rating}</span>{" "}
                                    <span className="text-gray-400">({gym.reviews})</span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      Verified
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right space-x-1">
                                    <button
                                      onClick={() => setSelectedGymForModal(gym.id)}
                                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-100"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => notify(`${gym.name} status updated.`)}
                                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
                                    >
                                      Manage
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin: Membership Plans Tab */}
                  {activeTab === "memberships-admin" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                              Access Tiers & Commercial Pricing
                            </span>
                          </div>
                          <h2 className="text-2xl font-black text-gray-900 mt-1">Membership Plans</h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Manage standardized pass tiers, subscription rates, active member distribution, and plan revenues.
                          </p>
                        </div>
                        <button
                          onClick={() => notify("New membership package tier modal opened.")}
                          className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-xs shadow hover:bg-[#1eb354] transition shrink-0"
                        >
                          + Create New Plan Tier
                        </button>
                      </div>

                      {/* Plans Grid with Stats */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          {
                            name: "Day Pass",
                            duration: "1 Day (24h)",
                            basePrice: "₱150",
                            subscribers: "184 Users",
                            revenue: "₱27,600",
                            status: "Active",
                            popular: false,
                          },
                          {
                            name: "Weekly Fit",
                            duration: "7 Days",
                            basePrice: "₱700",
                            subscribers: "426 Users",
                            revenue: "₱298,200",
                            status: "Active",
                            popular: false,
                          },
                          {
                            name: "30 Days Pass",
                            duration: "30 Days",
                            basePrice: "₱2,200",
                            subscribers: "674 Users",
                            revenue: "₱1,482,800",
                            status: "Active",
                            popular: true,
                          },
                          {
                            name: "Quarterly Pass",
                            duration: "90 Days",
                            basePrice: "₱5,800",
                            subscribers: "92 Users",
                            revenue: "₱533,600",
                            status: "Active",
                            popular: false,
                          },
                        ].map((plan) => (
                          <div
                            key={plan.name}
                            className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between ${
                              plan.popular ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                  {plan.duration}
                                </span>
                                {plan.popular && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22c55e] text-[#0d2116]">
                                    Most Popular
                                  </span>
                                )}
                              </div>
                              <h3 className="font-extrabold text-base text-gray-900">{plan.name}</h3>
                              <p className="text-2xl font-black text-gray-900 mt-2">{plan.basePrice}</p>
                              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
                                <div className="flex justify-between text-gray-500">
                                  <span>Active Subscribers:</span>
                                  <b className="text-gray-900">{plan.subscribers}</b>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                  <span>Gross Sales:</span>
                                  <b className="text-emerald-700 font-bold">{plan.revenue}</b>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {plan.status}
                              </span>
                              <button
                                onClick={() => notify(`${plan.name} pricing editor opened.`)}
                                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                              >
                                Edit Rate & Perks
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin: Trainers Directory Tab */}
                  {activeTab === "trainers-admin" && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-gray-900">Certified Trainers Directory</h2>
                          <p className="text-xs text-gray-500 mt-0.5">Manage coach credentials and affiliated gyms.</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                              <th className="p-3">Coach</th>
                              <th className="p-3">Specialty</th>
                              <th className="p-3">Affiliated Facility</th>
                              <th className="p-3">Hourly Rate</th>
                              <th className="p-3">Rating</th>
                              <th className="p-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {trainersList.map((t) => (
                              <tr key={t.id} className="hover:bg-gray-50">
                                <td className="p-3 font-bold text-gray-900">{t.name}</td>
                                <td className="p-3 text-emerald-700 font-semibold">{t.specialty}</td>
                                <td className="p-3 text-gray-600">{t.gymName}</td>
                                <td className="p-3 font-bold">₱{t.hourlyRate}</td>
                                <td className="p-3 font-semibold text-amber-500">★ {t.rating}</td>
                                <td className="p-3 text-right">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Verified
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Admin: All Bookings Tab */}
                  {activeTab === "bookings-admin" && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-gray-900">Platform-Wide Bookings Log</h2>
                          <p className="text-xs text-gray-500 mt-0.5">Live transaction and reservation records.</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                            <tr>
                              <th className="p-3">Customer</th>
                              <th className="p-3">Gym Facility</th>
                              <th className="p-3">Coach / Pass</th>
                              <th className="p-3">Schedule</th>
                              <th className="p-3">Price</th>
                              <th className="p-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-gray-50">
                                <td className="p-3 font-bold text-gray-900">{b.customerName}</td>
                                <td className="p-3 text-gray-600">{b.gymName}</td>
                                <td className="p-3 font-medium text-emerald-700">{b.trainerName || b.sessionType}</td>
                                <td className="p-3 text-gray-500">{b.date} at {b.time}</td>
                                <td className="p-3 font-bold">₱{b.price}</td>
                                <td className="p-3 text-right">
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      ) : (
        /* =========================================
            5. PUBLIC / DISCOVERY POV (Guest view)
            ========================================= */
        <div className="flex-1 flex flex-col">
          {/* Public Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#0d2116] text-[#22c55e] flex items-center justify-center font-bold">
                  <Icon name="dumbbell" className="size-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900">FitMap</span>
              </div>

              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                <button
                  onClick={() => {
                    const el = document.getElementById("public-gyms");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-black cursor-pointer"
                >
                  Find Gyms
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("public-trainers");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-black cursor-pointer"
                >
                  Trainers
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("public-how");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hover:text-black cursor-pointer"
                >
                  How It Works
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#22c55e] text-white hover:bg-[#1eb354] text-xs font-bold shadow"
                >
                  Create Account
                </button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="bg-[#0b1c14] text-white relative overflow-hidden py-16 sm:py-24 px-5">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_.8fr] gap-10 items-center">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#22c55e]">
                  Fitness discovery, made simple
                </span>
                <h1 className="text-4xl sm:text-6xl font-black mt-4 leading-tight tracking-tight">
                  Find Gyms.<br />Book Trainers.<br />
                  <span className="text-[#22c55e]">Reach Your Goals.</span>
                </h1>
                <p className="mt-5 text-base text-gray-300 max-w-xl leading-relaxed">
                  Discover quality fitness centers near you, compare certified coaches, and subscribe to flexible daily,
                  weekly, or monthly memberships all in one place.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById("public-gyms");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-6 py-3.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-sm shadow hover:bg-[#1eb354]"
                  >
                    Find Gyms Near Me 🏋️
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("register");
                      setAuthModalOpen(true);
                    }}
                    className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm"
                  >
                    Join FitMap Today
                  </button>
                </div>
              </div>

              {/* Quick Persona Tester Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur">
                <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider block mb-2">
                  Interactive Roles & Testing
                </span>
                <h3 className="font-extrabold text-xl text-white">Experience All 4 FitMap POVs</h3>
                <p className="text-xs text-gray-300 mt-1 mb-5">
                  Select any persona to jump directly into their dedicated workspace:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => switchRole("Member")}
                    className="p-3 rounded-xl bg-white/10 hover:bg-[#22c55e] hover:text-[#0d2116] text-left transition"
                  >
                    <b className="block text-xs">🏋️ John Dela Cruz</b>
                    <span className="text-[10px] text-gray-300">Member POV</span>
                  </button>
                  <button
                    onClick={() => switchRole("Trainer")}
                    className="p-3 rounded-xl bg-white/10 hover:bg-[#22c55e] hover:text-[#0d2116] text-left transition"
                  >
                    <b className="block text-xs">🥊 Coach Michael</b>
                    <span className="text-[10px] text-gray-300">Trainer POV</span>
                  </button>
                  <button
                    onClick={() => switchRole("Gym Owner")}
                    className="p-3 rounded-xl bg-white/10 hover:bg-[#22c55e] hover:text-[#0d2116] text-left transition"
                  >
                    <b className="block text-xs">🏢 Carlos Mendoza</b>
                    <span className="text-[10px] text-gray-300">Gym Owner POV</span>
                  </button>
                  <button
                    onClick={() => switchRole("Admin")}
                    className="p-3 rounded-xl bg-white/10 hover:bg-[#22c55e] hover:text-[#0d2116] text-left transition"
                  >
                    <b className="block text-xs">🛡️ Administrator</b>
                    <span className="text-[10px] text-gray-300">Admin Console</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* How FitMap Works */}
          <section id="public-how" className="max-w-7xl mx-auto px-5 py-16 w-full">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl font-black text-gray-900 mt-1">Your 5-Step Fitness Journey</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { step: "01", title: "Find Gyms", desc: "Discover quality fitness centers near your area." },
                { step: "02", title: "Choose Trainer", desc: "Compare specialties, rates, and verified reviews." },
                { step: "03", title: "Book & Subscribe", desc: "Reserve a session or activate daily & 30-day passes." },
                { step: "04", title: "Pay Online", desc: "Seamless instant booking confirmation." },
                { step: "05", title: "Work Out", desc: "Show your digital pass and crush your goals." },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                  <span className="size-9 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {item.step}
                  </span>
                  <h3 className="font-extrabold text-sm text-gray-900 mt-4">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Public Gym Finder Section */}
          <section id="public-gyms" className="max-w-7xl mx-auto px-5 py-10 w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Gym Locator</span>
                <h2 className="text-3xl font-black text-gray-900 mt-1">Explore Nearby Fitness Centers</h2>
              </div>
              <div className="flex gap-2">
                {["All gyms", "Under 1 km", "Top rated", "Open now"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedFilter === f
                        ? "bg-[#22c55e] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
              {visibleGyms.map((g) => (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44">
                      <img src={g.image} alt={g.name} className="size-full object-cover" />
                      <span className="absolute top-2 left-2 bg-white/95 text-xs font-bold px-2 py-0.5 rounded shadow">
                        {g.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-gray-900">{g.name}</h3>
                        <span className="text-xs font-bold text-amber-500">★ {g.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">📍 {g.area}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => setSelectedGymForModal(g.id)}
                      className="w-full py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs"
                    >
                      View Gym Details & Rates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Public Trainers Showcase */}
          <section id="public-trainers" className="max-w-7xl mx-auto px-5 py-12 w-full">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Expert Guidance</span>
              <h2 className="text-3xl font-black text-gray-900 mt-1">Popular Certified Coaches</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {trainersList.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                  <img src={t.image} alt={t.name} className="size-24 rounded-full object-cover mx-auto mb-3" />
                  <h3 className="font-bold text-sm text-gray-900">{t.name}</h3>
                  <p className="text-xs text-emerald-700 font-semibold">{t.specialty}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {t.gymName}</p>
                  <button
                    onClick={() => {
                      switchRole("Member");
                      setActiveTab("trainers");
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-[#0d2116] text-[#22c55e] font-bold text-xs hover:bg-black transition"
                  >
                    Book with Coach
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =========================================
          GLOBAL MODALS
          ========================================= */}

      {/* 1. LOGIN / SIGN UP MODAL (Fixes Login & Registration) */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <Icon name="x" className="size-5" />
            </button>

            <div className="text-center mb-6">
              <div className="size-12 rounded-2xl bg-emerald-50 text-[#22c55e] flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                <Icon name="dumbbell" className="size-6 text-[#22c55e]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                {authTab === "login" ? "Welcome Back to FitMap" : "Create Your FitMap Account"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {authTab === "login"
                  ? "Sign in to access your workout passes and coach schedules"
                  : "Join as a member, coach, or facility owner"}
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authTab === "login" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  authTab === "register" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Quick Demo Logins for instant testing */}
            <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
              <p className="text-[11px] font-bold text-emerald-950 mb-2 flex items-center gap-1">
                ⚡ Quick 1-Click Persona Sign-In:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Member", "Trainer", "Gym Owner", "Admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setAuthModalOpen(false);
                    }}
                    className="p-2 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 text-left text-xs font-bold text-gray-800 transition"
                  >
                    {r === "Member"
                      ? "🏋️ John (Member)"
                      : r === "Trainer"
                      ? "🥊 Michael (Trainer)"
                      : r === "Gym Owner"
                      ? "🏢 Carlos (Owner)"
                      : "🛡️ Admin"}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            {authTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-emerald-600 rounded" /> Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalOpen(false);
                      setForgotModalOpen(true);
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#22c55e] text-white font-bold text-sm shadow hover:bg-[#1eb354] transition mt-2"
                >
                  Sign In to FitMap
                </button>
              </form>
            ) : (
              /* Registration Form with Role Selection */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="maria@example.com"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">I want to join as</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Member", "Trainer", "Gym Owner"] as Role[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRegRole(r)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition text-center ${
                          regRole === r
                            ? "bg-[#22c55e] text-[#0d2116] border-[#22c55e]"
                            : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        {r === "Member" ? "🏋️ Member" : r === "Trainer" ? "🥊 Trainer" : "🏢 Gym Owner"}
                      </button>
                    ))}
                  </div>
                </div>

                {regRole !== "Member" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      {regRole === "Trainer" ? "Specialty (e.g. Strength / Boxing)" : "Gym Facility Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={regDetail}
                      onChange={(e) => setRegDetail(e.target.value)}
                      placeholder={regRole === "Trainer" ? "Strength & Conditioning" : "Iron Zone Fitness"}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#22c55e] text-white font-bold text-sm shadow hover:bg-[#1eb354] transition mt-2"
                >
                  Create {regRole} Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <Icon name="x" className="size-5" />
            </button>
            <div className="text-center mb-5">
              <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                🔑
              </div>
              <h2 className="text-xl font-black text-gray-900">Password Recovery</h2>
              <p className="text-xs text-gray-500 mt-1">Enter your registered email to receive reset instructions.</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForgotModalOpen(false);
                notify(`Password reset link dispatched to ${forgotEmail || "your email"}.`);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#22c55e] text-white font-bold text-sm shadow hover:bg-[#1eb354]"
              >
                Send Recovery Instructions
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. GYM DETAIL MODAL */}
      {selectedGymForModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedGymForModal(null)}
        >
          {(() => {
            const gym = gymsList.find((g) => g.id === selectedGymForModal)!;
            return (
              <div
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedGymForModal(null)}
                  className="absolute top-4 right-4 size-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <Icon name="x" className="size-5" />
                </button>
                <div className="h-56 rounded-2xl overflow-hidden mb-6 relative">
                  <img src={gym.image} alt={gym.name} className="size-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                    {gym.tag}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{gym.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">📍 {gym.address}</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-1">● {gym.open} · 📞 {gym.phone}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-500">★ {gym.rating} ({gym.reviews} reviews)</span>
                </div>

                <div className="mt-5">
                  <h3 className="font-bold text-sm text-gray-800 mb-2">Available Facilities</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {gym.facilities.map((f) => (
                      <span key={f} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Day pass from <b className="text-xl text-gray-900">₱{gym.price}</b></span>
                  <button
                    onClick={() => {
                      setSelectedGymForModal(null);
                      if (!signedIn) {
                        setAuthModalOpen(true);
                      } else {
                        setBookingModalGym(gym.id);
                        setBookingModalTrainer(1);
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#22c55e] text-white font-bold text-xs shadow hover:bg-[#1eb354]"
                  >
                    Book Pass / Coach at this Gym
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. BOOKING MODAL */}
      {bookingModalTrainer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setBookingModalTrainer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBookingModalTrainer(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <Icon name="x" className="size-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-11 rounded-2xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold text-xl">
                📅
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900">Book Training Session</h3>
                <p className="text-xs text-gray-500">
                  {trainersList.find((t) => t.id === bookingModalTrainer)?.name} · Iron Zone Fitness
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const tr = trainersList.find((t) => t.id === bookingModalTrainer)!;
                const newB: BookingItem = {
                  id: Date.now(),
                  customerName: currentUser.name,
                  gymName: tr.gymName,
                  trainerName: tr.name,
                  sessionType: bookingTypeInput,
                  date: bookingDateInput,
                  time: bookingTimeInput,
                  status: "Confirmed",
                  price: tr.hourlyRate,
                };
                setBookings((prev) => [newB, ...prev]);
                setBookingModalTrainer(null);
                notify(`Session confirmed with ${tr.name} on ${bookingDateInput}!`);
                setActiveTab("bookings");
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Date</label>
                <input
                  type="date"
                  required
                  value={bookingDateInput}
                  onChange={(e) => setBookingDateInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time Slot</label>
                <select
                  value={bookingTimeInput}
                  onChange={(e) => setBookingTimeInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="08:00 AM">08:00 AM - 10:00 AM</option>
                  <option value="09:30 AM">09:30 AM - 11:30 AM</option>
                  <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Session Program Focus</label>
                <select
                  value={bookingTypeInput}
                  onChange={(e) => setBookingTypeInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="Personal Training (1-on-1)">Personal Training (1-on-1)</option>
                  <option value="Strength & Mobility Assessment">Strength & Mobility Assessment</option>
                  <option value="Hypertrophy Technique Check">Hypertrophy Technique Check</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-bold">
                <span>Session Rate</span>
                <span>₱600.00</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#22c55e] text-white font-bold text-sm shadow hover:bg-[#1eb354]"
              >
                Confirm & Reserve Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0d2116] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#22c55e]/40"
        >
          <span className="text-base text-[#22c55e]">✔</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
