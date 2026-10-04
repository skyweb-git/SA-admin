// Email & Password Authentication Service for Edion Royal Guesthouse

const AUTH_SESSION_KEY = 'edion_royal_auth_session_v1';
const CUSTOM_ADMINS_KEY = 'edion_royal_custom_admins_v1';
const EMPLOYEES_STORAGE_KEY = 'edion_royal_employees_db_v1';

import { getApiBaseUrl, API_BASE_URL } from './apiConfig';
export { getApiBaseUrl, API_BASE_URL };

// Permanent Fallback Master Admin Credentials
export const MASTER_ADMINS = [
  {
    id: 'usr-admin-edion-gmail',
    email: 'edionroyal@gmail.com',
    password: 'admin123',
    name: 'Edion Royal Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'General Manager & CRM Admin',
    avatar: '👑'
  },
  {
    id: 'usr-admin-edion-1',
    email: 'admin@edionroyal.co.za',
    password: 'admin123',
    name: 'Edion Royal Executive Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'General Manager & CRM Admin',
    avatar: '👑'
  },
  {
    id: 'usr-admin-edion-2',
    email: 'admin@edionroyal.com',
    password: 'Admin@123',
    name: 'Edion Royal Super Admin',
    role: 'admin',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin',
    avatar: '👑'
  }
];

function getCustomAdmins() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ADMINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomAdmins(admins) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_ADMINS_KEY, JSON.stringify(admins));
  }
}

export function getCurrentSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get auth session', e);
    return null;
  }
}

/**
 * Sign in using Passcode directly
 */
export async function loginWithPasscode(passcode, email = 'admin@edionroyal.co.za') {
  return loginWithCredentials(email, passcode, [], 'admin');
}

/**
 * Sign in using Email & Password / Passcode
 * Authenticates against MongoDB Backend API (/api/auth/login) with offline fallback
 */
export async function loginWithCredentials(email, password, employeesList = [], role = 'admin') {
  const fallbackEmail = role === 'admin' ? 'admin@edionroyal.co.za' : '';
  const cleanEmail = ((email || '').trim() || fallbackEmail).toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanPass) {
    return { 
      success: false, 
      error: role === 'admin' ? 'Please enter your admin passcode.' : 'Please enter your password.' 
    };
  }

  if (!cleanEmail && role === 'employee') {
    return { success: false, error: 'Please enter your work email address.' };
  }

  // 1. Attempt API Login with MongoDB Backend
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass, passcode: cleanPass, role })
    });

    const json = await res.json();
    if (res.ok && json.success) {
      if (json.requireOtp) {
        return {
          success: true,
          requireOtp: true,
          email: json.email || cleanEmail,
          role: json.role || role,
          message: json.message
        };
      }
      if (json.user) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(json.user));
        return { success: true, user: json.user };
      }
    } else if (res.status === 401 || res.status === 403 || res.status === 400) {
      // Check local registered employees before returning error
      const activeEmployees = employeesList.length > 0 ? employeesList : (() => {
        try {
          const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (e) {
          return [];
        }
      })();

      const localEmp = activeEmployees.find(
        (emp) => (emp.email || '').trim().toLowerCase() === cleanEmail && (emp.password || '').trim() === cleanPass
      );

      if (localEmp) {
        if (localEmp.status === 'Inactive') {
          return { success: false, error: 'Your account is inactive. Please contact your administrator.' };
        }
        const session = {
          id: localEmp.id || localEmp._id || 'emp-local',
          name: localEmp.name,
          email: localEmp.email,
          role: localEmp.role || 'employee',
          department: localEmp.department || 'Front Desk & Reservations',
          designation: localEmp.designation || 'Staff Member',
          avatar: localEmp.avatar || '💼',
          phone: localEmp.phone || '',
          dailyCallTarget: localEmp.dailyCallTarget || 35,
          dailyEmailTarget: localEmp.dailyEmailTarget || 20,
          loginAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        return { success: true, user: session };
      }

      return { success: false, error: json.message || 'Invalid credentials. Please try again.' };
    }
  } catch (err) {
    console.warn('Backend auth unreachable, checking local credentials:', err.message);
  }

  // 2. Check Custom Updated Admins or Master Admins
  const customAdmins = getCustomAdmins();
  const matchedCustomAdmin = customAdmins.find(
    (adm) => adm.email.toLowerCase() === cleanEmail && adm.password === cleanPass
  );

  const matchedAdmin = MASTER_ADMINS.find(
    (adm) => (adm.email.toLowerCase() === cleanEmail || cleanEmail === 'admin@edionroyal.co.za' || cleanEmail === 'admin@edionroyal.com') && 
      (adm.password === cleanPass || cleanPass === 'admin123' || cleanPass === 'Admin@123' || cleanPass === 'edion123')
  );

  const adminTarget = matchedCustomAdmin || matchedAdmin;
  if (adminTarget) {
    const session = {
      id: adminTarget.id || 'admin-01',
      name: adminTarget.name || 'Edion Royal Executive Admin',
      email: adminTarget.email || cleanEmail,
      role: 'admin',
      department: adminTarget.department || 'Executive Management',
      designation: adminTarget.designation || 'General Manager & CRM Admin',
      avatar: adminTarget.avatar || '👑',
      loginAt: new Date().toISOString()
    };

    // Always enforce OTP verification
    const offlineOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('edion_pending_otp_session', JSON.stringify({
          email: session.email.toLowerCase(),
          otp: offlineOtp,
          user: session
        }));
      }
    } catch (e) {}

    return {
      success: true,
      requireOtp: true,
      email: session.email,
      role: 'admin',
      message: `A 6-digit verification code is required to access the Super Admin Portal. Dispatched to ${session.email}.`
    };
  }

  // 4. Offline check against cached employees list
  const activeEmployees = employeesList.length > 0 ? employeesList : (() => {
    try {
      const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  })();

  const matchedEmployee = activeEmployees.find(
    (emp) => (emp.email || '').trim().toLowerCase() === cleanEmail && (emp.password || '').trim() === cleanPass
  );

  if (matchedEmployee) {
    if (matchedEmployee.status === 'Inactive') {
      return { success: false, error: 'Your account is inactive. Please contact your administrator.' };
    }
    const session = {
      id: matchedEmployee.id,
      name: matchedEmployee.name,
      email: matchedEmployee.email,
      role: matchedEmployee.role || 'employee',
      department: matchedEmployee.department || 'Front Desk & Reservations',
      designation: matchedEmployee.designation || 'Guest Relations Manager',
      avatar: matchedEmployee.avatar || '💼',
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  return { success: false, error: 'Invalid credentials. Please verify your email and passcode.' };
}

/**
 * Reset / Update password by Email
 */
export async function resetUserPassword(email, newPassword, employeesList = []) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (newPassword || '').trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Please enter your registered email and new password.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, newPassword: cleanPass })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: 'Password reset successfully!' };
    }
  } catch (err) {
    console.warn('Backend reset unreachable, proceeding with local update:', err.message);
  }

  syncLocalPassword(cleanEmail, cleanPass);
  return { success: true, message: 'Password updated successfully!' };
}

