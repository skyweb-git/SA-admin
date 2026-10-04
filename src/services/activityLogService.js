// Activity Log Service (Calls Completed & Emails Dispatched by Employees)

const CALL_LOGS_KEY = 'edion_royal_call_logs_v1';
const EMAIL_LOGS_KEY = 'edion_royal_email_logs_v1';
const CHANNEL_NAME = 'edion_royal_leads_sync_channel';

export const INITIAL_CALL_LOGS = [];
export const INITIAL_EMAIL_LOGS = [];

const MOCK_NAMES = new Set([
  'Thabo Ndlovu', 'Sarah Jenkins', 'Dr. Aisha Patel', 'Liam & Chloe Van Der Merwe',
  'Markus Weber', 'Francois Du Plessis', 'Elena Rostova', 'Kagiso Molefe',
  'Johan & Ansie Botha', 'Nomvula Sithole', 'David Campbell', 'Pieter Van Zyl',
  'Marlene & Jacques De Kock', 'Anil & Priya Sharma', 'Alexander Wright', 'Test Guest'
]);

function isMockActivity(item) {
  if (!item) return false;
  if (typeof item.id === 'string' && (/^call-0[1-9]|^call-1[0-4]$/.test(item.id) || /^mail-0[1-9]|^mail-1[0-4]$/.test(item.id))) return true;
  if (MOCK_NAMES.has(item.leadName) || MOCK_NAMES.has(item.recipientName)) return true;
  return false;
}

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel error', e);
}

// ----------------- CALL LOGS -----------------
export function getCallLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CALL_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(c => !isMockActivity(c));
      if (clean.length !== parsed.length) {
        localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return [];
  } catch (e) {
    console.error('Failed to get call logs', e);
    return [];
  }
}

export const EMAIL_TEMPLATES = [
  {
    id: 'tpl-brochure',
    title: 'Room Rates & Digital Brochure',
    subject: (name) => `Edion Royal Guesthouse: Room Options & Direct Rates for ${name || 'Your Stay'}`,
    body: (name, unit) => `Dear ${name || 'Valued Guest'},

Thank you for your interest in Edion Royal Guesthouse in Milnerton, Cape Town.

We are pleased to share our room options and direct rates:
• Renovated Double Rooms & En-Suite Accommodations (${unit || 'Selected Room'})
• Twin Rooms with Self-Catering Kitchenette
• Spacious Triple & Family Rooms
• Standard Inclusions: Uncapped high-speed WiFi, flat-screen TV, private bathroom, secure gated parking, 24-hour reception, and braai/patio access.

Please let us know your preferred check-in and check-out dates and we will gladly lock in your booking with zero reservation fees.

Warm regards,
Reservations Team
Edion Royal Guesthouse
7 Arum Street, Milnerton, Cape Town, 7441
Phone / WhatsApp: +27 78 972 4254 | Email: stay@edionroyal.co.za`
  },
  {
    id: 'tpl-cost-sheet',
    title: 'Booking Confirmation & Rates',
    subject: (name) => `Reservation Confirmation & Rate Breakdown — Edion Royal Guesthouse`,
    body: (name, unit) => `Dear ${name || 'Valued Guest'},

Here is the detailed direct rate overview and stay confirmation for ${unit || 'your stay at Edion Royal Guesthouse'}:

• Room Type: ${unit || 'Standard En-Suite Room'}
• Guaranteed Direct Rate with no OTA commissions or hidden fees
• Check-in from 14:00 (24h assisted arrival) | Check-out by 10:00
• Complimentary amenities: High-speed WiFi, gated parking, shared kitchen and barbecue area

Please reply with your confirmation or payment preference to secure your dates.

Warm regards,
Front Desk & Reservations
Edion Royal Guesthouse`
  },
  {
    id: 'tpl-site-visit',
    title: 'Arrival Directions & Check-In Pass',
    subject: (name) => `Check-in Directions & Arrival Pass: Edion Royal Guesthouse`,
    body: (name, unit) => `Dear ${name || 'Valued Guest'},

We look forward to welcoming you to Edion Royal Guesthouse!

📍 Address: 7 Arum Street, Milnerton, Cape Town, 7441 (off the R27)
Google Maps Link: https://maps.google.com/?q=7+Arum+Street,+Milnerton,+Cape+Town,+7441

Key Details for Arrival:
• Reception is open 24 hours to welcome you.
• Secure, remote-gated parking is available on-site.
• Located just 3 minutes from Milnerton Beach and 15 minutes from Cape Town CBD.

If you require an airport transfer or late check-in assistance, please call or WhatsApp us at +27 78 972 4254.

Safe travels,
Edion Royal Guesthouse Team`
  }
];

