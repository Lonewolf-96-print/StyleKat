import React from 'react'

export default function BarberDashboard() {
// later: auth-guard barber role; show today's bookings and live queue per chair
return (
<section className="space-y-4">
<h2 className="text-2xl font-bold">Barber Dashboard</h2>
<p className="text-gray-600">Check-ins, queue control, mark complete, update wait time.</p>
</section>
);
}