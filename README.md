# CrewForge AI (Crew Connect)

> **AI-Powered Crew Assembly Platform** for events, productions, and festivals.

CrewForge AI is a desktop-first web application designed to help event organizers seamlessly assemble, match, and manage freelance event crews with intelligent AI recommendations, automated standby contingencies, and roster management.

---

## 🎨 Visual Ground Truth & Design Specifications

- **Reference Canvas**: Desktop-first (1536 × 1024 px)
- **Sidebar**: Fixed ~294px wide, `#101D4B` (Dark Navy) with active `#563CF0` (Electric Purple) pill navigation and bottom calendar/crew illustration
- **Top Navigation**: Fixed ~74px high with unified search, Help Centre, notifications bell, and user profile
- **Main Canvas**: `#F2F5FD` (Light Lavender) background with `#FFFFFF` white cards and `#142653` navy headings
- **Color Tokens**:
  - Primary Action / Buttons: `#563CF0`
  - Violet Accent / AI Gradient: `#7545F5` to `#563CF0`
  - Card & Form Borders: `#EAEFF8` / `#DFE5F2`
  - Online / Available Status: `#10B981` / `#E8F8F0`

---

## 🚀 Key Modules & Pages

### 1. Create New Event
- Two-column form: Event Name, Event Type, Event Date, Location, Total Budget (₹), Crew Members Needed.
- Full-width fields: Required Crew Roles, Additional Requirements.
- Action triggers: `Cancel` and `Save & Find Crew →`.

### 2. Find Crew
- Top AI suggestion banner (`Get AI Suggestions →`).
- **Filter Panel**: Role/skill dropdown, Experience Level, Availability, Price range slider (₹1,000 to ₹10,000+), Rating (4.0+), and `Apply Filters`.
- **3-Column Freelancer Grid**: Profile portraits, verified badges, rating stars, reviews count, price per event, skill chips, availability notes, and interactive `View Profile` / `Select Crew` actions.

### 3. AI Recommendations
- **Event Summary Card**: Annual College Fest thumbnail, College Event tag, date, location, required roles tags, required crew count, and total budget.
- **Ranked Match Cards**: 98%, 95%, 92%, 90% AI match indicators, availability checkmarks, review counts, price per event, `View Profile` modal trigger, and favorite heart toggle.
- **AI Match Score Panel**: Purple gradient card with circular **94% Average Match Score** ring.
- **Why AI Recommendations?** card with 4 core value propositions.
- **Adjust Requirements** card linking back to event editing.

### 4. Dashboard
- Personalized welcome banner for Varsharani.
- 4 key metrics: Active Events, Crew Sourced, Avg Match Score (94%), Budget Allocated.
- Upcoming events list with quick links to view crew and edit event.
- Top-rated talent roster.

### 5. Assignments & Rosters
- Confirmed crew call sheet for production day.
- Live status tracker: `Confirmed`, `Briefed`, `On-Site`, `Completed`.
- Budget committed tracking and call sheet access.

### 6. Backup Crew & Risk Shield
- 100% redundancy coverage.
- Primary vs Standby contingency mappings.
- **1-Click Instant Swap** to handle emergencies and no-shows without production delays.

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (Lightning-fast HMR and bundling)
- **Tailwind CSS** (Custom theme tokens matching exact design hex values)
- **Lucide Icons** (Consistent iconography)

---

## 📦 Getting Started

```bash
# Clone the repository
git clone https://github.com/Sakshi-Pathare/CrewforgeAI.git

# Navigate to project folder
cd CrewforgeAI

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 📄 License
MIT
