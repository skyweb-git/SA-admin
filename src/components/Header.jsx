import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Briefcase, 
  Globe, 
  Clock, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { exportLeadsToCSV } from '../services/leadStorage';

export default function Header({ 
  currentUser, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  leads 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = currentUser && currentUser.role === 'admin';

  const handleExport = () => {
    exportLeadsToCSV(leads);
    setMobileMenuOpen(false);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleOpenAdd = () => {
    onOpenAddModal();
    setMobileMenuOpen(false);
  };

  return (
    <header className="admin-navbar">
      {/* Top Navbar Row */}
      <div className="navbar-top-row">
        {/* Brand */}
        <div className="nav-brand">
          <div className="brand-logo-icon">
            <Building2 size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span>EDION ROYAL</span>
              <span className={`brand-badge ${isAdmin ? 'admin-badge' : 'emp-badge'}`}>
                {isAdmin ? 'ADMIN PORTAL' : 'STAFF CRM'}
              </span>
            </div>
            <div className="brand-subtitle">Guesthouse Milnerton · Reservations &amp; Website CMS</div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions desktop-actions">
          <div className="live-indicator" title="Connected in real-time to Landing Page">
            <span className="live-dot"></span>
            <span>Live Sync</span>
          </div>

          {isAdmin && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleExport}
              title="Export all leads to CSV / Excel"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenAddModal}
          >
            <Plus size={15} />
            <span>New Lead</span>
          </button>

          {/* User Profile Pill & Logout */}
          <div className="user-profile-pill">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.name || 'User'} 
                className="user-avatar-img"
              />
            ) : (
              <span className="user-avatar-emoji">{currentUser?.avatar || '💼'}</span>
            )}
            <div className="user-info-text">
              <div className="user-name">
                {currentUser?.name}
              </div>
              <div className="user-role">
                {currentUser?.role === 'admin' ? 'Super Admin' : currentUser?.designation}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-secondary btn-icon btn-sm btn-logout"
              title="Sign out of CRM"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Quick Actions & Menu Toggle */}
        <div className="mobile-header-actions">
          <button 
            className="btn btn-primary btn-sm mobile-add-btn"
            onClick={handleOpenAdd}
            title="New Lead"
          >
            <Plus size={15} />
            <span className="mobile-btn-text">Lead</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Admin vs Employee) - horizontally scrollable on mobile */}
      <nav className="nav-tabs-container">
        <div className="nav-tabs">
          {isAdmin ? (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' || activeTab === 'overview' || activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => handleTabClick('dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>Executive Dashboard</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'leads' || activeTab === 'calls' || activeTab === 'emails' ? 'active' : ''}`}
                onClick={() => handleTabClick('leads')}
              >
                <Users size={15} />
                <span>Leads &amp; Activities</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => handleTabClick('employees')}
              >
                <UserCheck size={15} />
                <span>Staff &amp; Credentials</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'monitoring' || activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => handleTabClick('monitoring')}
              >
                <Clock size={15} />
                <span>Time &amp; Activity</span>
              </button>

              <button
                className={`nav-tab-btn ${activeTab === 'cms' ? 'active' : ''}`}
                onClick={() => handleTabClick('cms')}
              >
                <Globe size={15} />
                <span>Website CMS</span>
              </button>
            </>
          ) : (
            <button
              className={`nav-tab-btn ${activeTab === 'desk' ? 'active' : ''}`}
              onClick={() => handleTabClick('desk')}
            >
              <Briefcase size={15} />
              <span>Calling &amp; Outreach Desk</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Drawer / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-dropdown">
          {/* User Profile Card */}
          <div className="mobile-user-card">
            <div className="mobile-user-header">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.name || 'User'} 
                  className="user-avatar-img-lg"
                />
              ) : (
                <span className="user-avatar-emoji-lg">{currentUser?.avatar || '💼'}</span>
              )}
              <div className="mobile-user-details">
                <div className="mobile-user-name">{currentUser?.name}</div>
                <div className="mobile-user-sub">
                  {currentUser?.role === 'admin' ? 'Super Administrator' : currentUser?.designation}
                </div>
              </div>
            </div>

            <div className="mobile-user-status-row">
              <div className="live-indicator">
                <span className="live-dot"></span>
                <span>Live Sync Active</span>
              </div>
              <span className={`brand-badge ${isAdmin ? 'admin-badge' : 'emp-badge'}`}>
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="mobile-menu-actions">
            {isAdmin && (
              <button 
                className="btn btn-secondary mobile-menu-btn"
                onClick={handleExport}
              >
                <Download size={16} />
                <span>Export All Leads (CSV)</span>
              </button>
            )}

            <button 
              className="btn btn-primary mobile-menu-btn"
              onClick={handleOpenAdd}
            >
              <Plus size={16} />
              <span>Add New Reservation Lead</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="btn btn-secondary mobile-menu-btn mobile-logout-btn"
            >
              <LogOut size={16} />
              <span>Sign Out of CRM</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
