const StaffScheduleSchema = new mongoose.Schema({
  staffId: { type: mongoose.Types.ObjectId, ref: "Staff", required: true },
  date: { type: String, required: true },
  blocks: [
    {
      start: String,
      end: String,
      bookingId: String,
      type: { type: String, enum: ["booking", "manual"], default: "booking" }
    }
  ]
});

export default mongoose.model("StaffSchedule", StaffScheduleSchema);
