import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { API_URL, SOCKET_URL } from "../lib/config";
import { Clock, User, Scissors } from "lucide-react";
// Always parse startTime as REAL DATE
const ts = (t) => (t ? new Date(t).getTime() : Date.now());

export default function StaffQueueView({ barberId }) {
  const [staffQueues, setStaffQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remainingTimes, setRemainingTimes] = useState({});
  const [visibleCounts, setVisibleCounts] = useState({});
  const socketRef = useRef(null);
  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };
  /* -------------------------------------------------------------------------- */
  /*                             FILTER & LOGIC                                 */
  /* -------------------------------------------------------------------------- */
  const VALID_STATUSES = ["confirmed", "accepted", "ongoing", "in-service"];

  const filterToday = (arr) => {
    return arr.map((staff) => {
      // 1. Filter Current
      let filteredCurrent = null;
      if (
        staff.current &&
        isToday(staff.current.date) &&
        VALID_STATUSES.includes(staff.current.status)
      ) {
        filteredCurrent = staff.current;
      }

      // 2. Filter Queue
      const filteredQueue = staff.queue.filter((b) => {
        return (
          isToday(b.date) &&
          notExpired(b) &&
          VALID_STATUSES.includes(b.status)
        );
      });

      return {
        ...staff,
        current: filteredCurrent,
        queue: filteredQueue,
      };
    });
  };

  const now = Date.now();
  const notExpired = (b) => {
    // If it's already past end time, don't show in "Upcoming" (unless it's 'current' handled separately)
    const start = new Date(b.startTime).getTime();
    const end = start + (b.duration || 30) * 60000;
    return end > now;
  };

  // ------------------------- CALCULATE REMAINING TIME -------------------------
  const computeRemaining = (staff) => {
    const now = Date.now();
    const seq = [];
    const out = {};

    if (staff.current) seq.push(staff.current);
    if (staff.queue?.length) seq.push(...staff.queue);

    let delay = 0;

    for (const b of seq) {
      const start = ts(b.startTime) + delay * 60000;
      const duration = b.duration || 30;
      const end = start + duration * 60000;

      let remain = 0;
      if (now < start) remain = Math.ceil((start - now) / 60000); // Not started yet (future)
      else if (now < end) remain = Math.ceil((end - now) / 60000); // In progress

      // If it's the CURRENT active booking, we want the "time left to finish".
      // If it's a FUTURE booking, 'remain' is 'time until start'.
      // But for the UI "wait: ~XXm", we usually want "how long until this person is done" or "accumulated wait"?
      // The original code seemingly just stored a simple calc. We'll keep this helper simple.
      out[b._id] = remain;

      // If we are strictly sequential (block-pushing), we'd incr delay.
      // But here `startTime` is absolute from DB. We shouldn't add delay unless simulating push-back.
      // We will assume DB times are accurate.
    }
    return out;
  };

  const recomputeAllRemaining = (arr) => {
    const out = {};
    arr.forEach((staff) => Object.assign(out, computeRemaining(staff)));
    setRemainingTimes(out);
  };

  // ----------------------------- INITIAL FETCH ------------------------------
  useEffect(() => {
    if (!barberId) return;
    setLoading(true);

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/live/${barberId}`);
        const data = await res.json();

        const arr = data[barberId] || [];
        arr.forEach((s) => (s.queue = s.queue || []));

        setStaffQueues(filterToday(arr));

        // default visible rows per staff
        const vc = {};
        arr.forEach((s) => (vc[s.staffId] = 2));
        setVisibleCounts(vc);

        recomputeAllRemaining(arr);
      } catch (err) {
        console.error("Failed to load queue", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [barberId]);

  // ----------------------------- SOCKET SETUP ------------------------------
  useEffect(() => {
    if (!barberId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinShopRoom", { barberId });
    });

    const update = (payload) => {
      // payload might be the WHOLE shop data or partial. 
      // Assuming payload structure matches api/live response for safety, or we re-fetch.
      // If payload is the queue array directly:
      const arr = Array.isArray(payload) ? payload : (payload[barberId] || []);

      // If it's just a single update, we might need to merge, but let's assume full refresh for "queueUpdated"
      // or "shopQueueUpdate" events usually send the full list.
      arr.forEach((s) => (s.queue = s.queue || []));
      setStaffQueues(filterToday(arr));
      recomputeAllRemaining(arr);
    };

    socket.on("shopQueueUpdate", update);
    socket.on("queueUpdated", update);
    socket.on("bookingStatusUpdate", () => {

      fetch(`${API_URL}/api/live/${barberId}`)
        .then(res => res.json())
        .then(update)
        .catch(err => console.error("Socket refresh failed", err));
    });

    return () => socket.disconnect();
  }, [barberId]);

  // ---------------------- AUTO UPDATE EVERY 10 SECONDS ----------------------
  useEffect(() => {
    // We need to re-run "filterToday" periodically too? 
    // Actually just recomputing remaining times is enough for "wait" display,
    // but expiring old bookings requires re-filtering.
    const id = setInterval(() => {
      // We can't easily "re-filter" state without source, but we can force re-render or re-calc
      // For now just update times. ideally we'd have the raw data + derived state.
      recomputeAllRemaining(staffQueues);
    }, 10000);

    return () => clearInterval(id);
  }, [staffQueues]);


  // Helper to calculate "Walk-in Wait Time"
  // Logic: Time until the "Current Contiguous Block" of work finishes.
  const calculateRealWait = (current, queue, remainingMap) => {
    const now = Date.now();
    let waitTimestamp = now;

    // 1. If Chair is busy, we start waiting from when current finishes.
    if (current) {
      const r = remainingMap[current._id] || 0;
      // The current ends effectively at Now + Remaining
      waitTimestamp = now + (r * 60000);
    }

    // 2. Check upcoming queue. 
    // If an upcoming booking starts "soon enough" (overlapping or essentially contiguous with waitTimestamp),
    // then it blocks the walk-in.
    // We allow a small "gap buffer" (e.g. 10 mins). If gap > 10 mins, we assume walk-in fits.
    const GAP_BUFFER_MS = 10 * 60000;

    for (const b of queue) {
      const bStart = ts(b.startTime);
      const bDuration = (b.duration || 30) * 60000;

      // If this booking starts BEFORE (waitTimestamp + buffer), it adds to the wait.
      if (bStart <= (waitTimestamp + GAP_BUFFER_MS)) {
        // The new free time is max(waitTimestamp, bEnd)
        // But usually sequential means we add duration to the end of the block?
        // Actually, if it's a scheduled appointment, it ends at bStart + Duration.
        // If we are pushed back, it ends at waitTimestamp + Duration.
        // Let's assume strict schedule: It ends at bStart + bDuration.
        // But if we are currently delayed (waitTimestamp > bStart), then it ends at waitTimestamp + bDuration.
        const effectiveEnd = Math.max(bStart, waitTimestamp) + bDuration;
        waitTimestamp = effectiveEnd;
      } else {
        // Found a gap! The chair is free between waitTimestamp and bStart.
        break;
      }
    }

    const totalMinutes = Math.max(0, Math.ceil((waitTimestamp - now) / 60000));
    return totalMinutes;
  };


  // ------------------------------ RENDER UI ------------------------------
  if (loading) return <p>Loading queue…</p>;
  if (!staffQueues.length) return <p>No staff data.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {staffQueues.map((staff) => {
        const current = staff.current;
        const queue = staff.queue || [];
        const visible = visibleCounts[staff.staffId] || 2;

        const currentRemain = current ? remainingTimes[current._id] || 0 : 0;
        // const combined = ... (replaced below)

        // NEW CALCULATION: Effective Schedule
        const calculateEffectiveSchedule = (current, queue, remainingMap) => {
          const now = Date.now();
          let blockEnd = now;

          // 1. Start from when current finishes
          if (current) {
            const r = remainingMap[current._id] || 0;
            blockEnd = now + (r * 60000);
          }

          // 2. Map queue to expected times
          return queue.map(b => {
            const scheduledStart = new Date(b.startTime).getTime();
            const duration = (b.duration || 30) * 60000;

            // effective start is max(scheduled, previous_block_end)
            const effectiveStart = Math.max(scheduledStart, blockEnd);

            // This booking ends at effectiveStart + duration
            blockEnd = effectiveStart + duration;

            return {
              ...b,
              effectiveStart,
              isDelayed: (effectiveStart - scheduledStart) > 5 * 60000 // > 5 mins delay
            };
          });
        };

        const effectiveQueue = calculateEffectiveSchedule(current, queue, remainingTimes);

        // Use effectiveQueue for list calculation so we have the 'delayed' info
        const combinedForList = current ? [current, ...effectiveQueue] : [...effectiveQueue];
        const visibleList = combinedForList.slice(0, visible);

        // Walk-in wait is basically the end of the last effective item - now
        // BUT calculateRealWait logic was slightly different (gap filling). 
        // Let's stick to the simpler "Total Est. Wait" which is usually "Time until Last Booking finishes" 
        // or "Time until First Gap". 
        // The previous calculateRealWait tries to find a gap. 
        // Let's keep calculateRealWait for the "Walk-in" number as it checks gaps.
        const estimatedWait = calculateRealWait(current, queue, remainingTimes);

        return (
          <div key={staff.staffId} className="h-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">

            {/* Header */}
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">{staff.staffName}</h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded">
                Station {staff.staffId.slice(-4)}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">

              {/* CURRENT STATUS */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Current Status</div>
                {current ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-blue-900">{current.customerName}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">{currentRemain} min left</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-700/80 gap-2">
                      <Scissors size={14} />
                      <span className="truncate">{current.service}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse relative">
                      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                    </div>
                    <span className="text-green-700 font-medium">Chair is Free</span>
                  </div>
                )}
              </div>

              {/* QUEUE LIST */}
              <div className="flex-1 min-h-[100px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Upcoming Queue</div>
                  <span className="text-xs text-gray-500 font-medium">{queue.length} Waiting</span>
                </div>

                {combinedForList.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-4 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    No upcoming bookings
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visibleList.map((b) => (
                      <div key={b._id} className="flex justify-between items-center p-2 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">{b.customerName}</span>
                          <span className="text-[10px] text-gray-500">{b.service}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-700">
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {b.isDelayed && (
                            <div className="text-[10px] font-bold text-amber-600">
                              Exp: {new Date(b.effectiveStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {/* 
                              For upcoming items, "wait" is vague. 
                              Usually means "Time until I start" (which is just startTime - now).
                              Or "Delay". 
                              Let's just show start time as primary. 
                          */}
                        </div>
                      </div>
                    ))}

                    {/* View More Buttons */}
                    <div className="pt-2 flex gap-2">
                      {visible < combinedForList.length && (
                        <button
                          onClick={() => setVisibleCounts(prev => ({ ...prev, [staff.staffId]: visible + 2 }))}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          View More ({combinedForList.length - visible})
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER METRICS */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">Total Est. Wait</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{estimatedWait} mins</span>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
