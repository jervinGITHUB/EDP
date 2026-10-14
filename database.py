"""
FitMap Database Layer (SQLite)
Defines all entity schemas, tables, relationships, and initial seed data.
Compatible with PyCharm and Python 3.8+.
"""

import sqlite3
import os
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fitmap.db")

def get_connection():
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes the SQLite schema with all entities and attributes."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Entity
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('member', 'trainer', 'owner', 'admin')),
        phone TEXT,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Gyms Entity
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS gyms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        province TEXT NOT NULL,
        distance_km REAL DEFAULT 1.0,
        latitude REAL DEFAULT 15.7906,
        longitude REAL DEFAULT 120.9984,
        phone TEXT,
        email TEXT,
        opening_hours TEXT,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        verified INTEGER DEFAULT 1,
        facilities TEXT, -- JSON array of facilities
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # 3. Trainers Entity
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trainers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        gym_id INTEGER,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        experience_years INTEGER DEFAULT 1,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        bio TEXT,
        hourly_rate REAL DEFAULT 500.0,
        image_url TEXT,
        phone TEXT,
        verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL
    );
    """)

    # 4. Membership Plans Entity
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS membership_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gym_id INTEGER NOT NULL,
        name TEXT NOT NULL, -- Daily Pass, Weekly Pass, Monthly Pass, 3 Months Pass
        duration_days INTEGER NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
    );
    """)

    # 5. User Memberships Entity (Subscribed plans)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_memberships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gym_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        plan_name TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('active', 'expired', 'cancelled')),
        price REAL NOT NULL,
        payment_method TEXT DEFAULT 'Secure Online Payment',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE CASCADE
    );
    """)

    # 6. Bookings Entity (Trainer and Gym visits)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        gym_id INTEGER NOT NULL,
        trainer_id INTEGER,
        user_name TEXT,
        gym_name TEXT,
        trainer_name TEXT,
        booking_date DATE NOT NULL,
        booking_time TEXT NOT NULL,
        session_type TEXT DEFAULT 'Personal Training',
        status TEXT NOT NULL CHECK(status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
        price REAL DEFAULT 0.0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
    );
    """)

    # 7. Trainer Schedule & Availability Entity
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trainer_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trainer_id INTEGER NOT NULL,
        day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
        time_slot TEXT NOT NULL,   -- e.g. '08:00 AM - 10:00 AM'
        is_booked INTEGER DEFAULT 0,
        FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE
    );
    """)

    # 8. Role Applications Entity (for Partner verification)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS role_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        applicant_name TEXT NOT NULL,
        requested_role TEXT NOT NULL CHECK(requested_role IN ('Trainer', 'Gym Owner')),
        specialty_or_gym TEXT,
        credentials_proof TEXT,
        status TEXT NOT NULL CHECK(status IN ('Pending', 'Approved', 'Declined')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Run safe column migrations if table already existed
    try:
        cursor.execute("ALTER TABLE gyms ADD COLUMN latitude REAL DEFAULT 15.7906;")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE gyms ADD COLUMN longitude REAL DEFAULT 120.9984;")
    except Exception:
        pass

    # Seed initial data if tables are empty
    cursor.execute("SELECT COUNT(*) FROM users;")
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)

    conn.commit()
    conn.close()
    print("FitMap SQLite database initialized at:", DB_PATH)

def seed_data(cursor):
    """Populates realistic seed data exactly matching the reference UI."""
    now = datetime.now()

    # 1. Seed Users (Admin, Gym Owner, Trainers, Member)
    users = [
        (1, "Admin User", "admin@fitmap.ph", "admin123", "admin", "09170000001", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", "System Administrator"),
        (2, "Carlos Mendoza", "owner.ironzone@fitmap.ph", "owner123", "owner", "09171234567", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", "Gym Owner - Iron Zone Fitness"),
        (3, "Coach Michael Reyes", "michael.reyes@fitmap.ph", "trainer123", "trainer", "09181112222", "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80", "Strength & Conditioning Specialist with 8 years of competitive coaching experience."),
        (4, "Coach John Dela Cruz", "john.cruz@fitmap.ph", "trainer123", "trainer", "09182223333", "https://images.unsplash.com/photo-1583468982228-33f1350265e9?auto=format&fit=crop&w=600&q=80", "Bodybuilding Specialist, 6 years experience helping athletes prep and sculpt."),
        (5, "Coach Sarah Lim", "sarah.lim@fitmap.ph", "trainer123", "trainer", "09183334444", "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80", "Weight Loss & Mobility Specialist, certified nutritionist."),
        (6, "Coach Mark Santos", "mark.santos@fitmap.ph", "trainer123", "trainer", "09184445555", "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80", "Muay Thai & Functional Combat Coach, 5 years experience."),
        (7, "John Dela Cruz", "john@example.com", "member123", "member", "09195556666", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", "Dedicated fitness enthusiast training for marathon and muscle building.")
    ]
    cursor.executemany("INSERT INTO users (id, name, email, password_hash, role, phone, avatar_url, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", users)

    # 2. Seed Gyms (From user reference UI: Iron Zone Fitness, Powerhouse Gym, Fit Republic, Elite Fitness Center)
    facilities_iron = json.dumps(["Cardio", "Strength Area", "Functional Area", "Locker", "Shower", "Parking"])
    facilities_power = json.dumps(["Heavy Free Weights", "Powerlifting Platforms", "Locker", "Showers", "Protein Bar"])
    facilities_republic = json.dumps(["Cardio Hub", "Crossfit Rig", "Sauna", "Wi-Fi", "Locker"])
    facilities_elite = json.dumps(["Air Conditioned Area", "Boxing Ring", "Pilates Reformer", "Parking"])

    gyms = [
        (1, 2, "Iron Zone Fitness", "Iron Zone Fitness is equipped with modern facilities, quality equipment, and a dedicated team to help you achieve your fitness goals.", "San Jose, Nueva Ecija", "San Jose", "Nueva Ecija", 0.6, 15.7906, 120.9984, "0917 123 4567", "ironzonefitness@email.com", "Mon - Sun: 6:00 AM - 10:00 PM", 4.6, 128, 1, facilities_iron, "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"),
        (2, None, "Powerhouse Gym", "The premier strength training and bodybuilding gym in Cabanatuan. Built for high performance and results.", "Cabanatuan City", "Cabanatuan", "Nueva Ecija", 1.2, 15.4859, 120.9658, "0918 333 9988", "cabanatuan@powerhouse.ph", "Mon - Sat: 5:30 AM - 11:00 PM", 4.4, 96, 1, facilities_power, "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80"),
        (3, None, "Fit Republic", "Functional fitness, group classes, and supportive community training for everyday athletes.", "Peñaranda, Nueva Ecija", "Peñaranda", "Nueva Ecija", 1.8, 15.3533, 121.0069, "0920 444 7766", "hello@fitrepublic.ph", "Mon - Sun: 6:00 AM - 9:00 PM", 4.7, 153, 1, facilities_republic, "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"),
        (4, None, "Elite Fitness Center", "Boutique state-of-the-art gym with boxing ring, private coaching rooms, and clean modern aesthetics.", "Gapan City, Nueva Ecija", "Gapan City", "Nueva Ecija", 2.3, 15.3086, 120.9472, "0919 777 1234", "contact@elitefitness.ph", "Mon - Sun: 24 Hours Open", 4.5, 88, 1, facilities_elite, "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80")
    ]
    cursor.executemany("INSERT INTO gyms (id, owner_id, name, description, address, city, province, distance_km, latitude, longitude, phone, email, opening_hours, rating, review_count, verified, facilities, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", gyms)

    # 3. Seed Trainers
    trainers = [
        (1, 3, 1, "Coach Michael Reyes", "Strength & Conditioning", 8, 4.9, 120, "Certified strength specialist helping athletes and beginners break plateaus with progressive overload.", 600.0, "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80", "09181112222", 1),
        (2, 4, 1, "Coach John Dela Cruz", "Bodybuilding Specialist", 6, 4.8, 95, "Specializing in hypertrophy, contest prep, and body recomposition.", 550.0, "https://images.unsplash.com/photo-1583468982228-33f1350265e9?auto=format&fit=crop&w=600&q=80", "09182223333", 1),
        (3, 5, 1, "Coach Sarah Lim", "Weight Loss Specialist", 7, 4.8, 102, "Sustainable weight loss, metabolic conditioning, and mobility training.", 500.0, "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80", "09183334444", 1),
        (4, 6, 1, "Coach Mark Santos", "Muay Thai Coach", 5, 4.7, 80, "Striking fundamentals, combat cardio, and functional endurance.", 550.0, "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=600&q=80", "09184445555", 1)
    ]
    cursor.executemany("INSERT INTO trainers (id, user_id, gym_id, name, specialty, experience_years, rating, review_count, bio, hourly_rate, image_url, phone, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", trainers)

    # 4. Seed Membership Plans (From reference UI)
    plans = [
        (1, 1, "Daily Pass", 1, 150.0, "Single day full access to Iron Zone gym facilities."),
        (2, 1, "Weekly Pass", 7, 700.0, "7-day unlimited access to all training zones and showers."),
        (3, 1, "Monthly Pass", 30, 2200.0, "30-day all-access membership including locker usage."),
        (4, 1, "3 Months Pass", 90, 5800.0, "Quarterly pass with 1 complimentary fitness assessment."),
        (5, 2, "Daily Pass", 1, 140.0, "Single entry to Powerhouse Gym."),
        (6, 2, "Monthly Pass", 30, 2100.0, "Full access to heavy lifting platforms."),
        (7, 3, "Monthly Pass", 30, 1950.0, "Functional classes + free weights access."),
        (8, 4, "Monthly Pass", 30, 2500.0, "24/7 unlimited access pass.")
    ]
    cursor.executemany("INSERT INTO membership_plans (id, gym_id, name, duration_days, price, description) VALUES (?, ?, ?, ?, ?, ?);", plans)

    # 5. Seed User Memberships (Matches User Dashboard: Monthly Pass, Iron Zone Fitness, Valid until Jun 15, 2025)
    start_date = (now - timedelta(days=15)).strftime("%Y-%m-%d")
    end_date = (now + timedelta(days=30)).strftime("%Y-%m-%d")
    user_memberships = [
        (1, 7, 1, 3, "Monthly Pass", start_date, end_date, "active", 2200.0, "GCash / Online")
    ]
    cursor.executemany("INSERT INTO user_memberships (id, user_id, gym_id, plan_id, plan_name, start_date, end_date, status, price, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", user_memberships)

    # 6. Seed Bookings (Matches reference UI: John Dela Cruz, Iron Zone Fitness, Coach Michael Reyes)
    tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    next_week = (now + timedelta(days=4)).strftime("%Y-%m-%d")
    bookings = [
        (1, 7, 1, 1, "John Dela Cruz", "Iron Zone Fitness", "Coach Michael Reyes", tomorrow, "08:00 AM", "Strength Assessment", "Confirmed", 600.0, "Focus on squat form and core stability."),
        (2, 7, 1, 1, "John Dela Cruz", "Iron Zone Fitness", "Coach Michael Reyes", next_week, "09:30 AM", "Personal Training", "Pending", 600.0, "Progressive overload session 2."),
        (3, 7, 1, 3, "Maria Santos", "Iron Zone Fitness", "Coach Sarah Lim", (now + timedelta(days=2)).strftime("%Y-%m-%d"), "09:00 AM", "Weight Loss Routine", "Pending", 500.0, "First time consultation."),
        (4, 7, 2, 2, "Mark Villanueva", "Powerhouse Gym", "Coach John Dela Cruz", (now + timedelta(days=3)).strftime("%Y-%m-%d"), "07:00 AM", "Bodybuilding Posing & Hypertrophy", "Confirmed", 550.0, "Chest & Delts workout.")
    ]
    cursor.executemany("INSERT INTO bookings (id, user_id, gym_id, trainer_id, user_name, gym_name, trainer_name, booking_date, booking_time, session_type, status, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", bookings)

    # 7. Seed Trainer Schedules
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    slots = ["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"]
    sched_list = []
    idx = 1
    for t_id in [1, 2, 3, 4]:
        for d in days:
            for s in slots:
                is_b = 1 if (t_id == 1 and d == "Tuesday" and "08:00" in s) else 0
                sched_list.append((idx, t_id, d, s, is_b))
                idx += 1
    cursor.executemany("INSERT INTO trainer_schedules (id, trainer_id, day_of_week, time_slot, is_booked) VALUES (?, ?, ?, ?, ?);", sched_list)

    # 8. Seed Role Applications
    apps = [
        (1, 7, "John Dela Cruz", "Trainer", "Crossfit & Kettlebell", "Certified Level 1 Crossfit Certificate + Valid PRC ID", "Pending")
    ]
    cursor.executemany("INSERT INTO role_applications (id, user_id, applicant_name, requested_role, specialty_or_gym, credentials_proof, status) VALUES (?, ?, ?, ?, ?, ?, ?);", apps)

if __name__ == "__main__":
    init_db()
