Frontend runs at: **http://localhost:3000**

---

## 🔄 Booking Flow

```
Landing Page
    ↓
Step 1: Select Route (departure, destination, date)
    ↓
Step 2: Select Bus (see prices, departure times, available seats)
    ↓
Step 3: Pick Seat (visual seat map — green=available, red=taken)
    ↓
Step 4: Passenger Details (name, email, phone)
    ↓
Step 5: Booking Summary (review all details)
    ↓
Flutterwave Payment Page
    ↓
✅ Success: QR code e-ticket sent to passenger email
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/routes/departures` | Get all departure cities |
| GET | `/api/routes/destinations/:from` | Get destinations for a city |
| GET | `/api/buses/search?from=&to=&date=` | Search available buses |
| GET | `/api/buses/:busId/seats?date=` | Get seat availability |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/ref/:reference` | Get booking by reference |
| POST | `/api/payment/initialize` | Initialize Flutterwave payment |
| GET | `/api/payment/verify` | Flutterwave payment callback |
| GET | `/api/payment/status/:ref` | Check payment status |

---

## 💳 Flutterwave Setup

1. Sign up at [dashboard.flutterwave.com](https://dashboard.flutterwave.com)
2. Go to **Settings → API Keys**
3. Copy your Test keys (use Test mode for development)
4. In your Flutterwave dashboard, set the **Redirect URL** to:
   ```
   http://localhost:5000/api/payment/verify
   ```
   (For production, replace with your real domain)

---

## 📧 Gmail App Password Setup

To send emails via Gmail:
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification**
3. Go to **App Passwords** → Create a new app password
4. Use that generated password as `EMAIL_PASS` in your `.env`

---

## 🗄️ Database Models

### Route
- `from` (String) — departure city
- `to` (String) — destination city
- `isActive` (Boolean)

### Bus
- `name` (String) — bus company name
- `route` (ObjectId → Route)
- `departureTime` / `arrivalTime` (String) — e.g. "06:00"
- `totalSeats` (Number)
- `pricePerSeat` (Number)

### Booking
- `bus` (ObjectId → Bus)
- `travelDate` (String) — "YYYY-MM-DD"
- `seatNumber` (Number)
- `passenger` — { name, email, phone }
- `bookingReference` — auto-generated e.g. "NJB-A3KF9PZR"
- `paymentStatus` — "pending" | "paid" | "failed"
- `qrCodeData` (String) — base64 QR image
- `totalAmount` (Number)

---

## ✅ Essential Notes

- **Pending seat lock**: A seat booked with `pending` payment status is locked to prevent double-booking. If payment fails, the seat is freed on next search.
- **QR code**: Generated after successful payment and embedded in the email.
- **Responsive**: All pages are fully responsive for mobile, tablet, and desktop.
- **Session storage**: Booking data is kept in `sessionStorage` across the 5-step flow and cleared after payment success.

---

## 🚢 Production Deployment Checklist

- [ ] Switch Flutterwave to **Live** keys
- [ ] Update `APP_URL` to your real backend domain
- [ ] Update `FRONTEND_URL` to your real frontend domain
- [ ] Update Flutterwave **Redirect URL** to production backend URL
- [ ] Use MongoDB Atlas for cloud database
- [ ] Deploy backend to Railway / Render / VPS
- [ ] Deploy frontend to Vercel (`vercel deploy`)
