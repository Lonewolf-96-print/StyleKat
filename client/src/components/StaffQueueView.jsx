import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
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
      const res = await fetch(`http://localhost:5000/api/live/${barberId}`);
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

    const socket = io("http://localhost:5000", { transports: ["websocket"] });
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
          <div key={staff.staffId} className="h-full flex flex-col bg-white rounded-t-[2.5rem] rounded-b-xl border-4 border-gray-200 shadow-xl overflow-hidden relative transition-transform hover:-translate-y-1 duration-300">

            {/* 🪞 MIRROR HEADER */}
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 text-center border-b-4 border-gray-600 relative shadow-md z-10">
              {/* Glossy Reflection */}
              <div className="absolute top-0 right-0 w-full h-1/2 bg-white/5 skew-y-3 pointer-events-none"></div>

              <h3 className="font-bold text-lg tracking-wider text-shadow">{staff.staffName}</h3>
              <div className="flex justify-center mt-1">
                <span className="text-[10px] uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded text-gray-300 border border-gray-600">
                  Station {staff.staffId.slice(-4)}
                </span>
              </div>
            </div>

            {/* CURRENT BOOKING */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              {current ? (
                <>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <p className="font-medium">{current.customerName}</p>
                  </div>

                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Scissors className="w-4 h-4 mr-2" />
                    {current.service}
                  </div>

                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Remaining: <strong>{currentRemain} min</strong>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Chair is free</p>
              )}
            </div>

            {/* QUEUE */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Queue</p>

              {combined.length === 0 ? (
                <p className="text-gray-500 text-sm">No one is waiting</p>
              ) : (
                <>
                  <ul className="space-y-3">
                    {visibleList.map((b) => (
                      <li
                        key={b._id}
                        className="p-2 border rounded-lg bg-gray-50 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{b.customerName}</div>
                          <div className="text-xs text-gray-600">{b.service}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-700">
                            {new Date(b.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {remainingTimes[b._id] ?? "—"} min
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex gap-2">
                    {visible < combined.length && (
                      <button
                        onClick={() =>
                          setVisibleCounts((prev) => ({
                            ...prev,
                            [staff.staffId]: visible + 2,
                          }))
                        }
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                      >
                        View More
                      </button>
                    )}

                    {combined.length > 2 && visible < combined.length && (
                      <button
                        onClick={() =>
                          setVisibleCounts((prev) => ({
                            ...prev,
                            [staff.staffId]: combined.length,
                          }))
                        }
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded"
                      >
                        View All
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ESTIMATED WAIT */}
            <p className="text-sm text-gray-600 mt-4">
              Estimated waiting time for a new booking:{" "}
              <span className="font-semibold">{estimatedWait} mins</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
