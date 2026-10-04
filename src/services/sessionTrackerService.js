import { API_BASE_URL } from './apiConfig';
const CURRENT_SESSION_ID_KEY = 'edion_royal_current_session_id_v1';

let heartbeatTimer = null;
let lastInteractionTime = Date.now();
let isUserActive = true;
let isBackendSessionsSupported = true;

// Helper to track activity interactions
function setupActivityListeners() {
  if (typeof window === 'undefined') return;

  const markActive = () => {
    lastInteractionTime = Date.now();
    isUserActive = true;
  };

  window.addEventListener('mousemove', markActive, { passive: true });
  window.addEventListener('keydown', markActive, { passive: true });
  window.addEventListener('click', markActive, { passive: true });
  window.addEventListener('scroll', markActive, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isUserActive = false;
    } else {
      markActive();
    }
  });
}

/**
 * Start Employee Session on Login
 */
export async function startEmployeeSession(user) {
  if (!user || !user.email) return null;

  const fallbackSessionId = `local-sess-${Date.now().toString(36)}`;

  // If backend endpoint was already determined to be unavailable, fallback to local tracking
  if (!isBackendSessionsSupported) {
    localStorage.setItem(CURRENT_SESSION_ID_KEY, fallbackSessionId);
    setupActivityListeners();
    return fallbackSessionId;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/sessions/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: user.id || user._id,
        employeeEmail: user.email,
        employeeName: user.name,
        role: user.role
      })
    });

    if (res.status === 404) {
      // Backend does not have /api/sessions yet (or pending deployment)
      isBackendSessionsSupported = false;
      localStorage.setItem(CURRENT_SESSION_ID_KEY, fallbackSessionId);
      setupActivityListeners();
      return fallbackSessionId;
    }

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.sessionId) {
        const sessionId = json.data.sessionId;
        localStorage.setItem(CURRENT_SESSION_ID_KEY, sessionId);

        setupActivityListeners();
        startHeartbeat(sessionId);
        return sessionId;
      }
    }
  } catch (err) {
    // Suppress network errors and use local fallback session
    isBackendSessionsSupported = false;
  }

  localStorage.setItem(CURRENT_SESSION_ID_KEY, fallbackSessionId);
  setupActivityListeners();
  return fallbackSessionId;
}

/**
 * Periodically send screen activity heartbeat (every 30 seconds)
 */
function startHeartbeat(sessionId) {
  if (heartbeatTimer) clearInterval(heartbeatTimer);

  heartbeatTimer = setInterval(async () => {
    if (!isBackendSessionsSupported) {
      clearInterval(heartbeatTimer);
      return;
    }

    // If no mouse/keyboard interaction for > 3 minutes, mark as idle
    const timeSinceInteraction = Date.now() - lastInteractionTime;
    const active = isUserActive && timeSinceInteraction < 3 * 60 * 1000 && !document.hidden;

    try {
      const res = await fetch(`${API_BASE_URL}/sessions/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          isActive: active,
          activeDeltaSeconds: 30
        })
      });
      if (res.status === 404) {
        isBackendSessionsSupported = false;
        clearInterval(heartbeatTimer);
      }
    } catch (err) {
      // Suppress heartbeat errors
    }
  }, 30000);
}

/**
 * Stop session on Logout
 */
export async function stopEmployeeSession(userEmail) {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  const sessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);

  if (isBackendSessionsSupported && sessionId && !sessionId.startsWith('local-sess-')) {
    try {
      await fetch(`${API_BASE_URL}/sessions/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          employeeEmail: userEmail
        })
      });
    } catch (err) {
      // Silent catch on logout
    }
  }

  localStorage.removeItem(CURRENT_SESSION_ID_KEY);
}

/**
 * Fetch Centralized Time & Activity Monitoring Data for Managers
 */
export async function fetchCentralizedMonitoringData(dateStr = '') {
  if (!isBackendSessionsSupported) return null;

  try {
    const url = dateStr 
      ? `${API_BASE_URL}/sessions/monitoring?date=${dateStr}` 
      : `${API_BASE_URL}/sessions/monitoring`;
      
    const res = await fetch(url);
    if (res.status === 404) {
      isBackendSessionsSupported = false;
      return null;
    }
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Fetch Session History Audit Log for a Specific Employee
 */
export async function fetchEmployeeSessionAudit(employeeId) {
  if (!isBackendSessionsSupported) return { success: false, data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/sessions/employee/${employeeId}`);
    if (res.status === 404) {
      isBackendSessionsSupported = false;
      return { success: false, data: [] };
    }
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}
