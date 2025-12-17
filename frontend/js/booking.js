// frontend/js/booking.js
const booking = (function() {
  // in-memory bookings
  const bookings = {};

  function simulateNetworkDelay() {
    return new Promise(resolve => setTimeout(resolve, 600));
  }

  async function bookService(vehicleId) {
    await simulateNetworkDelay();
    const center = "OEM Service Center A";
    const datetime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0,16).replace('T',' ');
    const bookingId = 'BK-' + Math.floor(Math.random()*90000+10000);
    bookings[vehicleId] = { bookingId, center, datetime, status: 'Booked' };
    return { vehicleId, bookingId, center, datetime, status: 'Booked' };
  }

  function getBooking(vehicleId) {
    return bookings[vehicleId] || null;
  }

  return { bookService, getBooking };
})();
