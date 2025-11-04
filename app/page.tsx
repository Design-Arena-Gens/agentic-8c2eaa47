"use client";

import { useEffect, useMemo, useState } from 'react';

type Booking = {
  id: string;
  restaurantName: string;
  restaurantPhone: string;
  date: string;
  time: string;
  partySize: number;
  customerName: string;
  notes?: string;
  status: 'pending' | 'calling' | 'confirmed' | 'declined' | 'failed';
};

export default function HomePage() {
  const [form, setForm] = useState({
    restaurantName: '',
    restaurantPhone: '',
    date: '',
    time: '',
    partySize: 2,
    customerName: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const isValid = useMemo(() => {
    return (
      form.restaurantName.trim() &&
      form.restaurantPhone.trim() &&
      form.date.trim() &&
      form.time.trim() &&
      form.customerName.trim() &&
      form.partySize > 0
    );
  }, [form]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create booking');
      const data = (await res.json()) as { booking: Booking };
      setBooking(data.booking);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!booking) return;
    const id = booking.id;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/book?id=${id}`);
      if (res.ok) {
        const data = (await res.json()) as { booking: Booking };
        setBooking(data.booking);
        if (['confirmed', 'declined', 'failed'].includes(data.booking.status)) {
          clearInterval(interval);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [booking?.id]);

  return (
    <main style={{
      minHeight: '100svh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: 'linear-gradient(180deg,#0f172a,#0b1220)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 760,
        background: '#0b1220',
        border: '1px solid #1f2a44',
        borderRadius: 16,
        padding: 24,
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Table Booking Calling Agent</h1>
        <p style={{ color: '#aeb7cc' }}>Automatically call a restaurant to book a table.</p>

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <TextField label="Restaurant name" value={form.restaurantName} onChange={(v) => setForm({ ...form, restaurantName: v })} />
          <TextField label="Restaurant phone (E.164)" placeholder="e.g., +14155551234" value={form.restaurantPhone} onChange={(v) => setForm({ ...form, restaurantPhone: v })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextField label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <TextField label="Time" type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextField label="Party size" type="number" min={1} value={String(form.partySize)} onChange={(v) => setForm({ ...form, partySize: Math.max(1, Number(v || 1)) })} />
            <TextField label="Your name" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} />
          </div>
          <TextArea label="Notes (optional)" placeholder="Seating, occasion, dietary, etc." value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

          <button onClick={submit} disabled={!isValid || loading} style={{
            background: isValid && !loading ? '#4f46e5' : '#334155',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            cursor: isValid && !loading ? 'pointer' : 'not-allowed',
            fontWeight: 600
          }}>
            {loading ? 'Creating booking?' : 'Create booking and call'}
          </button>

          {error && (
            <div style={{ color: '#fca5a5' }}>{error}</div>
          )}

          {booking && (
            <div style={{ marginTop: 12, padding: 12, border: '1px solid #1f2a44', borderRadius: 8 }}>
              <div><strong>Booking ID:</strong> {booking.id}</div>
              <div><strong>Status:</strong> {booking.status}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
}) {
  const id = props.label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label htmlFor={id} style={{ color: '#c7d2fe', fontSize: 12 }}>{props.label}</label>
      <input
        id={id}
        type={props.type || 'text'}
        min={props.min}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        style={{
          padding: '10px 12px',
          background: '#0f172a',
          border: '1px solid #24324d',
          color: 'white',
          borderRadius: 8
        }}
      />
    </div>
  );
}

function TextArea(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = props.label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label htmlFor={id} style={{ color: '#c7d2fe', fontSize: 12 }}>{props.label}</label>
      <textarea
        id={id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        rows={4}
        style={{
          padding: '10px 12px',
          background: '#0f172a',
          border: '1px solid #24324d',
          color: 'white',
          borderRadius: 8
        }}
      />
    </div>
  );
}