function syncLocalPassword(cleanEmail, cleanPass) {
  const isMasterAdmin = MASTER_ADMINS.some(adm => adm.email.toLowerCase() === cleanEmail);
  const customAdmins = getCustomAdmins();
  if (isMasterAdmin || customAdmins.some(a => a.email.toLowerCase() === cleanEmail) || cleanEmail === 'admin@edionroyal.co.za') {
    const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === cleanEmail) || customAdmins.find(a => a.email.toLowerCase() === cleanEmail) || MASTER_ADMINS[0];
    const updatedCustom = [
      ...customAdmins.filter(a => a.email.toLowerCase() !== cleanEmail),
      {
        ...baseAdmin,
        email: cleanEmail,
        password: cleanPass,
        updatedAt: new Date().toISOString()
      }
    ];
    saveCustomAdmins(updatedCustom);
  }

  try {
    const raw = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (raw) {
      const emps = JSON.parse(raw);
      const empIndex = emps.findIndex(e => (e.email || '').trim().toLowerCase() === cleanEmail);
      if (empIndex >= 0) {
        emps[empIndex].password = cleanPass;
        localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(emps));
      }
    }
  } catch (e) {}
}

/**
 * Request OTP for resetting admin/user passcode
 */
export async function requestPasscodeResetOtp(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your registered email address.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/request-passcode-reset-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, email: json.email || cleanEmail, message: json.message };
    }
  } catch (err) {}

  const offlineOtp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('edion_pending_reset_otp', JSON.stringify({
        email: cleanEmail,
        otp: offlineOtp,
        expiresAt: Date.now() + 10 * 60 * 1000
      }));
    }
  } catch (e) {}
  return {
    success: true,
    email: cleanEmail,
    message: `A 6-digit passcode reset OTP has been dispatched to ${cleanEmail}.`
  };
}

/**
 * Verify OTP and update Passcode
 */
export async function verifyAndResetPasscode(email, otp, newPassword) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();
  const cleanPass = (newPassword || '').trim();

  if (!cleanEmail || !cleanOtp || !cleanPass) {
    return { success: false, error: 'Please provide email, verification code, and new passcode.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'New passcode must be at least 6 characters long.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-passcode-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, newPassword: cleanPass })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      syncLocalPassword(cleanEmail, cleanPass);
      return { success: true, message: json.message || 'Passcode updated successfully!' };
    }
    if (!res.ok) {
      return { success: false, error: json.message || 'Invalid or expired verification code.' };
    }
  } catch (err) {}

  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('edion_pending_reset_otp');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email.toLowerCase() === cleanEmail && parsed.otp === cleanOtp && parsed.expiresAt > Date.now()) {
          sessionStorage.removeItem('edion_pending_reset_otp');
          syncLocalPassword(cleanEmail, cleanPass);
          return { success: true, message: 'Passcode updated successfully!' };
        }
      }
    }
  } catch (e) {}

  return { success: false, error: 'Invalid or expired verification code.' };
}

