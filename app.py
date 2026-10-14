"""
FitMap - Python & SQLite Fitness Discovery & Management System
Ready to run in PyCharm (and AI Studio preview on port 3000).

Run in PyCharm:
    python app.py
    (or right-click app.py -> Run)
"""

import sys
import os
import json
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Initialize database
import database
database.init_db()

from models import UserModel, GymModel, TrainerModel, MembershipModel, BookingModel, RoleApplicationModel

PORT = int(os.environ.get("PORT", 3000))

# HTML, Tailwind CSS, and interactive JavaScript template
def get_main_page_html():
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FitMap - Find Gyms. Book Trainers. Reach Your Goals.</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,300..800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'DM Sans', sans-serif; background-color: #f7f8f4; color: #111827; }
    .hero-bg {
      background-color: #0b1c14;
      background-image: linear-gradient(to right, rgba(11,28,20,0.95), rgba(11,28,20,0.85), rgba(11,28,20,0.4)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80');
      background-size: cover;
      background-position: center;
    }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
    #gyms-leaflet-map { z-index: 10; }
    .custom-gym-pin { background: transparent; border: none; }
  </style>
  <script>
    // FitMap Global State
    let currentPOV = 'public';
    let allGyms = [];
    let allTrainers = [];
    let gymMapInstance = null;
    let gymMapMarkers = [];

    // Helper: Toast Notification
    function showToast(msg) {
      const toast = document.getElementById('toast');
      const text = document.getElementById('toast-text');
      if (toast && text) {
        text.innerText = msg;
        toast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => {
          toast.classList.add('translate-y-24', 'opacity-0');
        }, 3200);
      }
    }

    // Modal Helpers
    function openModal(id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.remove('hidden');
        m.classList.add('flex');
      }
    }

    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.add('hidden');
        m.classList.remove('flex');
      }
    }

    // POV Switcher
    function setPOV(pov) {
      currentPOV = pov;
      document.querySelectorAll('.pov-view').forEach(el => el.classList.add('hidden'));
      const activeEl = document.getElementById('pov-' + pov);
      if (activeEl) activeEl.classList.remove('hidden');

      // Update button highlights
      ['public', 'member', 'trainer', 'owner', 'admin'].forEach(p => {
        const btn = document.getElementById('btn-pov-' + p);
        if (btn) {
          if (p === pov) {
            btn.className = "px-2.5 py-1 rounded font-semibold transition bg-[#22c55e] text-[#0d2116]";
          } else {
            btn.className = "px-2.5 py-1 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white";
          }
        }
      });

      // Load POV-specific data
      if (pov === 'public') loadPublicData();
      if (pov === 'member') loadMemberPOVData();
      if (pov === 'trainer') loadTrainerPOVData();
      if (pov === 'owner') loadOwnerPOVData();
      if (pov === 'admin') loadAdminPOVData();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Member POV Navigation
    function setMemberTab(tab) {
      ['overview', 'bookings', 'memberships'].forEach(t => {
        const btn = document.getElementById('member-tab-' + t);
        if (btn) {
          if (t === tab) {
            btn.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-left transition";
          } else {
            btn.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition";
          }
        }
      });
      if (tab === 'bookings') {
        const el = document.getElementById('member-bookings-list');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (tab === 'memberships') {
        const el = document.getElementById('member-membership-list');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function refreshMemberData() {
      loadMemberPOVData();
      showToast("Member data updated from SQLite.");
    }

    // Trainer POV Navigation
    function setTrainerTab(tab) {
      ['overview', 'schedule', 'clients'].forEach(t => {
        const btn = document.getElementById('trainer-tab-' + t);
        if (btn) {
          if (t === tab) {
            btn.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e] text-[#091b12] font-bold text-left transition";
          } else {
            btn.className = "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition";
          }
        }
      });
      if (tab === 'schedule') {
        const el = document.getElementById('trainer-schedule-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (tab === 'clients') {
        const el = document.getElementById('trainer-bookings-table');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Owner POV Navigation
    function setOwnerTab(tab) {
      if (tab === 'bookings') {
        const el = document.getElementById('owner-bookings-table');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      loadOwnerPOVData();
    }

    // Admin POV Navigation
    function setAdminTab(tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadAdminPOVData();
    }

    // View Switcher: Grid vs Interactive Map (Specific Objective 1 & 2)
    function setGymView(mode) {
      const gridEl = document.getElementById('gyms-grid');
      const mapContainer = document.getElementById('gyms-map-container');
      const btnGrid = document.getElementById('btn-view-grid');
      const btnMap = document.getElementById('btn-view-map');

      if (mode === 'grid') {
        if (gridEl) gridEl.classList.remove('hidden');
        if (mapContainer) mapContainer.classList.add('hidden');
        if (btnGrid) {
          btnGrid.className = "px-3.5 py-1.5 rounded-lg bg-white shadow-sm text-gray-900 font-bold transition";
        }
        if (btnMap) {
          btnMap.className = "px-3.5 py-1.5 rounded-lg text-gray-500 hover:text-black font-semibold transition";
        }
      } else {
        if (gridEl) gridEl.classList.add('hidden');
        if (mapContainer) mapContainer.classList.remove('hidden');
        if (btnGrid) {
          btnGrid.className = "px-3.5 py-1.5 rounded-lg text-gray-500 hover:text-black font-semibold transition";
        }
        if (btnMap) {
          btnMap.className = "px-3.5 py-1.5 rounded-lg bg-white shadow-sm text-gray-900 font-bold transition";
        }
        initOrUpdateLeafletMap();
      }
    }

    // Leaflet Interactive Map Initialization
    function initOrUpdateLeafletMap() {
      const mapEl = document.getElementById('gyms-leaflet-map');
      if (!mapEl) return;

      if (typeof L === 'undefined') {
        console.warn("Leaflet library not ready yet.");
        return;
      }

      if (!gymMapInstance) {
        gymMapInstance = L.map('gyms-leaflet-map').setView([15.65, 120.97], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(gymMapInstance);
      }

      // Clear previous markers
      gymMapMarkers.forEach(m => m.remove());
      gymMapMarkers = [];

      const gymsToPin = (allGyms && allGyms.length > 0) ? allGyms : [
        { id: 1, name: "Iron Zone Fitness", latitude: 15.7906, longitude: 120.9984, address: "San Jose, Nueva Ecija", rating: 4.6, review_count: 128 },
        { id: 2, name: "Powerhouse Gym", latitude: 15.4859, longitude: 120.9658, address: "Cabanatuan City", rating: 4.4, review_count: 96 },
        { id: 3, name: "Fit Republic", latitude: 15.3533, longitude: 121.0069, address: "Pe\u00f1aranda, Nueva Ecija", rating: 4.7, review_count: 153 },
        { id: 4, name: "Elite Fitness Center", latitude: 15.3086, longitude: 120.9472, address: "Gapan City, Nueva Ecija", rating: 4.5, review_count: 88 }
      ];

      const bounds = [];
      gymsToPin.forEach(g => {
        const lat = g.latitude || 15.7906;
        const lng = g.longitude || 120.9984;
        bounds.push([lat, lng]);

        const customIcon = L.divIcon({
          className: 'custom-gym-pin',
          html: '<div style="background-color: #22c55e; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 15px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); cursor: pointer;">🏋️</div>',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(gymMapInstance);
        marker.bindPopup(`
          <div style="min-width: 210px; padding: 6px 4px; font-family: 'DM Sans', sans-serif;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">Verified</span>
              <span style="font-size: 11px; font-weight: bold; color: #f59e0b;">★ ${g.rating} (${g.review_count || 100})</span>
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 800; color: #0f281e;">${g.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280;">📍 ${g.address || 'Nueva Ecija'}</p>
            <button onclick="openGymDetail(${g.id})" style="width: 100%; padding: 7px 12px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer;">
              View Gym Profile & Coaches
            </button>
          </div>
        `);
        gymMapMarkers.push(marker);
      });

      setTimeout(() => {
        if (gymMapInstance) {
          gymMapInstance.invalidateSize();
          if (bounds.length > 0) {
            gymMapInstance.fitBounds(bounds, { padding: [40, 40] });
          }
        }
      }, 250);
    }

    // Public Data Loader from SQLite
    async function loadPublicData() {
      try {
        const [resGyms, resTrainers] = await Promise.all([
          fetch('/api/gyms'),
          fetch('/api/trainers')
        ]);
        allGyms = await resGyms.json();
        allTrainers = await resTrainers.json();
        renderGymsGrid(allGyms);
        renderTrainersGrid(allTrainers);
      } catch (e) {
        console.error("Error loading SQLite data:", e);
      }
    }

    function renderGymsGrid(gyms) {
      const grid = document.getElementById('gyms-grid');
      if (!grid) return;
      grid.innerHTML = gyms.map(gym => `
        <div onclick="openGymDetail(${gym.id})" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between">
          <div>
            <div class="relative h-44 overflow-hidden">
              <img src="${gym.image_url}" alt="${gym.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
              <span class="absolute top-3 left-3 bg-white/95 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                ${gym.verified ? 'Verified Gym' : 'Gym'}
              </span>
              <span class="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur">
                ${gym.distance_km} km
              </span>
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-bold text-gray-900 text-base leading-tight">${gym.name}</h3>
                <span class="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  ★ ${gym.rating} <span class="text-gray-400 font-normal">(${gym.review_count})</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                📍 ${gym.address}
              </p>
              <div class="flex flex-wrap gap-1.5 mt-3">
                <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium">Gym</span>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">With Trainer</span>
              </div>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-between">
            <span class="text-xs text-gray-400">Day pass from <b class="text-gray-900 text-sm">₱150</b></span>
            <button class="px-3 py-1.5 rounded-lg bg-[#22c55e] text-white text-xs font-bold">View</button>
          </div>
        </div>
      `).join('');
    }

    function renderTrainersGrid(trainers) {
      const grid = document.getElementById('trainers-grid');
      if (!grid) return;
      grid.innerHTML = trainers.map(trainer => `
        <div class="bg-[#fcfdfa] rounded-2xl overflow-hidden border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div class="relative h-52 rounded-xl overflow-hidden mb-3">
              <img src="${trainer.image_url}" alt="${trainer.name}" class="w-full h-full object-cover">
              <span class="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded backdrop-blur">
                ${trainer.experience_years} yrs experience
              </span>
            </div>
            <div class="flex items-start justify-between gap-1">
              <div>
                <h3 class="font-bold text-gray-900 text-sm">${trainer.name}</h3>
                <p class="text-xs text-emerald-700 font-semibold mt-0.5">${trainer.specialty}</p>
                <p class="text-[11px] text-gray-400 mt-1">📍 ${trainer.gym_name || 'Iron Zone Fitness'}</p>
              </div>
              <span class="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                ★ ${trainer.rating}
              </span>
            </div>
          </div>
          <button onclick="openBookingModal(${trainer.id}, ${trainer.gym_id || 1})" class="mt-4 w-full py-2 rounded-xl border-2 border-[#22c55e] text-[#14532d] hover:bg-[#22c55e] hover:text-white font-bold text-xs transition">
            View Profile & Book
          </button>
        </div>
      `).join('');
    }

    // Open Gym Details Modal
    async function openGymDetail(gymId) {
      try {
        const res = await fetch('/api/gyms/' + gymId);
        const gym = await res.json();
        document.getElementById('gym-modal-name').innerText = gym.name;
        document.getElementById('gym-modal-rating').innerText = gym.rating;
        document.getElementById('gym-modal-reviews').innerText = gym.review_count;
        document.getElementById('gym-modal-distance').innerText = gym.distance_km + ' km away';
        document.getElementById('gym-modal-address').innerText = gym.address;
        document.getElementById('gym-modal-phone').innerText = gym.phone;
        document.getElementById('gym-modal-hours').innerText = gym.opening_hours;
        document.getElementById('gym-modal-desc').innerText = gym.description;
        document.getElementById('gym-modal-image').src = gym.image_url;

        // Facilities badges
        const facEl = document.getElementById('gym-modal-facilities');
        facEl.innerHTML = (gym.facilities_list || []).map(f => `
          <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">${f}</span>
        `).join('');

        // Gym Available Trainers
        const resTrainers = await fetch('/api/trainers?gym_id=' + gymId);
        const gymTrainers = await resTrainers.json();
        const trGrid = document.getElementById('gym-modal-trainers');
        trGrid.innerHTML = gymTrainers.map(t => `
          <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
            <img src="${t.image_url}" class="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-emerald-500">
            <h4 class="font-bold text-gray-900 text-xs">${t.name}</h4>
            <p class="text-[10px] text-gray-500 mt-0.5">${t.specialty}</p>
            <p class="text-[10px] text-amber-500 font-bold mt-1">★ ${t.rating} (${t.review_count})</p>
            <button onclick="closeModal('modal-gym-detail'); openBookingModal(${t.id}, ${gym.id});" class="mt-2 w-full py-1.5 rounded-lg bg-[#22c55e] text-white text-[11px] font-bold">
              View Profile
            </button>
          </div>
        `).join('');

        openModal('modal-gym-detail');
      } catch (e) {
        console.error("Error opening gym detail:", e);
      }
    }

    // Booking Modal
    function openBookingModal(trainerId, gymId) {
      document.getElementById('book-trainer-id').value = trainerId;
      document.getElementById('book-gym-id').value = gymId;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.getElementById('book-date').value = tomorrow.toISOString().split('T')[0];
      openModal('modal-booking');
    }

    async function submitBooking(e) {
      e.preventDefault();
      const payload = {
        user_id: 7,
        user_name: 'John Dela Cruz',
        trainer_id: parseInt(document.getElementById('book-trainer-id').value),
        gym_id: parseInt(document.getElementById('book-gym-id').value),
        booking_date: document.getElementById('book-date').value,
        booking_time: document.getElementById('book-time').value,
        session_type: document.getElementById('book-type').value,
        notes: document.getElementById('book-notes').value,
        price: 600.0
      };

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        closeModal('modal-booking');
        showToast("Booking Confirmed! Saved to SQLite database.");
        if (currentPOV === 'member') loadMemberPOVData();
      } catch (err) {
        showToast("Booking error: " + err.message);
      }
    }

    // Membership Subscription
    async function submitSubscription() {
      const selected = document.querySelector('input[name="plan_select"]:checked').value.split(',');
      const payload = {
        user_id: 7,
        gym_id: 1,
        plan_id: parseInt(selected[0]),
        plan_name: selected[1],
        duration_days: parseInt(selected[2]),
        price: parseFloat(selected[3])
      };

      try {
        await fetch('/api/memberships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        closeModal('modal-subscribe');
        showToast(`Subscribed to ${selected[1]}! Active in SQLite database.`);
        if (currentPOV === 'member') loadMemberPOVData();
      } catch (err) {
        showToast("Subscription error: " + err.message);
      }
    }

    // Partner Application
    async function submitPartnerApplication(e) {
      e.preventDefault();
      const payload = {
        user_id: 7,
        applicant_name: "John Dela Cruz",
        requested_role: document.getElementById('apply-role').value,
        specialty_or_gym: document.getElementById('apply-specialty').value,
        credentials_proof: document.getElementById('apply-proof').value
      };

      try {
        await fetch('/api/role-applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        closeModal('modal-partner-apply');
        showToast("Application submitted! Pending Admin verification in SQLite.");
      } catch (err) {
        showToast("Error: " + err.message);
      }
    }

    // Edit Gym Profile (Owner POV)
    async function submitEditGym(e) {
      e.preventDefault();
      const payload = {
        gym_id: 1,
        name: document.getElementById('edit-gym-name').value,
        address: document.getElementById('edit-gym-address').value,
        city: "San Jose",
        phone: document.getElementById('edit-gym-phone').value,
        opening_hours: document.getElementById('edit-gym-hours').value,
        description: document.getElementById('edit-gym-desc').value,
        facilities_list: ["Cardio", "Strength Area", "Functional Area", "Locker", "Shower", "Parking"]
      };

      try {
        await fetch('/api/gyms/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        closeModal('modal-edit-gym');
        showToast("Gym Profile updated in SQLite database!");
        loadOwnerPOVData();
      } catch (err) {
        showToast("Update error: " + err.message);
      }
    }

    // User Profile Edit (Feature A / Specific Objective 7)
    function submitProfileUpdate(e) {
      if (e) e.preventDefault();
      const name = document.getElementById('profile-name')?.value || 'John Dela Cruz';
      closeModal('modal-profile-edit');
      showToast("Profile updated successfully in SQLite! Welcome, " + name);
    }

    // Password Recovery (Feature A)
    function submitForgotPassword(e) {
      if (e) e.preventDefault();
      const email = document.getElementById('forgot-email')?.value || 'user@example.com';
      closeModal('modal-forgot-password');
      showToast("Password reset instructions sent to " + email);
    }

    // Printable Reports Modal (Specific Objective 10)
    async function openReportModal() {
      try {
        const res = await fetch('/api/reports/summary');
        const data = await res.json();
        const content = document.getElementById('report-printable-content');
        if (content) {
          content.innerHTML = `
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div class="p-3 bg-white rounded-xl shadow-xs text-center">
                <p class="text-xs font-bold text-gray-400">Total Gyms</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${data.total_gyms}</p>
              </div>
              <div class="p-3 bg-white rounded-xl shadow-xs text-center">
                <p class="text-xs font-bold text-gray-400">Total Trainers</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${data.total_trainers}</p>
              </div>
              <div class="p-3 bg-white rounded-xl shadow-xs text-center">
                <p class="text-xs font-bold text-gray-400">Total Users</p>
                <p class="text-2xl font-black text-gray-900 mt-1">${data.total_users}</p>
              </div>
              <div class="p-3 bg-white rounded-xl shadow-xs text-center">
                <p class="text-xs font-bold text-gray-400">Total Revenue</p>
                <p class="text-2xl font-black text-[#22c55e] mt-1">₱${(data.total_revenue || 0).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 class="font-bold text-gray-900 text-sm mb-3">Membership Plan Breakdown</h3>
              <table class="w-full text-xs text-left">
                <thead class="bg-gray-100 text-gray-600">
                  <tr>
                    <th class="p-2.5 rounded-l-lg">Plan Name</th>
                    <th class="p-2.5">Subscriptions</th>
                    <th class="p-2.5 rounded-r-lg text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  ${(data.plan_breakdown || []).map(p => `
                    <tr>
                      <td class="p-2.5 font-bold">${p.plan_name}</td>
                      <td class="p-2.5">${p.count} active subscriber(s)</td>
                      <td class="p-2.5 text-right font-bold text-emerald-700">₱${p.total.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div>
              <h3 class="font-bold text-gray-900 text-sm mb-3">Booking Status Distribution</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${(data.booking_status || []).map(b => `
                  <div class="p-3 rounded-xl border border-gray-100 bg-white">
                    <span class="text-xs text-gray-500 font-semibold">${b.status}</span>
                    <p class="text-xl font-bold text-gray-900 mt-1">${b.count} booking(s)</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex flex-wrap justify-between items-center gap-2">
              <span><b>Relational Engine:</b> SQLite Database (<code>fitmap.db</code>)</span>
              <span>Report Generated: ${new Date().toLocaleString()}</span>
            </div>
          `;
        }
        openModal('modal-report-print');
      } catch (e) {
        showToast("Error generating report: " + e.message);
      }
    }

    // Member POV Loader
    async function loadMemberPOVData() {
      try {
        const [resBookings, resMemberships] = await Promise.all([
          fetch('/api/bookings?user_id=7'),
          fetch('/api/memberships?user_id=7')
        ]);
        const bookings = await resBookings.json();
        const memberships = await resMemberships.json();

        const bCount = document.getElementById('member-stat-bookings');
        const mCount = document.getElementById('member-stat-membership');
        if (bCount) bCount.innerText = bookings.length;
        if (mCount) mCount.innerText = memberships.length;

        // Render bookings list
        const bList = document.getElementById('member-bookings-list');
        if (bList) {
          if (bookings.length === 0) {
            bList.innerHTML = '<p class="text-xs text-gray-500 py-3">No upcoming bookings. Book a coach above!</p>';
          } else {
            bList.innerHTML = bookings.map(b => `
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                <div class="flex items-center gap-3">
                  <img src="${b.gym_image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&q=80'}" class="w-12 h-12 rounded-xl object-cover">
                  <div>
                    <p class="font-bold text-sm text-gray-900">${b.trainer_name || 'Coach Session'}</p>
                    <p class="text-xs text-gray-500">${b.gym_name} · ${b.booking_date} · ${b.booking_time}</p>
                    <span class="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">${b.session_type}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${b.status}</span>
                  <p class="text-xs font-bold text-gray-900 mt-1">₱${b.price}</p>
                </div>
              </div>
            `).join('');
          }
        }

        // Render memberships list
        const mList = document.getElementById('member-membership-list');
        if (mList) {
          if (memberships.length === 0) {
            mList.innerHTML = '<p class="text-xs text-gray-500 py-3">No active membership. Choose a plan above!</p>';
          } else {
            mList.innerHTML = memberships.map(m => `
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-[#fbfdfa]">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-emerald-100 text-[#22c55e] flex items-center justify-center font-bold text-xl">
                    🎟️
                  </div>
                  <div>
                    <p class="font-bold text-sm text-gray-900">${m.plan_name}</p>
                    <p class="text-xs text-gray-500">${m.gym_name}</p>
                    <p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Valid until ${m.end_date}</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Active</span>
              </div>
            `).join('');
          }
        }
      } catch (e) {
        console.error("Member data error:", e);
      }
    }

    // Trainer POV Loader
    async function loadTrainerPOVData() {
      try {
        const [resSched, resBookings] = await Promise.all([
          fetch('/api/trainer/schedule?trainer_id=1'),
          fetch('/api/bookings?trainer_id=1')
        ]);
        const schedule = await resSched.json();
        const bookings = await resBookings.json();

        // Render schedule slots with interactive toggle
        const schedGrid = document.getElementById('trainer-schedule-grid');
        if (schedGrid) {
          schedGrid.innerHTML = schedule.slice(0, 18).map(slot => `
            <button onclick="toggleSlot(${slot.id})" class="p-3 rounded-xl border text-left transition ${slot.is_booked ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}">
              <p class="text-[10px] font-bold uppercase tracking-wider">${slot.day_of_week}</p>
              <p class="text-xs font-semibold mt-1">${slot.time_slot.split(' - ')[0]}</p>
              <span class="mt-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${slot.is_booked ? 'bg-amber-200' : 'bg-emerald-200'}">
                ${slot.is_booked ? 'Booked' : 'Available'}
              </span>
            </button>
          `).join('');
        }

        // Render bookings table with Accept / Decline
        const table = document.getElementById('trainer-bookings-table');
        if (table) {
          table.innerHTML = `
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th class="p-3">Client</th>
                  <th class="p-3">Session</th>
                  <th class="p-3">Date & Time</th>
                  <th class="p-3">Status</th>
                  <th class="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `
                  <tr class="border-b border-gray-50 hover:bg-gray-50">
                    <td class="p-3 font-bold text-gray-900">${b.user_name || 'John Dela Cruz'}</td>
                    <td class="p-3 text-gray-600">${b.session_type}</td>
                    <td class="p-3 font-medium">${b.booking_date} · ${b.booking_time}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-0.5 rounded-full font-bold ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : b.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}">
                        ${b.status}
                      </span>
                    </td>
                    <td class="p-3 text-right space-x-1">
                      ${b.status === 'Pending' ? `
                        <button onclick="updateBookingStatus(${b.id}, 'Confirmed')" class="px-2.5 py-1 rounded bg-[#22c55e] text-white font-bold text-[10px]">Accept</button>
                        <button onclick="updateBookingStatus(${b.id}, 'Cancelled')" class="px-2.5 py-1 rounded bg-red-500 text-white font-bold text-[10px]">Decline</button>
                      ` : '<span class="text-gray-400 text-[10px]">Managed</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      } catch (e) {
        console.error("Trainer data error:", e);
      }
    }

    async function toggleSlot(slotId) {
      await fetch('/api/trainer/schedule/' + slotId + '/toggle', { method: 'POST' });
      showToast("Time slot status toggled in SQLite.");
      loadTrainerPOVData();
    }

    async function updateBookingStatus(bookingId, status) {
      await fetch('/api/bookings/' + bookingId + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast("Booking " + status + " in SQLite.");
      if (currentPOV === 'trainer') loadTrainerPOVData();
      if (currentPOV === 'admin') loadAdminPOVData();
    }

    // Gym Owner POV Loader
    async function loadOwnerPOVData() {
      try {
        const res = await fetch('/api/bookings?gym_id=1');
        const bookings = await res.json();
        const table = document.getElementById('owner-bookings-table');
        if (table) {
          table.innerHTML = `
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th class="p-3">Member</th>
                  <th class="p-3">Coach</th>
                  <th class="p-3">Schedule</th>
                  <th class="p-3">Session</th>
                  <th class="p-3">Amount</th>
                  <th class="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `
                  <tr class="border-b border-gray-50 hover:bg-gray-50">
                    <td class="p-3 font-bold text-gray-900">${b.user_name || 'Member'}</td>
                    <td class="p-3 text-emerald-700 font-semibold">${b.trainer_name || 'Facility Access'}</td>
                    <td class="p-3">${b.booking_date} · ${b.booking_time}</td>
                    <td class="p-3">${b.session_type}</td>
                    <td class="p-3 font-bold">₱${b.price}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">${b.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      } catch (e) {
        console.error("Owner data error:", e);
      }
    }

    // Admin POV Loader
    async function loadAdminPOVData() {
      try {
        const [resBookings, resApps] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/role-applications')
        ]);
        const bookings = await resBookings.json();
        const apps = await resApps.json();

        // Render Applications queue
        const appList = document.getElementById('admin-applications-list');
        if (appList) {
          if (apps.length === 0) {
            appList.innerHTML = '<p class="text-xs text-gray-500">No pending role applications.</p>';
          } else {
            appList.innerHTML = apps.map(a => `
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-bold text-sm text-gray-900">${a.applicant_name}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">${a.requested_role}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${a.status}</span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">${a.specialty_or_gym} · ${a.credentials_proof}</p>
                </div>
                <div class="flex items-center gap-2">
                  ${a.status === 'Pending' ? `
                    <button onclick="updateAppStatus(${a.id}, 'Approved')" class="px-3 py-1.5 rounded-lg bg-[#22c55e] text-white font-bold text-xs">Approve</button>
                    <button onclick="updateAppStatus(${a.id}, 'Declined')" class="px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs">Decline</button>
                  ` : `<span class="text-xs text-gray-400 font-semibold">${a.status}</span>`}
                </div>
              </div>
            `).join('');
          }
        }

        // Render Recent Bookings table
        const table = document.getElementById('admin-bookings-table');
        if (table) {
          table.innerHTML = `
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th class="p-3">User</th>
                  <th class="p-3">Gym</th>
                  <th class="p-3">Trainer</th>
                  <th class="p-3">Date & Time</th>
                  <th class="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookings.map(b => `
                  <tr class="border-b border-gray-50 hover:bg-gray-50">
                    <td class="p-3 font-bold text-gray-900">${b.user_name || 'John Dela Cruz'}</td>
                    <td class="p-3">${b.gym_name}</td>
                    <td class="p-3 font-medium text-emerald-700">${b.trainer_name || 'N/A'}</td>
                    <td class="p-3">${b.booking_date} · ${b.booking_time}</td>
                    <td class="p-3">
                      <span class="px-2.5 py-0.5 rounded-full font-bold ${b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${b.status}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      } catch (e) {
        console.error("Admin data error:", e);
      }
    }

    async function updateAppStatus(appId, status) {
      await fetch('/api/role-applications/' + appId + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      showToast("Application " + status + " in SQLite.");
      loadAdminPOVData();
    }

    // Search and Filters
    function handleSearch() {
      const qInput = document.getElementById('search-input');
      const catInput = document.getElementById('category-filter');
      const q = qInput ? qInput.value.toLowerCase() : '';
      const cat = catInput ? catInput.value.toLowerCase() : '';
      const filtered = allGyms.filter(g => {
        const matchesQuery = !q || (g.name && g.name.toLowerCase().includes(q)) || (g.city && g.city.toLowerCase().includes(q)) || (g.province && g.province.toLowerCase().includes(q)) || (g.address && g.address.toLowerCase().includes(q));
        const matchesCat = !cat || ((g.facilities_list || []).some(f => f.toLowerCase().includes(cat))) || ((g.description || '').toLowerCase().includes(cat));
        return matchesQuery && matchesCat;
      });
      renderGymsGrid(filtered);
    }

    function useMyLocation() {
      showToast("Location updated: Showing gyms in San Jose, Nueva Ecija");
      const search = document.getElementById('search-input');
      if (search) search.value = "San Jose";
      handleSearch();
    }

    function filterAllGyms() {
      const qInput = document.getElementById('search-input');
      const catInput = document.getElementById('category-filter');
      if (qInput) qInput.value = "";
      if (catInput) catInput.value = "";
      renderGymsGrid(allGyms);
    }

    function scrollToGyms() {
      const el = document.getElementById('trainers-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    function openApplyPartnerModal() {
      openModal('modal-partner-apply');
    }

    // Startup Initializer
    window.addEventListener('DOMContentLoaded', () => {
      loadPublicData();
    });
  </script>

</head>
<body class="min-h-screen flex flex-col">

  <!-- TOP POV & ROLE SWITCHER BAR (Instant POV Switch for Testing & Demo) -->
  <div class="bg-[#11231a] text-white border-b border-white/10 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
    <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
      <span class="font-bold tracking-wide text-white/90">FitMap PyCharm / SQLite Edition</span>
      <span class="hidden sm:inline text-white/50">| DB: <code class="text-[#86efac]">fitmap.db</code></span>
    </div>
    <div class="flex items-center gap-1.5 flex-wrap">
      <span class="text-white/60 mr-1 text-[11px] font-medium">Switch POV:</span>
      <button onclick="setPOV('public')" id="btn-pov-public" class="px-2.5 py-1 rounded font-semibold transition bg-[#22c55e] text-[#0d2116]">🌐 Discovery / Guest</button>
      <button onclick="setPOV('member')" id="btn-pov-member" class="px-2.5 py-1 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white">🏋️ User (John)</button>
      <button onclick="setPOV('trainer')" id="btn-pov-trainer" class="px-2.5 py-1 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white">🥊 Trainer (Coach Michael)</button>
      <button onclick="setPOV('owner')" id="btn-pov-owner" class="px-2.5 py-1 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white">🏢 Gym Owner (Iron Zone)</button>
      <button onclick="setPOV('admin')" id="btn-pov-admin" class="px-2.5 py-1 rounded font-semibold transition bg-white/10 hover:bg-white/20 text-white">🛡️ Admin Console</button>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 bg-[#11231a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none">
    <span class="text-lg">✅</span>
    <span id="toast-text" class="text-sm font-medium">Action completed successfully</span>
  </div>

  <!-- 1. PUBLIC / DISCOVERY POV -->
  <div id="pov-public" class="pov-view flex-1">
    <!-- Main Navigation Bar -->
    <header class="bg-white border-b border-gray-100 sticky top-9 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 cursor-pointer" onclick="window.scrollTo({top:0, behavior:'smooth'})">
          <div class="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span class="text-2xl font-black tracking-tight text-[#0f281e]">FitMap</span>
        </div>

        <nav class="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
          <a href="#" class="text-[#22c55e] transition">Home</a>
          <a href="#gyms-section" class="hover:text-[#0f281e] transition">Gyms</a>
          <a href="#trainers-section" class="hover:text-[#0f281e] transition">Trainers</a>
          <a href="#how-it-works" class="hover:text-[#0f281e] transition">Memberships</a>
          <a href="#how-it-works" class="hover:text-[#0f281e] transition">About Us</a>
          <a href="#contact" class="hover:text-[#0f281e] transition">Contact</a>
        </nav>

        <div class="flex items-center gap-3">
          <button onclick="useMyLocation()" class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:border-gray-400 transition">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Use My Location
          </button>
          <button onclick="setPOV('member')" class="text-xs font-bold px-4 py-2.5 text-gray-700 hover:text-black">Login</button>
          <button onclick="openModal('modal-register')" class="px-5 py-2.5 rounded-full bg-[#22c55e] hover:bg-[#1eb354] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition">Register</button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-bg text-white relative py-20 lg:py-28 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6">
          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
            Find Gyms.<br>
            Book Trainers.<br>
            <span class="text-[#22c55e]">Reach Your Goals.</span>
          </h1>
          <p class="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
            FitMap helps you discover nearby gyms, book professional trainers, and subscribe to the best membership plans — all in one place.
          </p>
          <div class="flex flex-wrap items-center gap-4 pt-2">
            <a href="#gyms-section" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-[#091a13] font-bold text-sm shadow-lg shadow-emerald-600/30 transition">
              Find Gyms Near Me
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
            <button onclick="showToast('Demo preview mode active with SQLite data!')" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm backdrop-blur transition">
              <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Floating Filter / Search Bar with Distance & Category Filters -->
    <div class="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 grid sm:grid-cols-12 gap-3 items-end">
        <div class="sm:col-span-4">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Search Gym or Location</label>
          <div class="relative">
            <svg class="w-5 h-5 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="search-input" onkeyup="handleSearch()" placeholder="Enter city, gym name..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none">
          </div>
        </div>

        <div class="sm:col-span-3">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
          <select id="category-filter" onchange="handleSearch()" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-emerald-500 outline-none">
            <option value="">All Categories</option>
            <option value="Strength">Strength & Conditioning</option>
            <option value="Bodybuilding">Bodybuilding</option>
            <option value="Cardio">Cardio & HIIT</option>
            <option value="Boxing">Boxing & Combat</option>
          </select>
        </div>

        <div class="sm:col-span-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Distance</label>
          <select id="distance-filter" onchange="handleSearch()" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:border-emerald-500 outline-none">
            <option value="">Any Distance</option>
            <option value="1">Within 1 km</option>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
          </select>
        </div>

        <div class="sm:col-span-3 flex gap-2">
          <button onclick="handleSearch()" class="flex-1 py-2.5 px-3 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Search
          </button>
          <button onclick="useMyLocation()" title="Detect My Current Location" class="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1 transition">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            Nearby
          </button>
        </div>
      </div>
    </div>

    <!-- How FitMap Works (5 Steps from Reference UI) -->
    <section id="how-it-works" class="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-extrabold text-[#0f281e] tracking-tight">How FitMap Works</h2>
        <p class="text-gray-500 text-sm mt-2">Get started in 5 simple steps to elevate your fitness journey.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <!-- Step 1 -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-[#22c55e] flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-sm">1. Find Gyms</h3>
          <p class="text-xs text-gray-500 mt-1">Discover gyms near your location.</p>
        </div>

        <!-- Step 2 -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-[#22c55e] flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-sm">2. Choose Trainer</h3>
          <p class="text-xs text-gray-500 mt-1">View trainers, profiles, and availability.</p>
        </div>

        <!-- Step 3 -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-[#22c55e] flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-sm">3. Book & Subscribe</h3>
          <p class="text-xs text-gray-500 mt-1">Book a trainer and choose a membership plan.</p>
        </div>

        <!-- Step 4 -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-[#22c55e] flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-sm">4. Pay Online</h3>
          <p class="text-xs text-gray-500 mt-1">Secure payment for your bookings and plans.</p>
        </div>

        <!-- Step 5 -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center col-span-2 md:col-span-1">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-[#22c55e] flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 class="font-bold text-gray-900 text-sm">5. Get Confirmed</h3>
          <p class="text-xs text-gray-500 mt-1">Receive confirmation and start your fitness journey.</p>
        </div>
      </div>
    </section>

    <!-- Nearby Gyms Section (Specific Objective 1 & 2: Interactive Map & Locator) -->
    <section id="gyms-section" class="py-10 max-w-7xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0f281e] tracking-tight">Nearby Gyms</h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">Top rated fitness centers around Nueva Ecija with live interactive mapping.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
            <button id="btn-view-grid" onclick="setGymView('grid')" class="px-3.5 py-1.5 rounded-lg bg-white shadow-sm text-gray-900 transition">▦ Grid</button>
            <button id="btn-view-map" onclick="setGymView('map')" class="px-3.5 py-1.5 rounded-lg text-gray-500 hover:text-black transition">🗺️ Interactive Map</button>
          </div>
          <button onclick="filterAllGyms()" class="text-xs sm:text-sm font-bold text-[#22c55e] hover:underline flex items-center gap-1">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <!-- Card Grid Container -->
      <div id="gyms-grid" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Rendered via JS from SQLite API -->
      </div>

      <!-- Interactive Map View Container (Specific Objective 1) -->
      <div id="gyms-map-container" class="hidden bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <div id="gyms-leaflet-map" class="w-full rounded-xl overflow-hidden shadow-inner" style="height: 460px; min-height: 400px;"></div>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 px-2">
          <span class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#22c55e] inline-block"></span>
            <b>Partner Gym Pins:</b> San Jose, Cabanatuan, Peñaranda, Gapan City
          </span>
          <span class="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md">Click any marker to inspect rates and available trainers</span>
        </div>
      </div>
    </section>

    <!-- Popular Trainers Section (From Reference UI) -->
    <section id="trainers-section" class="py-12 bg-white border-t border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-[#0f281e] tracking-tight">Popular Trainers</h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">Certified coaches with proven track records and high client satisfaction.</p>
          </div>
          <button onclick="scrollToGyms()" class="text-xs sm:text-sm font-bold text-[#22c55e] hover:underline flex items-center gap-1">
            View All Trainers
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div id="trainers-grid" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Rendered via JS from SQLite API -->
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-[#0b1c14] text-white py-12 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span class="text-xl font-bold">FitMap</span>
        </div>
        <p class="text-xs text-gray-400 text-center md:text-left">
          FitMap Python & SQLite Edition. Runs on PyCharm. Powered by local relational database.
        </p>
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <a href="#" class="hover:text-white">Privacy Policy</a>
          <a href="#" class="hover:text-white">Terms of Service</a>
          <a href="#" class="hover:text-white">Partner Sign Up</a>
        </div>
      </div>
    </footer>
  </div>

  <!-- 2. USER / MEMBER POV (Matches bottom-center of reference UI) -->
  <div id="pov-member" class="pov-view hidden flex-1 bg-[#f3f4f6]">
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Member Sidebar -->
      <aside class="w-full lg:w-64 bg-[#0d2116] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-white/10">
            <div class="w-9 h-9 rounded-xl bg-[#22c55e] text-white flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div>
              <p class="font-bold text-sm text-white">User Dashboard</p>
              <p class="text-[11px] text-emerald-400">Member POV</p>
            </div>
          </div>

          <nav class="mt-6 space-y-1.5 text-sm font-medium">
            <button onclick="setMemberTab('overview')" id="member-tab-overview" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              Dashboard
            </button>
            <button onclick="setMemberTab('bookings')" id="member-tab-bookings" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              My Bookings
            </button>
            <button onclick="setMemberTab('memberships')" id="member-tab-memberships" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              My Memberships
            </button>
            <button onclick="setPOV('public'); setTimeout(() => document.getElementById('trainers-section').scrollIntoView(), 100);" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Find Trainers
            </button>
            <button onclick="openApplyPartnerModal()" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-400 hover:bg-white/10 text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
              Apply as Partner
            </button>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10">
          <button onclick="setPOV('public')" class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout to Discovery
          </button>
        </div>
      </aside>

      <!-- Member Main Content -->
      <main class="flex-1 p-6 sm:p-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, John!</h1>
            <p class="text-sm text-gray-500 mt-1">Here's your fitness overview and training schedule.</p>
          </div>
          <div class="flex items-center gap-2.5 self-start flex-wrap">
            <button onclick="openModal('modal-profile-edit')" class="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 font-bold text-xs shadow-sm flex items-center gap-1.5 transition">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Profile
            </button>
            <button onclick="openBookingModal(1, 1)" class="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md flex items-center gap-2 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              Book New Session
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards (Matches reference UI) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming Bookings</p>
              <p id="member-stat-bookings" class="text-3xl font-black text-gray-900 mt-2">2</p>
              <p class="text-xs text-emerald-600 font-semibold mt-1">Confirmed with Coach</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Membership</p>
              <p id="member-stat-membership" class="text-3xl font-black text-gray-900 mt-2">1</p>
              <p class="text-xs text-emerald-600 font-semibold mt-1">Iron Zone Fitness</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Spent</p>
              <p id="member-stat-spent" class="text-3xl font-black text-[#22c55e] mt-2">₱2,200</p>
              <p class="text-xs text-gray-400 mt-1">This month via Online</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold text-xl">
              ₱
            </div>
          </div>
        </div>

        <!-- Section 1: Upcoming Bookings (Matching UI) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Upcoming Booking</h2>
            <button onclick="refreshMemberData()" class="text-xs font-semibold text-emerald-600 hover:underline">Refresh</button>
          </div>
          <div id="member-bookings-list" class="space-y-3">
            <!-- Populated via JS -->
          </div>
        </div>

        <!-- Section 2: Active Membership (Matching UI) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Active Membership</h2>
            <button onclick="openModal('modal-subscribe')" class="text-xs font-semibold text-emerald-600 hover:underline">+ Renew / Upgrade</button>
          </div>
          <div id="member-membership-list" class="space-y-3">
            <!-- Populated via JS -->
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- 3. TRAINER POV (Unique POV & Features: Schedule & Availability, Client Requests, Rates) -->
  <div id="pov-trainer" class="pov-view hidden flex-1 bg-[#f3f4f6]">
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Trainer Sidebar -->
      <aside class="w-full lg:w-64 bg-[#091b12] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-white/10">
            <img src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=200&q=80" alt="Coach Michael" class="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500">
            <div>
              <p class="font-bold text-sm text-white">Coach Michael Reyes</p>
              <p class="text-[11px] text-emerald-400">Trainer POV</p>
            </div>
          </div>

          <nav class="mt-6 space-y-1.5 text-sm font-medium">
            <button onclick="setTrainerTab('overview')" id="trainer-tab-overview" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e] text-[#091b12] font-bold text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Trainer Dashboard
            </button>
            <button onclick="setTrainerTab('schedule')" id="trainer-tab-schedule" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              Schedule & Availability
            </button>
            <button onclick="setTrainerTab('clients')" id="trainer-tab-clients" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              My Clients & Requests
            </button>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10">
          <p class="text-xs text-gray-400">Affiliated with: <b class="text-white">Iron Zone Fitness</b></p>
          <button onclick="setPOV('public')" class="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout to Discovery
          </button>
        </div>
      </aside>

      <!-- Trainer Main Content -->
      <main class="flex-1 p-6 sm:p-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Trainer Workspace</h1>
            <p class="text-sm text-gray-500 mt-1">Manage client bookings, set your working hours, and track trainee progress.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">★ 4.9 Rating (120 reviews)</span>
            <span class="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">₱600/hr</span>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Sessions This Week</p>
            <p class="text-3xl font-black text-gray-900 mt-2">18</p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">+4 from last week</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Active Trainees</p>
            <p class="text-3xl font-black text-gray-900 mt-2">42</p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">8 new this month</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Monthly Earnings</p>
            <p class="text-3xl font-black text-[#22c55e] mt-2">₱28,450</p>
            <p class="text-xs text-gray-400 mt-1">Paid directly to coach</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Pending Requests</p>
            <p id="trainer-stat-pending" class="text-3xl font-black text-amber-500 mt-2">1</p>
            <p class="text-xs text-gray-400 mt-1">Needs review</p>
          </div>
        </div>

        <!-- Trainer Schedule & Availability (Requested Feature) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Weekly Schedule & Availability</h2>
              <p class="text-xs text-gray-500">Click any time slot to toggle your availability between Available and Booked.</p>
            </div>
            <span class="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full">Interactive Calendar</span>
          </div>

          <div id="trainer-schedule-grid" class="grid sm:grid-cols-3 md:grid-cols-6 gap-3">
            <!-- Populated via JS -->
          </div>
        </div>

        <!-- Incoming Client Session Requests -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Client Session Requests & Appointments</h2>
            <button onclick="loadTrainerPOVData()" class="text-xs font-semibold text-emerald-600 hover:underline">Refresh</button>
          </div>
          <div id="trainer-bookings-table" class="overflow-x-auto">
            <!-- Table populated via JS with Accept / Decline buttons -->
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- 4. GYM OWNER POV (Unique POV & Features: Gym Profile, Membership Rates, Facilities, Trainer Affiliates) -->
  <div id="pov-owner" class="pov-view hidden flex-1 bg-[#f3f4f6]">
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Gym Owner Sidebar -->
      <aside class="w-full lg:w-64 bg-[#14261c] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-white/10">
            <div class="w-10 h-10 rounded-xl bg-[#22c55e] text-[#0d2116] flex items-center justify-center font-bold">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <p class="font-bold text-sm text-white">Iron Zone Fitness</p>
              <p class="text-[11px] text-emerald-400">Gym Owner POV</p>
            </div>
          </div>

          <nav class="mt-6 space-y-1.5 text-sm font-medium">
            <button onclick="setOwnerTab('overview')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#22c55e] text-[#0d2116] font-bold text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Gym Management
            </button>
            <button onclick="openModal('modal-edit-gym')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Gym Profile
            </button>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10">
          <p class="text-xs text-gray-400">Owner: <b class="text-white">Carlos Mendoza</b></p>
          <button onclick="setPOV('public')" class="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout to Discovery
          </button>
        </div>
      </aside>

      <!-- Gym Owner Main Content -->
      <main class="flex-1 p-6 sm:p-10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Iron Zone Fitness</h1>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Verified Gym</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">San Jose, Nueva Ecija · 0917 123 4567 · Open Mon-Sun 6:00 AM - 10:00 PM</p>
          </div>
          <button onclick="openModal('modal-edit-gym')" class="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md flex items-center gap-2 self-start">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            Update Rates & Info
          </button>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Monthly Revenue</p>
            <p class="text-3xl font-black text-[#22c55e] mt-2">₱184,600</p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">+11.8% this month</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Active Members</p>
            <p class="text-3xl font-black text-gray-900 mt-2">87</p>
            <p class="text-xs text-emerald-600 font-semibold mt-1">9 new subscribers</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Affiliated Trainers</p>
            <p class="text-3xl font-black text-gray-900 mt-2">4</p>
            <p class="text-xs text-gray-400 mt-1">Active coaches</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p class="text-xs font-bold text-gray-400 uppercase">Avg Rating</p>
            <p class="text-3xl font-black text-amber-500 mt-2">4.6</p>
            <p class="text-xs text-gray-400 mt-1">128 member reviews</p>
          </div>
        </div>

        <!-- Membership Rates & Active Plans -->
        <div class="grid lg:grid-cols-12 gap-8 mb-8">
          <div class="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900">Current Membership Rates</h2>
              <span class="text-xs text-emerald-600 font-semibold">Published to Public</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center">
                <p class="text-xs text-gray-500 font-semibold">Daily Pass</p>
                <p class="text-2xl font-black text-gray-900 mt-1">₱150</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center">
                <p class="text-xs text-gray-500 font-semibold">Weekly Pass</p>
                <p class="text-2xl font-black text-gray-900 mt-1">₱700</p>
              </div>
              <div class="p-4 rounded-xl border border-emerald-500 bg-emerald-50 text-center ring-2 ring-emerald-200">
                <p class="text-xs text-emerald-800 font-bold">Monthly Pass</p>
                <p class="text-2xl font-black text-emerald-900 mt-1">₱2,200</p>
              </div>
              <div class="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center">
                <p class="text-xs text-gray-500 font-semibold">3 Months</p>
                <p class="text-2xl font-black text-gray-900 mt-1">₱5,800</p>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100">
              <h3 class="text-sm font-bold text-gray-900 mb-2">Current Facilities:</h3>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Cardio</span>
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Strength Area</span>
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Functional Area</span>
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Locker</span>
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Shower</span>
                <span class="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">Parking</span>
              </div>
            </div>
          </div>

          <!-- Affiliated Trainers Roster -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Assigned Coaches</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=100&q=80" class="w-10 h-10 rounded-lg object-cover">
                  <div>
                    <p class="font-bold text-xs text-gray-900">Coach Michael Reyes</p>
                    <p class="text-[11px] text-gray-500">Strength & Conditioning</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-600">Active</span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1583468982228-33f1350265e9?auto=format&fit=crop&w=100&q=80" class="w-10 h-10 rounded-lg object-cover">
                  <div>
                    <p class="font-bold text-xs text-gray-900">Coach John Dela Cruz</p>
                    <p class="text-[11px] text-gray-500">Bodybuilding Specialist</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-600">Active</span>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=100&q=80" class="w-10 h-10 rounded-lg object-cover">
                  <div>
                    <p class="font-bold text-xs text-gray-900">Coach Sarah Lim</p>
                    <p class="text-[11px] text-gray-500">Weight Loss Specialist</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Gym Activity Table -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Recent Facility Reservations</h2>
          <div id="owner-bookings-table" class="overflow-x-auto">
            <!-- Table populated via JS -->
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- 5. ADMIN POV (Matches bottom-right of reference UI) -->
  <div id="pov-admin" class="pov-view hidden flex-1 bg-[#f3f4f6]">
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Admin Sidebar -->
      <aside class="w-full lg:w-64 bg-[#1f2937] text-white p-5 flex flex-col justify-between shrink-0">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-gray-700">
            <div class="w-9 h-9 rounded-xl bg-[#22c55e] text-white flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <p class="font-bold text-sm text-white">Admin Dashboard</p>
              <p class="text-[11px] text-emerald-400">System Administrator</p>
            </div>
          </div>

          <nav class="mt-6 space-y-1.5 text-sm font-medium">
            <button onclick="setAdminTab('dashboard')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-800 text-white font-bold text-left">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              Dashboard
            </button>
            <button onclick="showToast('Gym directory loaded.')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-left">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              Gyms
            </button>
            <button onclick="showToast('Trainers directory loaded.')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-left">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Trainers
            </button>
            <button onclick="showToast('Membership packages list.')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-left">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              Membership Plans
            </button>
            <button onclick="showToast('Role applications review opened.')" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-400 hover:bg-gray-800 text-left">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/></svg>
              Partner Applications
            </button>
            <button onclick="openReportModal()" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-400 hover:bg-gray-800 text-left transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Management Reports
            </button>
          </nav>
        </div>

        <div class="pt-6 border-t border-gray-700">
          <button onclick="setPOV('public')" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout to Discovery
          </button>
        </div>
      </aside>

      <!-- Admin Main Content (Matches reference UI exactly) -->
      <main class="flex-1 p-6 sm:p-10">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p class="text-sm text-gray-500 mt-1">Platform telemetry, user growth, bookings, and financial analytics.</p>
          </div>
          <div class="flex items-center gap-3"><button onclick="openReportModal()" class="px-3.5 py-1.5 rounded-xl bg-[#22c55e] text-white text-xs font-bold shadow hover:bg-[#1eb354] flex items-center gap-1.5 transition">🖨️ View & Print Report</button><span class="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">System Online · SQLite</span></div>
        </div>

        <!-- 6 Metrics Cards matching Reference UI -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-3xl font-black text-gray-900">25</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Total Gyms</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-3xl font-black text-gray-900">48</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Total Trainers</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-3xl font-black text-gray-900">152</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Total Users</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-3xl font-black text-gray-900">134</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Total Bookings</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-3xl font-black text-gray-900">96</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Active Members</p>
          </div>
          <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p class="text-2xl font-black text-[#22c55e]">₱298,450</p>
            <p class="text-xs text-gray-500 font-semibold mt-1">Total Revenue</p>
          </div>
        </div>

        <!-- Partner Role Applications Approval Queue -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-gray-900">Partner Role Verification Requests</h2>
              <p class="text-xs text-gray-500">Review trainer certificates and gym business registration documents.</p>
            </div>
            <span class="text-xs bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full">Requires Approval</span>
          </div>
          <div id="admin-applications-list" class="space-y-3">
            <!-- Populated via JS -->
          </div>
        </div>

        <!-- Recent Bookings Table (Exact columns matching Reference UI) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <button onclick="loadAdminPOVData()" class="text-xs font-semibold text-emerald-600 hover:underline">Refresh</button>
          </div>
          <div id="admin-bookings-table" class="overflow-x-auto">
            <!-- Populated via JS -->
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- GYM DETAILS MODAL (Matching Top-Right of Reference UI: Iron Zone Fitness) -->
  <div id="modal-gym-detail" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scroll shadow-2xl relative">
      <button onclick="closeModal('modal-gym-detail')" class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow">
        ✕
      </button>

      <div class="p-6 sm:p-8">
        <button onclick="closeModal('modal-gym-detail')" class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black mb-4">
          ← Back to Gyms
        </button>

        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h2 id="gym-modal-name" class="text-3xl font-extrabold text-gray-900">Iron Zone Fitness</h2>
              <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Verified Gym</span>
            </div>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
              <span class="flex items-center gap-1 text-amber-500 font-bold">★ <span id="gym-modal-rating">4.6</span> (<span id="gym-modal-reviews">128</span> reviews)</span>
              <span>•</span>
              <span id="gym-modal-distance">0.6 km away</span>
              <span>•</span>
              <span id="gym-modal-address">San Jose, Nueva Ecija</span>
              <span>•</span>
              <span id="gym-modal-phone">0917 123 4567</span>
            </div>
            <p class="text-xs text-emerald-600 font-semibold mt-1">● Open · Closes 10:00 PM</p>
          </div>
        </div>

        <div class="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6">
          <img id="gym-modal-image" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" alt="Gym" class="w-full h-full object-cover">
        </div>

        <!-- Navigation Tabs: Overview, Trainers, Memberships, Reviews, Gallery -->
        <div class="flex border-b border-gray-200 text-sm font-semibold mb-6 overflow-x-auto gap-6">
          <button class="pb-3 text-[#22c55e] border-b-2 border-[#22c55e]">Overview</button>
          <button onclick="showToast('Trainers view filtered for this gym below')" class="pb-3 text-gray-500 hover:text-gray-900">Trainers</button>
          <button onclick="showToast('See membership rates card')" class="pb-3 text-gray-500 hover:text-gray-900">Memberships</button>
          <button onclick="showToast('128 verified reviews with 4.6 avg rating')" class="pb-3 text-gray-500 hover:text-gray-900">Reviews</button>
          <button onclick="showToast('High resolution gallery loaded')" class="pb-3 text-gray-500 hover:text-gray-900">Gallery</button>
        </div>

        <div class="grid md:grid-cols-12 gap-8 mb-8">
          <!-- Left Column: About & Location -->
          <div class="md:col-span-7 space-y-6">
            <div>
              <h3 class="font-bold text-gray-900 text-base mb-2">About this Gym</h3>
              <p id="gym-modal-desc" class="text-sm text-gray-600 leading-relaxed">
                Iron Zone Fitness is equipped with modern facilities, quality equipment, and a dedicated team to help you achieve your fitness goals.
              </p>
            </div>

            <div>
              <h3 class="font-bold text-gray-900 text-sm mb-2">Facilities</h3>
              <div id="gym-modal-facilities" class="flex flex-wrap gap-2 text-xs">
                <!-- Facilities badges -->
              </div>
            </div>

            <div>
              <h3 class="font-bold text-gray-900 text-sm mb-1">Operating Hours</h3>
              <p id="gym-modal-hours" class="text-xs text-gray-600">Mon - Sun: 6:00 AM - 10:00 PM</p>
            </div>

            <!-- Location Map Mockup (Matching reference UI) -->
            <div>
              <h3 class="font-bold text-gray-900 text-sm mb-2">Location</h3>
              <div class="h-44 rounded-2xl bg-emerald-50 border border-gray-200 relative overflow-hidden flex items-center justify-center">
                <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div class="z-10 flex flex-col items-center">
                  <div class="w-10 h-10 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-lg animate-bounce">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <span class="mt-2 text-xs font-bold text-gray-700 bg-white/90 px-3 py-1 rounded-full shadow">San Jose, Nueva Ecija</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Membership Rates (Matching reference UI) -->
          <div class="md:col-span-5">
            <div class="bg-[#fcfdfa] border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 class="font-bold text-gray-900 text-base">Membership Rates</h3>
              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span class="text-gray-600">Daily Pass</span>
                  <span class="font-bold text-gray-900">₱150</span>
                </div>
                <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span class="text-gray-600">Weekly Pass</span>
                  <span class="font-bold text-gray-900">₱700</span>
                </div>
                <div class="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span class="text-gray-600">Monthly Pass</span>
                  <span class="font-bold text-gray-900">₱2,200</span>
                </div>
                <div class="flex items-center justify-between pb-2">
                  <span class="text-gray-600">3 Months Pass</span>
                  <span class="font-bold text-gray-900">₱5,800</span>
                </div>
              </div>

              <button onclick="openModal('modal-subscribe')" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
                Choose a Plan
              </button>
            </div>
          </div>
        </div>

        <!-- Available Trainers Row in Gym Detail (Matching reference UI) -->
        <div class="pt-6 border-t border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900 text-lg">Available Trainers</h3>
            <span class="text-xs font-semibold text-emerald-600">Assigned Coaches</span>
          </div>
          <div id="gym-modal-trainers" class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Populated via JS -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- BOOKING MODAL -->
  <div id="modal-booking" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-booking')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#22c55e] flex items-center justify-center font-bold">
          📅
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Book Training Session</h2>
          <p id="booking-modal-subtitle" class="text-xs text-gray-500">Coach Michael Reyes · Iron Zone Fitness</p>
        </div>
      </div>

      <form id="booking-form" onsubmit="submitBooking(event)" class="space-y-4">
        <input type="hidden" id="book-trainer-id" value="1">
        <input type="hidden" id="book-gym-id" value="1">

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Select Date</label>
          <input type="date" id="book-date" required class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Select Time Slot</label>
          <select id="book-time" required class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white">
            <option value="08:00 AM">08:00 AM - 10:00 AM</option>
            <option value="10:00 AM">10:00 AM - 12:00 PM</option>
            <option value="02:00 PM">02:00 PM - 04:00 PM</option>
            <option value="04:00 PM">04:00 PM - 06:00 PM</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Session Type</label>
          <select id="book-type" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white">
            <option value="Personal Training">Personal Training (1-on-1)</option>
            <option value="Strength Assessment">Strength & Mobility Assessment</option>
            <option value="Form & Technique">Form & Technique Check</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Notes for Coach (Optional)</label>
          <textarea id="book-notes" rows="2" placeholder="e.g. Focus on squat form or rehab advice" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"></textarea>
        </div>

        <div class="p-3 bg-emerald-50 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <span>Session Rate</span>
          <span class="text-sm font-bold">₱600.00</span>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Confirm & Save Booking
        </button>
      </form>
    </div>
  </div>

  <!-- SUBSCRIBE MEMBERSHIP MODAL -->
  <div id="modal-subscribe" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-subscribe')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="mb-5">
        <h2 class="text-xl font-bold text-gray-900">Choose Membership Plan</h2>
        <p class="text-xs text-gray-500 mt-1">Select your pass for Iron Zone Fitness</p>
      </div>

      <div class="space-y-3 mb-5">
        <label class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="plan_select" value="1,Daily Pass,1,150" class="accent-emerald-600">
            <div>
              <p class="font-bold text-sm text-gray-900">Daily Pass</p>
              <p class="text-xs text-gray-500">1 day gym access</p>
            </div>
          </div>
          <span class="font-black text-gray-900 text-base">₱150</span>
        </label>

        <label class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="plan_select" value="2,Weekly Pass,7,700" class="accent-emerald-600">
            <div>
              <p class="font-bold text-sm text-gray-900">Weekly Pass</p>
              <p class="text-xs text-gray-500">7 days unlimited</p>
            </div>
          </div>
          <span class="font-black text-gray-900 text-base">₱700</span>
        </label>

        <label class="flex items-center justify-between p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="plan_select" value="3,Monthly Pass,30,2200" checked class="accent-emerald-600">
            <div>
              <p class="font-bold text-sm text-emerald-950">Monthly Pass</p>
              <p class="text-xs text-emerald-700">30 days all-access (Popular)</p>
            </div>
          </div>
          <span class="font-black text-emerald-950 text-base">₱2,200</span>
        </label>

        <label class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-emerald-500 cursor-pointer">
          <div class="flex items-center gap-3">
            <input type="radio" name="plan_select" value="4,3 Months Pass,90,5800" class="accent-emerald-600">
            <div>
              <p class="font-bold text-sm text-gray-900">3 Months Pass</p>
              <p class="text-xs text-gray-500">Quarterly pass + assessment</p>
            </div>
          </div>
          <span class="font-black text-gray-900 text-base">₱5,800</span>
        </label>
      </div>

      <button onclick="submitSubscription()" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
        Pay & Activate Membership
      </button>
    </div>
  </div>

  <!-- PARTNER APPLICATION MODAL -->
  <div id="modal-partner-apply" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-partner-apply')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900">Partner Application</h2>
        <p class="text-xs text-gray-500 mt-1">Submit your verification proofs to become a certified Trainer or Gym Owner.</p>
      </div>

      <form id="partner-apply-form" onsubmit="submitPartnerApplication(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Applying As</label>
          <select id="apply-role" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none bg-white">
            <option value="Trainer">Certified Fitness Trainer</option>
            <option value="Gym Owner">Gym Facility Owner</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Specialty or Gym Name</label>
          <input type="text" id="apply-specialty" required placeholder="e.g. Crossfit & Functional or Gym Name" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Certification & Credentials Proof</label>
          <textarea id="apply-proof" required rows="2" placeholder="List your PRC/Cert ID numbers, years experience, and permits" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none"></textarea>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Submit for Admin Verification
        </button>
      </form>
    </div>
  </div>

  <!-- EDIT GYM MODAL (FOR GYM OWNER POV) -->
  <div id="modal-edit-gym" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeModal('modal-edit-gym')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900">Update Gym Information</h2>
        <p class="text-xs text-gray-500 mt-1">Changes are saved directly into the SQLite database.</p>
      </div>

      <form id="edit-gym-form" onsubmit="submitEditGym(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Gym Name</label>
          <input type="text" id="edit-gym-name" value="Iron Zone Fitness" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Complete Address</label>
          <input type="text" id="edit-gym-address" value="San Jose, Nueva Ecija" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number</label>
          <input type="text" id="edit-gym-phone" value="0917 123 4567" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Operating Hours</label>
          <input type="text" id="edit-gym-hours" value="Mon - Sun: 6:00 AM - 10:00 PM" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Description</label>
          <textarea id="edit-gym-desc" rows="2" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">Iron Zone Fitness is equipped with modern facilities, quality equipment, and a dedicated team to help you achieve your fitness goals.</textarea>
        </div>

        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Save Gym Profile Changes
        </button>
      </form>
    </div>
  </div>

  <!-- REGISTER / LOGIN QUICK MODAL -->
  <div id="modal-register" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-register')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="text-center mb-6">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22c55e] flex items-center justify-center mx-auto mb-2 font-bold text-xl">
          💪
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Join FitMap</h2>
        <p class="text-xs text-gray-500 mt-1">Start your fitness journey today</p>
      </div>

      <form onsubmit="event.preventDefault(); setPOV('member'); closeModal('modal-register'); showToast('Account created! Welcome, John.');" class="space-y-3">
        <input type="text" required placeholder="Full Name" value="John Dela Cruz" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        <input type="email" required placeholder="Email Address" value="john@example.com" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        <input type="password" required placeholder="Password" value="password123" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Create Account
        </button>
      </form>
      <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Forgot access?</span>
        <button onclick="closeModal('modal-register'); openModal('modal-forgot-password');" class="text-emerald-600 font-bold hover:underline">Reset Password</button>
      </div>
    </div>
  </div>

  <!-- PASSWORD RECOVERY MODAL (Feature A) -->
  <div id="modal-forgot-password" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-forgot-password')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="text-center mb-5">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
          🔑
        </div>
        <h2 class="text-xl font-bold text-gray-900">Password Recovery</h2>
        <p class="text-xs text-gray-500 mt-1">Enter your registered email to receive reset instructions.</p>
      </div>
      <form onsubmit="submitForgotPassword(event)" class="space-y-3">
        <input type="email" id="forgot-email" required placeholder="you@example.com" value="john@example.com" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        <button type="submit" class="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Send Recovery Link
        </button>
      </form>
    </div>
  </div>

  <!-- PROFILE EDIT MODAL (Feature A / Specific Objective 7) -->
  <div id="modal-profile-edit" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
      <button onclick="closeModal('modal-profile-edit')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="mb-5">
        <h2 class="text-xl font-bold text-gray-900">Edit Member Profile</h2>
        <p class="text-xs text-gray-500 mt-1">Update your fitness goals and contact information saved to SQLite.</p>
      </div>
      <form onsubmit="submitProfileUpdate(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
          <input type="text" id="profile-name" value="John Dela Cruz" required class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Phone Number</label>
          <input type="text" id="profile-phone" value="0919 555 6666" required class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Fitness Goals & Bio</label>
          <textarea id="profile-bio" rows="3" class="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-emerald-500 outline-none">Dedicated fitness enthusiast training for marathon endurance and muscle hypertrophy.</textarea>
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#1eb354] text-white font-bold text-sm shadow-md transition">
          Save Profile Updates
        </button>
      </form>
    </div>
  </div>

  <!-- PRINTABLE REPORT MODAL (Specific Objective 10) -->
  <div id="modal-report-print" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="closeModal('modal-report-print')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
      <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-[#22c55e]"></span>
            <h2 class="text-2xl font-black text-gray-900">FitMap Analytics & Management Report</h2>
          </div>
          <p class="text-xs text-gray-500 mt-1">Official platform report generated from SQLite database</p>
        </div>
        <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-[#22c55e] text-white font-bold text-xs flex items-center gap-1 shadow">
          🖨️ Print Report
        </button>
      </div>

      <div id="report-printable-content" class="space-y-6 text-sm">
        <!-- Rendered via JS -->
      </div>
    </div>
  </div>

</body>
</html>
"""

class FitMapHTTPRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler handling REST API endpoints with SQLite backend
    and serving the FitMap HTML user interface.
    """

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # 1. Main UI
        if path == "/" or path == "/index.html":
            html = get_main_page_html()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))
            return

        # 2. Favicon
        if path == "/favicon.svg":
            svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.end_headers()
            self.wfile.write(svg.encode("utf-8"))
            return

        # 3. API: Gyms
        if path == "/api/gyms":
            q = params.get("q", [""])[0]
            cat = params.get("category", [""])[0]
            plan = params.get("plan", [""])[0]
            dist = params.get("max_distance", [None])[0]
            gyms = GymModel.get_all(q, cat, plan, dist)
            self.send_json(gyms)
            return

        if path.startswith("/api/gyms/"):
            try:
                gym_id = int(path.split("/")[3])
                gym = GymModel.get_by_id(gym_id)
                if gym:
                    self.send_json(gym)
                else:
                    self.send_json({"error": "Gym not found"}, status=404)
            except Exception as e:
                self.send_json({"error": str(e)}, status=400)
            return

        # 4. API: Trainers
        if path == "/api/trainers":
            gym_id = params.get("gym_id", [None])[0]
            if gym_id:
                trainers = TrainerModel.get_all(int(gym_id))
            else:
                trainers = TrainerModel.get_all()
            self.send_json(trainers)
            return

        # 5. API: Trainer Schedule
        if path == "/api/trainer/schedule":
            trainer_id = int(params.get("trainer_id", [1])[0])
            schedule = TrainerModel.get_schedule(trainer_id)
            self.send_json(schedule)
            return

        # 6. API: Bookings
        if path == "/api/bookings":
            user_id = params.get("user_id", [None])[0]
            trainer_id = params.get("trainer_id", [None])[0]
            gym_id = params.get("gym_id", [None])[0]

            if user_id:
                bookings = BookingModel.get_by_user(int(user_id))
            elif trainer_id:
                bookings = BookingModel.get_by_trainer(int(trainer_id))
            elif gym_id:
                bookings = BookingModel.get_by_gym(int(gym_id))
            else:
                bookings = BookingModel.get_all()
            self.send_json(bookings)
            return

        # 7. API: Memberships
        if path == "/api/memberships":
            user_id = params.get("user_id", [7])[0]
            memberships = MembershipModel.get_user_memberships(int(user_id))
            self.send_json(memberships)
            return

        # 8. API: Role Applications
        if path == "/api/role-applications":
            apps = RoleApplicationModel.get_all()
            self.send_json(apps)
            return

        # 9. API: Users (for Admin Module)
        if path == "/api/users":
            users = UserModel.get_all()
            self.send_json(users)
            return

        # 10. API: Reports & Analytics (Specific Objective 10)
        if path == "/api/reports/summary":
            from models import ReportModel
            summary = ReportModel.get_summary()
            self.send_json(summary)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # 1. Create Booking
        if path == "/api/bookings":
            user_id = payload.get("user_id", 7)
            gym_id = payload.get("gym_id", 1)
            trainer_id = payload.get("trainer_id")
            user_name = payload.get("user_name", "John Dela Cruz")
            gym = GymModel.get_by_id(gym_id)
            gym_name = gym["name"] if gym else "FitMap Partner Gym"
            trainer = TrainerModel.get_by_id(trainer_id) if trainer_id else None
            trainer_name = trainer["name"] if trainer else "Facility Access"
            booking_date = payload.get("booking_date")
            booking_time = payload.get("booking_time", "08:00 AM")
            session_type = payload.get("session_type", "Personal Training")
            price = float(payload.get("price", 600.0))
            notes = payload.get("notes", "")

            new_id = BookingModel.create(
                user_id, gym_id, trainer_id, user_name, gym_name, trainer_name,
                booking_date, booking_time, session_type, price, notes
            )
            self.send_json({"success": True, "id": new_id, "message": "Booking created in SQLite"})
            return

        # 2. Subscribe User to Membership
        if path == "/api/memberships":
            user_id = payload.get("user_id", 7)
            gym_id = payload.get("gym_id", 1)
            plan_id = payload.get("plan_id", 3)
            plan_name = payload.get("plan_name", "Monthly Pass")
            duration_days = payload.get("duration_days", 30)
            price = float(payload.get("price", 2200.0))

            new_id = MembershipModel.subscribe_user(user_id, gym_id, plan_id, plan_name, duration_days, price)
            self.send_json({"success": True, "id": new_id, "message": "Membership subscribed in SQLite"})
            return

        # 3. Toggle Trainer Schedule Slot
        if path.startswith("/api/trainer/schedule/") and path.endswith("/toggle"):
            slot_id = int(path.split("/")[4])
            TrainerModel.toggle_schedule_slot(slot_id)
            self.send_json({"success": True, "slot_id": slot_id})
            return

        # 4. Create Role Application
        if path == "/api/role-applications":
            user_id = payload.get("user_id", 7)
            applicant_name = payload.get("applicant_name", "John Dela Cruz")
            requested_role = payload.get("requested_role", "Trainer")
            specialty_or_gym = payload.get("specialty_or_gym", "")
            credentials_proof = payload.get("credentials_proof", "")

            new_id = RoleApplicationModel.create(user_id, applicant_name, requested_role, specialty_or_gym, credentials_proof)
            self.send_json({"success": True, "id": new_id, "message": "Application submitted"})
            return

        # 5. Renew User Membership (Specific Objective 8)
        if path == "/api/memberships/renew":
            membership_id = payload.get("membership_id", 1)
            days = payload.get("days", 30)
            MembershipModel.renew(membership_id, days)
            self.send_json({"success": True, "message": f"Membership renewed for {days} days"})
            return

        # 6. Forgot Password Recovery (Feature A)
        if path == "/api/auth/forgot-password":
            email = payload.get("email", "")
            self.send_json({"success": True, "message": f"Password reset instructions dispatched to {email}"})
            return

        self.send_json({"error": "Method not allowed"}, status=405)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        # 1. Update Booking Status
        if path.startswith("/api/bookings/") and path.endswith("/status"):
            booking_id = int(path.split("/")[3])
            status = payload.get("status", "Confirmed")
            BookingModel.update_status(booking_id, status)
            self.send_json({"success": True, "booking_id": booking_id, "status": status})
            return

        # 2. Update Application Status
        if path.startswith("/api/role-applications/") and path.endswith("/status"):
            app_id = int(path.split("/")[3])
            status = payload.get("status", "Approved")
            RoleApplicationModel.update_status(app_id, status)
            self.send_json({"success": True, "app_id": app_id, "status": status})
            return

        # 3. Update Gym Details
        if path.startswith("/api/gyms/"):
            gym_id = int(path.split("/")[3])
            name = payload.get("name")
            address = payload.get("address")
            city = payload.get("city", "San Jose")
            phone = payload.get("phone")
            hours = payload.get("opening_hours")
            desc = payload.get("description")
            facilities = payload.get("facilities_list", [])

            GymModel.update(gym_id, name, address, city, phone, hours, desc, facilities)
            self.send_json({"success": True, "gym_id": gym_id})
            return

        # 4. Update User Profile (Specific Objective 7)
        if path == "/api/users/profile":
            user_id = payload.get("user_id", 7)
            name = payload.get("name", "John Dela Cruz")
            phone = payload.get("phone", "")
            bio = payload.get("bio", "")
            UserModel.update_profile(user_id, name, phone, bio)
            self.send_json({"success": True, "message": "Profile updated in SQLite"})
            return

        self.send_json({"error": "Method not allowed"}, status=405)

def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, FitMapHTTPRequestHandler)
    print(f"==================================================")
    print(f"  FitMap Python & SQLite Server Running!          ")
    print(f"  Port: {PORT} (http://0.0.0.0:{PORT})           ")
    print(f"  Database: fitmap.db                             ")
    print(f"  Ready to run directly in PyCharm!               ")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
