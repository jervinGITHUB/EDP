"""
FitMap Data Models & Entities (PyCharm / SQLite Layer)
Defines Python classes and data helper methods for all domain entities.
"""

from database import get_connection
import json

class UserModel:
    """User Entity and Data Access."""
    @staticmethod
    def get_by_id(user_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_email(email):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_all():
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, role, phone, created_at FROM users ORDER BY id ASC")
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create(name, email, password_hash, role="member", phone="", bio=""):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role, phone, bio) VALUES (?, ?, ?, ?, ?, ?)",
            (name, email, password_hash, role, phone, bio)
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return new_id

    @staticmethod
    def update_profile(user_id, name, phone, bio):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE users SET name = ?, phone = ?, bio = ? WHERE id = ?",
            (name, phone, bio, user_id)
        )
        conn.commit()
        conn.close()


class GymModel:
    """Gym Entity and Data Access."""
    @staticmethod
    def get_all(search_query="", category="", membership_plan="", max_distance=None):
        conn = get_connection()
        cur = conn.cursor()
        query = "SELECT * FROM gyms WHERE 1=1"
        params = []

        if search_query:
            query += " AND (name LIKE ? OR city LIKE ? OR province LIKE ? OR address LIKE ?)"
            wildcard = f"%{search_query}%"
            params.extend([wildcard, wildcard, wildcard, wildcard])

        if max_distance is not None and max_distance != "":
            try:
                max_d = float(max_distance)
                query += " AND distance_km <= ?"
                params.append(max_d)
            except Exception:
                pass

        query += " ORDER BY rating DESC, distance_km ASC"
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()

        results = []
        for r in rows:
            d = dict(r)
            if d.get("facilities"):
                try:
                    d["facilities_list"] = json.loads(d["facilities"])
                except Exception:
                    d["facilities_list"] = []
            else:
                d["facilities_list"] = []
            results.append(d)
        return results

    @staticmethod
    def get_by_id(gym_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM gyms WHERE id = ?", (gym_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        try:
            d["facilities_list"] = json.loads(d.get("facilities") or "[]")
        except Exception:
            d["facilities_list"] = []
        return d

    @staticmethod
    def get_by_owner_id(owner_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM gyms WHERE owner_id = ?", (owner_id,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        try:
            d["facilities_list"] = json.loads(d.get("facilities") or "[]")
        except Exception:
            d["facilities_list"] = []
        return d

    @staticmethod
    def update(gym_id, name, address, city, phone, opening_hours, description, facilities_list):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE gyms
            SET name = ?, address = ?, city = ?, phone = ?, opening_hours = ?, description = ?, facilities = ?
            WHERE id = ?
        """, (name, address, city, phone, opening_hours, description, json.dumps(facilities_list), gym_id))
        conn.commit()
        conn.close()


class TrainerModel:
    """Trainer Entity and Data Access."""
    @staticmethod
    def get_all(gym_id=None):
        conn = get_connection()
        cur = conn.cursor()
        if gym_id:
            cur.execute("""
                SELECT t.*, g.name as gym_name, g.city as gym_city
                FROM trainers t
                LEFT JOIN gyms g ON t.gym_id = g.id
                WHERE t.gym_id = ?
                ORDER BY t.rating DESC
            """, (gym_id,))
        else:
            cur.execute("""
                SELECT t.*, g.name as gym_name, g.city as gym_city
                FROM trainers t
                LEFT JOIN gyms g ON t.gym_id = g.id
                ORDER BY t.rating DESC
            """)
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_id(trainer_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT t.*, g.name as gym_name, g.city as gym_city, g.address as gym_address
            FROM trainers t
            LEFT JOIN gyms g ON t.gym_id = g.id
            WHERE t.id = ?
        """, (trainer_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_user_id(user_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT t.*, g.name as gym_name, g.city as gym_city
            FROM trainers t
            LEFT JOIN gyms g ON t.gym_id = g.id
            WHERE t.user_id = ?
        """, (user_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_schedule(trainer_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM trainer_schedules WHERE trainer_id = ? ORDER BY id ASC", (trainer_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def toggle_schedule_slot(slot_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE trainer_schedules SET is_booked = 1 - is_booked WHERE id = ?", (slot_id,))
        conn.commit()
        conn.close()


class MembershipModel:
    """Membership Plan Entity & Subscriptions."""
    @staticmethod
    def get_plans_by_gym(gym_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM membership_plans WHERE gym_id = ? ORDER BY price ASC", (gym_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_plan_by_id(plan_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM membership_plans WHERE id = ?", (plan_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_user_memberships(user_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT um.*, g.name as gym_name, g.address as gym_address, g.image_url as gym_image
            FROM user_memberships um
            JOIN gyms g ON um.gym_id = g.id
            WHERE um.user_id = ?
            ORDER BY um.id DESC
        """, (user_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def subscribe_user(user_id, gym_id, plan_id, plan_name, duration_days, price):
        from datetime import datetime, timedelta
        start = datetime.now().strftime("%Y-%m-%d")
        end = (datetime.now() + timedelta(days=duration_days)).strftime("%Y-%m-%d")
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO user_memberships (user_id, gym_id, plan_id, plan_name, start_date, end_date, status, price)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
        """, (user_id, gym_id, plan_id, plan_name, start, end, price))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return new_id

    @staticmethod
    def renew(membership_id, days=30):
        from datetime import datetime, timedelta
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT end_date FROM user_memberships WHERE id = ?", (membership_id,))
        row = cur.fetchone()
        if row:
            try:
                curr_end = datetime.strptime(row["end_date"], "%Y-%m-%d")
            except Exception:
                curr_end = datetime.now()
            new_end = (curr_end + timedelta(days=days)).strftime("%Y-%m-%d")
            cur.execute("UPDATE user_memberships SET end_date = ?, status = 'active' WHERE id = ?", (new_end, membership_id))
            conn.commit()
        conn.close()


class BookingModel:
    """Booking Entity and Transactions."""
    @staticmethod
    def get_by_user(user_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT b.*, g.address as gym_address, g.image_url as gym_image
            FROM bookings b
            JOIN gyms g ON b.gym_id = g.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date ASC, b.booking_time ASC
        """, (user_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_trainer(trainer_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT b.*, u.phone as client_phone, u.avatar_url as client_avatar
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.trainer_id = ?
            ORDER BY b.booking_date ASC
        """, (trainer_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_by_gym(gym_id):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM bookings
            WHERE gym_id = ?
            ORDER BY booking_date DESC
        """, (gym_id,))
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_all():
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT b.*, u.email as user_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.id DESC
        """)
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create(user_id, gym_id, trainer_id, user_name, gym_name, trainer_name, booking_date, booking_time, session_type, price, notes=""):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO bookings (user_id, gym_id, trainer_id, user_name, gym_name, trainer_name, booking_date, booking_time, session_type, status, price, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?)
        """, (user_id, gym_id, trainer_id, user_name, gym_name, trainer_name, booking_date, booking_time, session_type, price, notes))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return new_id

    @staticmethod
    def update_status(booking_id, status):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE bookings SET status = ? WHERE id = ?", (status, booking_id))
        conn.commit()
        conn.close()


class RoleApplicationModel:
    """Partner Verification Application Entity."""
    @staticmethod
    def get_all():
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM role_applications ORDER BY id DESC")
        rows = cur.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def create(user_id, applicant_name, requested_role, specialty_or_gym, credentials_proof):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO role_applications (user_id, applicant_name, requested_role, specialty_or_gym, credentials_proof, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        """, (user_id, applicant_name, requested_role, specialty_or_gym, credentials_proof))
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return new_id

    @staticmethod
    def update_status(app_id, status):
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("UPDATE role_applications SET status = ? WHERE id = ?", (status, app_id))
        conn.commit()
        conn.close()


class ReportModel:
    """Report Generation & Analytics (Specific Objective 10)."""
    @staticmethod
    def get_summary():
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM gyms")
        total_gyms = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM trainers")
        total_trainers = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM bookings")
        total_bookings = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM user_memberships WHERE status = 'active'")
        active_memberships = cur.fetchone()[0]

        cur.execute("SELECT COALESCE(SUM(price), 0) FROM user_memberships")
        membership_rev = cur.fetchone()[0]

        cur.execute("SELECT COALESCE(SUM(price), 0) FROM bookings WHERE status = 'Confirmed'")
        booking_rev = cur.fetchone()[0]

        total_rev = membership_rev + booking_rev

        # Plan Breakdown
        cur.execute("""
            SELECT plan_name, COUNT(*) as count, SUM(price) as total
            FROM user_memberships
            GROUP BY plan_name
        """)
        plan_breakdown = [dict(r) for r in cur.fetchall()]

        # Booking Status Breakdown
        cur.execute("""
            SELECT status, COUNT(*) as count
            FROM bookings
            GROUP BY status
        """)
        booking_status = [dict(r) for r in cur.fetchall()]

        conn.close()
        return {
            "total_gyms": total_gyms,
            "total_trainers": total_trainers,
            "total_users": total_users,
            "total_bookings": total_bookings,
            "active_memberships": active_memberships,
            "total_revenue": total_rev,
            "plan_breakdown": plan_breakdown,
            "booking_status": booking_status
        }

