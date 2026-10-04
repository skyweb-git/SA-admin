import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  Users, 
  PhoneCall, 
  Mail, 
  Award, 
  CheckCircle2, 
  Sparkles,
  PieChart
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AnalyticsView from '../AnalyticsView';

export default function DashboardView({ 
  leads = [], 
  employees = [], 
  callLogs = [], 
  emailLogs = [], 
  onNavigateTab 
}) {
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'analytics'

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-Navigation Switcher */}
      {/* Sub-Navigation Switcher */}
      <div className="subnav-bar">
        <div className="subnav-buttons">
          <button
            className={`btn ${subTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSubTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <LayoutDashboard size={15} />
            <span>Executive Overview</span>
          </button>

          <button
            className={`btn ${subTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setSubTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <BarChart3 size={15} />
            <span>Pipeline Analytics &amp; Funnel</span>
          </button>
        </div>

        <div className="subnav-stats">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <strong style={{ color: '#0f172a' }}>{leads.length}</strong> Leads
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <strong style={{ color: '#0f766e' }}>{callLogs.length}</strong> Calls
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <strong style={{ color: '#2563eb' }}>{emailLogs.length}</strong> Emails
          </span>
        </div>
      </div>

      {/* Main View Content */}
      {subTab === 'overview' ? (
        <AdminOverview
          leads={leads}
          employees={employees}
          callLogs={callLogs}
          emailLogs={emailLogs}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <AnalyticsView leads={leads} />
      )}
    </div>
  );
}
