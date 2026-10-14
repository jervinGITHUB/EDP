# FitMap - Python & SQLite Fitness Discovery & Management System

FitMap connects gyms, trainers, and fitness enthusiasts through location-based discovery, direct trainer booking, and flexible membership subscriptions.

---

## 🚀 How to Run in PyCharm

1. **Open Project in PyCharm**:
   - Open PyCharm.
   - Click **Open** and select this project directory.
2. **Select Python Interpreter**:
   - PyCharm will automatically detect your local Python installation (Python 3.8+).
   - No external `pip install` commands are needed because FitMap utilizes Python's built-in `http.server`, `sqlite3`, and `json` standard libraries!
3. **Run the Application**:
   - Open `app.py`.
   - Right-click anywhere in `app.py` and click **Run 'app'** (or press `Shift + F10`).
   - Open your browser at:
     ```
     http://localhost:3000
     ```

---

## 🗄️ Database Architecture (`fitmap.db`)

FitMap utilizes an embedded relational **SQLite** database (`fitmap.db`), automatically created and seeded on first run by `database.py`.

### 1. `users`
Represents all system actors (members, coaches, gym owners, administrators).
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `email` (TEXT UNIQUE)
- `password_hash` (TEXT)
- `role` (TEXT: `'member'`, `'trainer'`, `'owner'`, `'admin'`)
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)

### 2. `gyms`
Fitness centers and partner facilities.
- `id` (INTEGER PRIMARY KEY)
- `owner_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `name` (TEXT - e.g. Iron Zone Fitness, Powerhouse Gym)
- `description` (TEXT)
- `address` (TEXT - e.g. San Jose, Nueva Ecija)
- `city` (TEXT)
- `province` (TEXT)
- `distance_km` (REAL)
- `phone` (TEXT)
- `email` (TEXT)
- `opening_hours` (TEXT)
- `rating` (REAL)
- `review_count` (INTEGER)
- `verified` (INTEGER 0/1)
- `facilities` (TEXT - JSON array: Cardio, Strength Area, Lockers, Showers, etc.)
- `image_url` (TEXT)
- `created_at` (TIMESTAMP)

### 3. `trainers`
Certified coaches affiliated with partner gyms.
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `gym_id` (INTEGER, FOREIGN KEY -> `gyms.id`)
- `name` (TEXT)
- `specialty` (TEXT - Strength & Conditioning, Bodybuilding, Weight Loss, etc.)
- `experience_years` (INTEGER)
- `rating` (REAL)
- `review_count` (INTEGER)
- `bio` (TEXT)
- `hourly_rate` (REAL)
- `image_url` (TEXT)
- `phone` (TEXT)
- `verified` (INTEGER 0/1)
- `created_at` (TIMESTAMP)

### 4. `membership_plans`
Rates and tiers offered by partner gyms.
- `id` (INTEGER PRIMARY KEY)
- `gym_id` (INTEGER, FOREIGN KEY -> `gyms.id`)
- `name` (TEXT - Daily Pass, Weekly Pass, Monthly Pass, 3 Months Pass)
- `duration_days` (INTEGER)
- `price` (REAL)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### 5. `user_memberships`
Active user subscriptions.
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `gym_id` (INTEGER, FOREIGN KEY -> `gyms.id`)
- `plan_id` (INTEGER, FOREIGN KEY -> `membership_plans.id`)
- `plan_name` (TEXT)
- `start_date` (DATE)
- `end_date` (DATE)
- `status` (TEXT: `'active'`, `'expired'`, `'cancelled'`)
- `price` (REAL)
- `payment_method` (TEXT)
- `created_at` (TIMESTAMP)

### 6. `bookings`
Personal training reservations and facility visits.
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `gym_id` (INTEGER, FOREIGN KEY -> `gyms.id`)
- `trainer_id` (INTEGER, FOREIGN KEY -> `trainers.id`)
- `user_name` (TEXT)
- `gym_name` (TEXT)
- `trainer_name` (TEXT)
- `booking_date` (DATE)
- `booking_time` (TEXT)
- `session_type` (TEXT)
- `status` (TEXT: `'Pending'`, `'Confirmed'`, `'Cancelled'`, `'Completed'`)
- `price` (REAL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

### 7. `trainer_schedules`
Weekly working hours and availability slots for coaches.
- `id` (INTEGER PRIMARY KEY)
- `trainer_id` (INTEGER, FOREIGN KEY -> `trainers.id`)
- `day_of_week` (TEXT - Monday, Tuesday, etc.)
- `time_slot` (TEXT - e.g. 08:00 AM - 10:00 AM)
- `is_booked` (INTEGER 0/1)

### 8. `role_applications`
Partner verification requests submitted to Administrators.
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `applicant_name` (TEXT)
- `requested_role` (TEXT: `'Trainer'`, `'Gym Owner'`)
- `specialty_or_gym` (TEXT)
- `credentials_proof` (TEXT)
- `status` (TEXT: `'Pending'`, `'Approved'`, `'Declined'`)
- `created_at` (TIMESTAMP)

---

## 👥 Distinct User POVs & Features

Use the **top sticky POV switcher** or role buttons to test each perspective:

1. 🌐 **Discovery / Guest POV**:
   - Hero banner with CTA buttons (`Find Gyms Near Me`, `Watch Demo`).
   - Dynamic search by gym name, city, category, and membership plan.
   - 5-step interactive "How FitMap Works" guide.
   - Nearby Gyms grid (Iron Zone Fitness, Powerhouse Gym, Fit Republic, Elite Fitness Center).
   - Detailed Gym Modal with Verified badge, facilities, operating hours, interactive map pin, rates table, and trainer profiles.
2. 🏋️ **User / Member POV (John Dela Cruz)**:
   - Dedicated User Sidebar (Dashboard, My Bookings, My Memberships, Find Trainers).
   - Real-time stat metrics (Upcoming Bookings, Active Memberships, Total Spent).
   - Active booking records with reschedule/cancel options.
   - Active membership card with validity date.
   - Direct modal to book personal training sessions into SQLite.
3. 🥊 **Trainer POV (Coach Michael Reyes)**:
   - Unique Trainer Workspace with weekly sessions, active clients, and earnings.
   - **Interactive Weekly Schedule & Availability Manager**: Click any time slot to toggle between Available and Booked.
   - **Client Session Requests**: Accept or decline incoming bookings with real status updates to SQLite.
4. 🏢 **Gym Owner POV (Carlos Mendoza - Iron Zone Fitness)**:
   - Unique Gym Owner Workspace with monthly revenue, active subscribers, and ratings.
   - **Gym Profile & Facility Editor**: Update gym name, address, phone, and hours saved directly to SQLite.
   - Membership rates overview (Daily ₱150, Weekly ₱700, Monthly ₱2,200, 3-Month ₱5,800).
   - Roster of assigned certified coaches.
5. 🛡️ **Admin Console**:
   - System overview metrics (25 Total Gyms, 48 Trainers, 152 Users, 134 Bookings, ₱298,450 Revenue).
   - Partner role application approval queue (Approve / Decline credentials).
   - Live transaction and booking log.
