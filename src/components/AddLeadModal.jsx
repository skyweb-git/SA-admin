import React, { useState } from 'react';
import { X, Plus, UserPlus, Phone, Mail, BedDouble } from 'lucide-react';
import { saveLead } from '../services/leadStorage';

export default function AddLeadModal({ isOpen, onClose, onLeadAdded }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredMethod: 'Phone',
    source: 'Direct Phone / Walk-in',
    status: 'New',
    unitInterest: 'Any Room / Best Available',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    budget: '',
    message: '',
    notes: '',
    followUpDate: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || (!formData.phone.trim() && !formData.email.trim())) {
      setError('Guest Full Name and at least Phone or Email are required.');
      return;
    }

    const newLead = await saveLead(formData);
    if (onLeadAdded) onLeadAdded(newLead);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} className="text-cyan-400" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Add New Reservation Enquiry</h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderRadius: '6px', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Guest Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Sindi Mhlongo"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+27 78 123 4567"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="guest@example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Contact Method</label>
                <select
                  name="preferredMethod"
                  value={formData.preferredMethod}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Enquiry Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Website Booking Form">Website Booking Form</option>
                  <option value="Direct Phone / Walk-in">Direct Phone / Walk-in</option>
                  <option value="WhatsApp Direct">WhatsApp Direct</option>
                  <option value="Website Contact Form">Website Contact Form</option>
                  <option value="Referral / Returning Guest">Referral / Returning Guest</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reservation Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="New">New Enquiry</option>
                  <option value="Contacted">Contacted / Availability Sent</option>
                  <option value="Confirmed">Confirmed Booking</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Room Type Selected</label>
                <select
                  name="unitInterest"
                  value={formData.unitInterest}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Any Room / Best Available">Any Room / Best Available</option>
                  <option value="Renovated Double Room">Renovated Double Room (2 guests)</option>
                  <option value="Twin Room with Kitchenette">Twin Room with Kitchenette (2 guests)</option>
                  <option value="Triple Room">Triple Room (3 guests)</option>
                  <option value="Budget Double Room">Budget Double Room (2 guests)</option>
                  <option value="Comfort Triple Room with Shower">Comfort Triple Room with Shower (3 guests)</option>
                  <option value="Budget Triple Room">Budget Triple Room (3 guests)</option>
                  <option value="Family Room">Family Room (3–4 guests)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Check-in Date</label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-out Date</label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests / Guest Notes</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Late arrival, extra towels, airport shuttle request..."
                rows="2"
                className="form-textarea"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Save Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
