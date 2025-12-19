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
  const filterToday = (arr) => {
    return arr.map((staff) => {
      const filteredCurrent =
        staff.current && isToday(staff.current.date) ? staff.current : null;

      const filteredQueue = staff.queue.filter(
        (b) => isToday(b.date) && notExpired(b)
      );


      return {
        ...staff,
        current: filteredCurrent,
        queue: filteredQueue,
      };
    });
  };
  const now = Date.now();
  const notExpired = (b) => {
    const start = new Date(b.startTime).getTime();
    const end = start + (b.duration || 30) * 60000;
    return end > now; // keep only non-expired bookings
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
      if (now < start) remain = Math.ceil((start - now) / 60000);      // Not started yet
      else if (now < end) remain = Math.ceil((end - now) / 60000);     // In progress

      out[b._id] = remain;
      delay += duration;
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
      setLoading(false);
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
      socket.emit("joinShopRoom", `shop-${barberId}`);
    });

    const update = (payload) => {
      const arr = payload[barberId] || [];
      arr.forEach((s) => (s.queue = s.queue || []));
      setStaffQueues(filterToday(arr));

      recomputeAllRemaining(arr);
    };

    socket.on("shopQueueUpdate", update);
    socket.on("queueUpdated", update);

    return () => socket.disconnect();
  }, [barberId]);

  // ---------------------- AUTO UPDATE EVERY 10 SECONDS ----------------------
  useEffect(() => {
    const id = setInterval(() => {
      recomputeAllRemaining(staffQueues);
    }, 10000);

    return () => clearInterval(id);
  }, [staffQueues]);

  // ------------------------------ RENDER UI ------------------------------
  if (loading) return <p>Loading queue…</p>;
  if (!staffQueues.length) return <p>No staff data.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {staffQueues.map((staff) => {
        const current = staff.current;
        const queue = staff.queue;
        const visible = visibleCounts[staff.staffId] || 2;

        const currentRemain = current ? remainingTimes[current._id] || 0 : 0;

        const combined = current ? [current, ...queue] : [...queue];
        const visibleList = combined.slice(0, visible);

        const futureSum = queue.reduce((sum, b) => sum + (b.duration || 30), 0);
        const estimatedWait = currentRemain + futureSum;

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

                {combined.length === 0 ? (
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
                          <div className="text-[10px] text-gray-400">
                            wait: ~{remainingTimes[b._id] ?? "--"}m
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* View More Buttons */}
                    <div className="pt-2 flex gap-2">
                      {visible < combined.length && (
                        <button
                          onClick={() => setVisibleCounts(prev => ({ ...prev, [staff.staffId]: visible + 2 }))}
                          className="text-xs text-blue-600 font-medium hover:underline"
                        >
                          View More ({combined.length - visible})
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
