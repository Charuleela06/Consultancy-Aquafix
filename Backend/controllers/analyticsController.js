const ServiceRequest = require("../models/ServiceRequest");

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const startOfWeek = (d) => {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7; // Monday as start
  x.setDate(x.getDate() - diff);
  return x;
};

const startOfMonth = (d) => {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
};

const parseDateOrNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(d.getTime())) return null;
  return d;
};

const pad2 = (n) => String(n).padStart(2, "0");

const formatYMD = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
};

const formatYM = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}`;
};

const getWeekStartMonday = (d) => startOfWeek(d);

const formatWeekPeriod = (d) => {
  const ws = getWeekStartMonday(d);
  // Label as W<weekNo>-<year> using a simple week count from Monday-start week 1
  const year = ws.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearStartWeek = getWeekStartMonday(yearStart);
  const diffDays = Math.floor((ws - yearStartWeek) / (1000 * 60 * 60 * 24));
  const weekNo = Math.floor(diffDays / 7) + 1;
  return `W${weekNo}-${year}`;
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    if (String(req.user?.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { startDate, endDate, serviceType, paymentMethod } = req.query;

    const start = parseDateOrNull(startDate);
    const end = parseDateOrNull(endDate);

    const baseQuery = {
      status: "Completed",
      paymentStatus: "Paid"
    };

    if (serviceType) baseQuery.serviceType = serviceType;

    const endInc = end ? new Date(new Date(end).setHours(23, 59, 59, 999)) : null;

    const requests = await ServiceRequest.find(baseQuery)
      .select("name serviceType status paymentStatus paymentHistory")
      .lean();

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    let total = 0;
    let today = 0;
    let week = 0;
    let month = 0;

    const dailyMap = new Map();
    const weeklyMap = new Map();
    const monthlyMap = new Map();
    const serviceMap = new Map();
    const bookingRows = [];

    for (const r of requests) {
      const st = r.serviceType || "Unknown";
      const ph = Array.isArray(r.paymentHistory) ? r.paymentHistory : [];

      for (const p of ph) {
        const method = p?.method || "";
        const amount = Number(p?.amount || 0);
        const date = p?.date ? new Date(p.date) : null;

        if (!date || !amount) continue;
        if (paymentMethod && method !== paymentMethod) continue;
        if (start && date < start) continue;
        if (endInc && date > endInc) continue;

        total += amount;
        if (date >= todayStart) today += amount;
        if (date >= weekStart) week += amount;
        if (date >= monthStart) month += amount;

        const dayKey = formatYMD(date);
        dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + amount);

        const weekKey = formatWeekPeriod(date);
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + amount);

        const monthKey = formatYM(date);
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);

        serviceMap.set(st, (serviceMap.get(st) || 0) + amount);

        bookingRows.push({
          date,
          customerName: r.name || "",
          serviceType: st,
          amount,
          paymentMethod: method,
          status: r.paymentStatus || "Paid"
        });
      }
    }

    const summary = { today, week, month, total };

    const daily = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }));

    const weekly = Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, revenue]) => ({ period, revenue }));

    const monthly = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, revenue]) => ({ period, revenue }));

    const serviceBreakdown = Array.from(serviceMap.entries())
      .map(([st, revenue]) => ({ serviceType: st, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const bookings = bookingRows
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 200);

    res.json({
      summary,
      daily,
      weekly,
      monthly,
      serviceBreakdown,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
