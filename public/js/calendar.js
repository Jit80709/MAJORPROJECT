// ===============================
// Flatpickr Setup with Boundary Fix
// ===============================

// Convert backend ranges so that checkout day stays AVAILABLE
const disabledRanges = (window.bookedRanges || []).map(range => {
  const from = new Date(range.from);
  const to = new Date(range.to);

  // 🔥 subtract 1 day from checkout date
  to.setDate(to.getDate() - 1);

  return { from, to };
});

// CheckOut picker (declare first to avoid reference issue)
const checkOutPicker = flatpickr("#checkOut", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: disabledRanges,
});

// CheckIn picker
const checkInPicker = flatpickr("#checkIn", {
  dateFormat: "Y-m-d",
  minDate: "today",
  disable: disabledRanges,

  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length > 0) {
      // checkout must be at least 1 day after checkin
      const nextDay = new Date(selectedDates[0]);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutPicker.set("minDate", nextDay);
    }
  },
});