export function logCall(callData) {
  const current = getCallLogs();
  const newCall = {
    id: callData.id || ('call-' + Date.now().toString(36)),
    leadId: callData.leadId || '',
    leadName: callData.leadName || 'Prospect',
    leadPhone: callData.leadPhone || '',
    employeeId: callData.employeeId || 'emp-unknown',
    employeeName: callData.employeeName || 'Staff Member',
    employeeDept: callData.employeeDept || 'Marketing & Sales',
    outcome: callData.outcome || 'Connected - Interested',
    duration: callData.duration || '2 mins 30 secs',
    durationSec: callData.durationSec || 150,
    notes: callData.notes || '',
    timestamp: new Date().toISOString()
  };

  const updated = [newCall, ...current];
  localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'CALLS_UPDATED', calls: updated, newCall });
  }

  // Sync with MongoDB API
  syncCallLogToAPI(newCall);

  return newCall;
}

// ----------------- EMAIL LOGS -----------------
export function getEmailLogs() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const clean = parsed.filter(m => !isMockActivity(m));
      if (clean.length !== parsed.length) {
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(clean));
      }
      return clean;
    }
    return [];
  } catch (e) {
    console.error('Failed to get email logs', e);
    return [];
  }
}

export function logEmail(emailData) {
  const current = getEmailLogs();
  const newMail = {
    id: emailData.id || ('mail-' + Date.now().toString(36)),
    leadId: emailData.leadId || '',
    leadName: emailData.leadName || 'Prospect',
    leadEmail: emailData.leadEmail || '',
    employeeId: emailData.employeeId || 'emp-unknown',
    employeeName: emailData.employeeName || 'Marketing Executive',
    templateType: emailData.templateType || 'Room Rates & Digital Brochure',
    subject: emailData.subject || 'Edion Royal Guesthouse Reservation Enquiry',
    preview: emailData.preview || (emailData.body ? emailData.body.substring(0, 120) + '...' : ''),
    body: emailData.body || '',
    status: 'Delivered',
    sentAt: new Date().toISOString()
  };

  const updated = [newMail, ...current];
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMAILS_UPDATED', emails: updated, newMail });
  }

  // Sync with MongoDB API
  syncEmailLogToAPI(newMail);

  return newMail;
}

// ---------------- MongoDB API Helpers ----------------
import { API_BASE_URL, getApiBaseUrl } from './apiConfig';

export async function fetchCallLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`);
    if (!res.ok) throw new Error('API fetch calls failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const clean = json.data.filter(c => !isMockActivity(c));
      localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(clean));
      return clean;
    }
  } catch (err) {
    console.warn('Could not sync call logs from API:', err.message);
  }
  return getCallLogs();
}

export async function syncCallLogToAPI(callData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API call log save failed:', err.message);
    return null;
  }
}

export async function fetchEmailLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`);
    if (!res.ok) throw new Error('API fetch emails failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const clean = json.data.filter(m => !isMockActivity(m));
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(clean));
      return clean;
    }
  } catch (err) {
    console.warn('Could not sync email logs from API:', err.message);
  }
  return getEmailLogs();
}

export async function syncEmailLogToAPI(emailData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API email log save failed:', err.message);
    return null;
  }
}