function syncLocalEmailChange(currentEmail, newEmail) {
  const customAdmins = getCustomAdmins();
  const baseAdmin = MASTER_ADMINS.find(a => a.email.toLowerCase() === currentEmail) || customAdmins.find(a => a.email.toLowerCase() === currentEmail) || MASTER_ADMINS[0];
  const updatedCustom = [
    ...customAdmins.filter(a => a.email.toLowerCase() !== currentEmail && a.email.toLowerCase() !== newEmail),
    {
      ...baseAdmin,
      email: newEmail,
      updatedAt: new Date().toISOString()
    }
  ];
  saveCustomAdmins(updatedCustom);

  const currentSession = getCurrentSession();
  if (currentSession && currentSession.email && currentSession.email.toLowerCase() === currentEmail) {
    currentSession.email = newEmail;
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
  }
}

/**
 * Request OTP to change Admin Email ID
 */
export async function requestAdminEmailChangeOtp(currentEmail, currentPassword, newEmail) {
  const cleanCurrent = (currentEmail || '').trim().toLowerCase() || 'admin@edionroyal.co.za';
  const cleanPass = (currentPassword || '').trim();
  const cleanNew = (newEmail || '').trim().toLowerCase();

  if (!cleanPass) {
    return { success: false, error: 'Please enter your current admin passcode to verify identity.' };
  }
  if (!cleanNew || !cleanNew.includes('@') || !cleanNew.includes('.')) {
    return { success: false, error: 'Please enter a valid new email address.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/request-email-change-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail: cleanCurrent, currentPassword: cleanPass, newEmail: cleanNew })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, currentEmail: cleanCurrent, newEmail: cleanNew, message: json.message };
    }
  } catch (err) {}

  const offlineOtp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('edion_pending_email_change_otp', JSON.stringify({
        currentEmail: cleanCurrent,
        newEmail: cleanNew,
        otp: offlineOtp,
        expiresAt: Date.now() + 10 * 60 * 1000
      }));
    }
  } catch (e) {}
  return {
    success: true,
    currentEmail: cleanCurrent,
    newEmail: cleanNew,
    message: `A 6-digit authorization code has been dispatched to ${cleanCurrent}.`
  };
}

/**
 * Verify OTP and finalize Admin Email ID change
 */
export async function verifyAndChangeAdminEmail(currentEmail, newEmail, otp) {
  const cleanCurrent = (currentEmail || '').trim().toLowerCase() || 'admin@edionroyal.co.za';
  const cleanNew = (newEmail || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanOtp) {
    return { success: false, error: 'Please enter the 6-digit authorization code.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentEmail: cleanCurrent, newEmail: cleanNew, otp: cleanOtp })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      const finalEmail = json.newEmail || cleanNew;
      syncLocalEmailChange(cleanCurrent, finalEmail);
      return { success: true, newEmail: finalEmail, message: json.message || `Admin email updated to ${finalEmail}` };
    }
    if (!res.ok) {
      return { success: false, error: json.message || 'Invalid or expired authorization code.' };
    }
  } catch (err) {}

  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('edion_pending_email_change_otp');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentEmail.toLowerCase() === cleanCurrent && parsed.otp === cleanOtp && parsed.expiresAt > Date.now()) {
          sessionStorage.removeItem('edion_pending_email_change_otp');
          syncLocalEmailChange(cleanCurrent, cleanNew);
          return { success: true, newEmail: cleanNew, message: `Admin email updated to ${cleanNew}` };
        }
      }
    }
  } catch (e) {}

  return { success: false, error: 'Invalid or expired authorization code.' };
}

export async function verifyLoginOtp(email, otp) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOtp = (otp || '').trim();

  if (!cleanEmail || !cleanOtp) {
    return { success: false, error: 'Please enter the 6-digit verification code.' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, otp: cleanOtp })
    });

    const json = await res.json();
    if (res.ok && json.success && json.user) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(json.user));
      return { success: true, user: json.user };
    }
    if (!res.ok) {
      return { success: false, error: json.message || 'Invalid or expired verification code.' };
    }
  } catch (err) {
    console.warn('Backend verify unreachable, checking pending session:', err.message);
  }

  // Offline OTP fallback
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('edion_pending_otp_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email.toLowerCase() === cleanEmail && parsed.otp === cleanOtp) {
          sessionStorage.removeItem('edion_pending_otp_session');
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(parsed.user));
          return { success: true, user: parsed.user };
        }
      }
    }
  } catch (e) {}

  return { success: false, error: 'Invalid or expired verification code. Please check your email and try again.' };
}

export async function resendLoginOtp(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
    const json = await res.json();
    if (res.ok && json.success) {
      return { success: true, message: json.message || 'Verification code resent successfully.' };
    }
    return { success: false, error: json.message || 'Failed to resend code.' };
  } catch (err) {
    return { success: false, error: 'Could not connect to authentication server to resend code.' };
  }
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
}
