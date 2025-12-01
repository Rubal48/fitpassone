// controllers/eventBookingController.js
import EventBooking from "../models/EventBooking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Gym from "../models/Gym.js"; // 👈 added

// import { sendEventBookingEmail } from "../utils/sendEmail.js"; // (optional for later)

/**
 * 🧾 Create a new event booking
 * Body: { eventId, tickets, userId? }
 * User: from req.user (preferred) or fallback to body.userId
 */
export const createEventBooking = async (req, res) => {
  try {
    const { eventId, tickets = 1, userId: bodyUserId } = req.body;

    if (!eventId) {
      return res
        .status(400)
        .json({ success: false, message: "Event ID is required" });
    }

    const userId = req.user?._id || bodyUserId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const [event, user] = await Promise.all([
      Event.findById(eventId),
      User.findById(userId),
    ]);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    // ✅ LEGACY-SAFE STATUS CHECK
    // For old events that don't have status stored in DB, allow booking.
    if (event.status && event.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "This event is not open for bookings yet",
      });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const qty = Number(tickets) || 1;

    // ✅ capacity check (legacy-safe)
    const remaining =
      typeof event.remainingSeats === "number"
        ? event.remainingSeats
        : event.capacity;

    if (typeof remaining === "number" && qty > remaining) {
      return res.status(400).json({
        success: false,
        message: `Only ${remaining} spots left`,
      });
    }

    // ✅ prevent duplicate active booking (soft check)
    const existingActive = await EventBooking.findOne({
      user: userId,
      event: eventId,
      status: { $in: ["active", "checked-in"] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: "You already have an active booking for this event",
      });
    }

    const pricePerTicket = event.price;
    const grossTotal = pricePerTicket * qty;

    // simple platform economics (10% fee as placeholder)
    const platformFee = Math.round(grossTotal * 0.1);
    const hostPayout = grossTotal - platformFee;

    const booking = new EventBooking({
      user: userId,
      event: eventId,
      eventDate: event.date,
      tickets: qty,
      totalPrice: grossTotal,
      currency: "INR",
      paymentStatus: "paid",
      platformFee,
      hostPayout,
      source: "web",
    });

    await booking.save();

    // ✅ update event stats & capacity (LEGACY SAFE)
    // capacity
    if (typeof event.decrementSeats === "function") {
      event.decrementSeats(qty);
    } else {
      // fallback for any weird legacy cases
      const currentRemaining =
        typeof event.remainingSeats === "number"
          ? event.remainingSeats
          : event.capacity;
      event.remainingSeats = Math.max(0, currentRemaining - qty);
      event.ticketsSold = (event.ticketsSold || 0) + qty;
    }

    // revenue
    event.totalRevenue = (event.totalRevenue || 0) + grossTotal;

    // stats (defensive)
    if (!event.stats) {
      event.stats = {
        totalBookings: 0,
        totalAttendees: 0,
        totalCancellations: 0,
      };
    }
    event.stats.totalBookings =
      (event.stats.totalBookings || 0) + 1;
    event.stats.totalAttendees =
      (event.stats.totalAttendees || 0) + qty;

    await event.save();

    // (optional) send confirmation email
    // if (user.email) {
    //   await sendEventBookingEmail(user.email, { event, booking });
    // }

    return res.status(201).json({
      success: true,
      message: "Event booked successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating event booking:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create event booking",
    });
  }
};

/**
 * 📜 Get bookings for logged-in user
 * GET /api/event-bookings/me
 */
export const getMyEventBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const bookings = await EventBooking.find({ user: userId })
      .populate(
        "event",
        "name image location date price organizer rating ratingCount"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching my event bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
    });
  }
};

/**
 * 📜 Get bookings by user ID (admin use)
 * GET /api/event-bookings/user/:userId
 */
export const getEventBookingsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await EventBooking.find({ user: userId })
      .populate(
        "event",
        "name image location date price organizer rating ratingCount"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching user event bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

/**
 * 📄 Get a single booking
 * GET /api/event-bookings/:id
 */
export const getEventBookingById = async (req, res) => {
  try {
    const booking = await EventBooking.findById(req.params.id)
      .populate(
        "event",
        "name image location date price organizer personalNote meetingPoint meetingInstructions cancellationPolicy"
      )
      .populate("user", "name email");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error("❌ Error fetching event booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch booking" });
  }
};

/**
 * ✅ Verify ticket / check-in via bookingCode
 * GET /api/event-bookings/verify/:bookingCode
 */
export const verifyEventBooking = async (req, res) => {
  try {
    const { bookingCode } = req.params;

    const booking = await EventBooking.findOne({ bookingCode })
      .populate("event", "name location date")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Booking not found",
      });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Ticket already used, cancelled or expired",
      });
    }

    booking.status = "checked-in";
    booking.checkInAt = new Date();
    await booking.save();

    return res.json({
      success: true,
      valid: true,
      message: "Valid ticket. Check-in successful ✅",
      booking: {
        bookingCode: booking.bookingCode,
        user: booking.user.name,
        event: booking.event.name,
        location: booking.event.location,
        date: booking.event.date,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying event booking:", error);
    res.status(500).json({
      success: false,
      valid: false,
      message: "Failed to verify ticket",
    });
  }
};

/**
 * ❌ Cancel booking with basic policy
 * POST /api/event-bookings/:id/cancel
 */
export const cancelEventBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user?._id; // user who is cancelling

    const booking = await EventBooking.findById(bookingId).populate(
      "event"
    );
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Optional: ensure user owns this booking (unless admin)
    if (userId && booking.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to cancel this booking",
      });
    }

    if (booking.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active bookings can be cancelled",
      });
    }

    const event = booking.event;
    const now = new Date();
    const eventDate = new Date(event.date);

    const diffHours = (eventDate - now) / (1000 * 60 * 60);

    // basic policy from event.cancellationPolicy
    const policy = event.cancellationPolicy || {};
    const freeHours = policy.freeCancellationHours ?? 24;
    const refundBefore = policy.refundPercentBefore ?? 100;
    const refundAfter = policy.refundPercentAfter ?? 0;

    let refundPercent = 0;
    if (policy.type === "none") {
      refundPercent = 0;
    } else if (diffHours >= freeHours) {
      refundPercent = refundBefore;
    } else if (diffHours > 0) {
      refundPercent = refundAfter;
    } else {
      // event already started/past
      refundPercent = 0;
    }

    const refundAmount = Math.round(
      (booking.totalPrice * refundPercent) / 100
    );

    booking.status = "cancelled";
    booking.cancelledAt = now;
    booking.cancelReason = req.body.reason || "";
    booking.refundStatus = refundAmount > 0 ? "requested" : "none";
    booking.refundAmount = refundAmount;

    await booking.save();

    // update event stats & capacity back (LEGACY SAFE)
    if (typeof event.incrementSeats === "function") {
      event.incrementSeats(booking.tickets);
    } else {
      const currentRemaining =
        typeof event.remainingSeats === "number"
          ? event.remainingSeats
          : event.capacity;
      event.remainingSeats = Math.min(
        event.capacity,
        currentRemaining + booking.tickets
      );
      event.ticketsSold = Math.max(
        0,
        (event.ticketsSold || 0) - booking.tickets
      );
    }

    if (!event.stats) {
      event.stats = {
        totalBookings: 0,
        totalAttendees: 0,
        totalCancellations: 0,
      };
    }
    event.stats.totalCancellations =
      (event.stats.totalCancellations || 0) + 1;

    event.totalRevenue = Math.max(
      0,
      (event.totalRevenue || 0) - refundAmount
    );
    await event.save();

    return res.json({
      success: true,
      message: "Booking cancelled",
      refundAmount,
      refundPercent,
    });
  } catch (error) {
    console.error("❌ Error cancelling event booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

/**
 * 👥 Attendance list for an event (host/admin)
 * GET /api/event-bookings/event/:eventId/attendance
 */
export const getEventAttendanceList = async (req, res) => {
  try {
    const { eventId } = req.params;

    const bookings = await EventBooking.find({ event: eventId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      attendees: bookings.map((b) => ({
        id: b._id,
        bookingCode: b.bookingCode,
        userName: b.user?.name,
        userEmail: b.user?.email,
        tickets: b.tickets,
        status: b.status,
        checkInAt: b.checkInAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching attendance list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance list",
    });
  }
};

/**
 * 📊 Event-level analytics snapshot
 * GET /api/event-bookings/event/:eventId/analytics
 */
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [event, bookings] = await Promise.all([
      Event.findById(eventId),
      EventBooking.find({ event: eventId }),
    ]);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const totalBookings = bookings.length;
    const totalTickets = bookings.reduce(
      (sum, b) => sum + (b.tickets || 0),
      0
    );
    const checkedIn = bookings.filter(
      (b) => b.status === "checked-in"
    ).length;
    const cancelled = bookings.filter(
      (b) => b.status === "cancelled"
    ).length;

    const analytics = {
      totalBookings,
      totalTickets,
      checkedIn,
      cancelled,
      capacity: event.capacity,
      remainingSeats: event.remainingSeats,
      revenueTracked: event.totalRevenue,
    };

    res.status(200).json({ success: true, analytics });
  } catch (error) {
    console.error("❌ Error fetching event analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

/**
 * 📊 Host / event organiser overview stats
 * GET /api/event-bookings/host/overview
 *
 * Used in PartnerOverview when businessType === "event"
 */
export const getEventHostOverview = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Find linked gym/event brand for this user
    const gym = await Gym.findOne({ owner: userId }).lean();

    // Build event query: prefer matching by organizer name (brand),
    // otherwise fallback to host user id.
    const eventQuery = {};
    if (gym?.name) {
      eventQuery.organizer = gym.name;
    } else {
      eventQuery.host = userId;
    }

    const events = await Event.find(eventQuery).lean();

    if (!events.length) {
      return res.json({
        success: true,
        bookingsToday: 0,
        activePasses: 0, // here: active events
        revenueThisMonth: 0,
        growthRate: 0,
        rating: 0,
        upcomingEvents: 0,
      });
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // For growth: compare last 7 days vs previous 7 days
    const startCurrent7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startPrev7 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const eventIds = events.map((e) => e._id);

    const bookings = await EventBooking.find({
      event: { $in: eventIds },
      createdAt: { $gte: startPrev7 },
    }).lean();

    let bookingsToday = 0;
    let revenueThisMonth = 0;
    let current7 = 0;
    let prev7 = 0;

    bookings.forEach((b) => {
      const created = new Date(b.createdAt);
      const tickets = b.tickets || 0;
      const payout = b.hostPayout ?? b.totalPrice ?? 0;

      if (created >= startOfToday) {
        bookingsToday += tickets;
      }
      if (created >= startOfMonth) {
        revenueThisMonth += payout;
      }
      if (created >= startCurrent7) {
        current7 += 1;
      } else if (created >= startPrev7) {
        prev7 += 1;
      }
    });

    let growthRate = 0;
    if (prev7 > 0) {
      growthRate = Math.round(((current7 - prev7) / prev7) * 100);
    } else if (current7 > 0) {
      growthRate = 100;
    }

    const nowTime = now.getTime();
    const upcomingEvents = events.filter(
      (e) => e.date && new Date(e.date).getTime() >= nowTime
    ).length;

    const activeEvents = events.filter((e) => {
      const isApproved = !e.status || e.status === "approved";
      const isFuture = e.date
        ? new Date(e.date).getTime() >= nowTime
        : false;
      return isApproved && isFuture;
    }).length;

    let ratingSum = 0;
    let ratingCount = 0;
    events.forEach((e) => {
      if (typeof e.rating === "number" && e.ratingCount > 0) {
        ratingSum += e.rating;
        ratingCount += 1;
      }
    });
    const avgRating = ratingCount ? ratingSum / ratingCount : 0;

    return res.json({
      success: true,
      bookingsToday,
      activePasses: activeEvents, // reused key for PartnerOverview
      revenueThisMonth,
      growthRate,
      rating: avgRating,
      upcomingEvents,
    });
  } catch (error) {
    console.error("❌ Error fetching host overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch host overview",
    });
  }
};

/**
 * 🥇 Top events for a host / partner
 * GET /api/event-bookings/host/top-events
 *
 * Used in PartnerOverview "Top events" box
 */
export const getEventHostTopEvents = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const gym = await Gym.findOne({ owner: userId }).lean();

    const eventQuery = {};
    if (gym?.name) {
      eventQuery.organizer = gym.name;
    } else {
      eventQuery.host = userId;
    }

    const events = await Event.find(eventQuery).lean();

    if (!events.length) {
      return res.json({ success: true, items: [] });
    }

    const eventIds = events.map((e) => e._id);

    const bookings = await EventBooking.find({
      event: { $in: eventIds },
    })
      .lean()
      .exec();

    const byEvent = {};
    bookings.forEach((b) => {
      const key = b.event.toString();
      if (!byEvent[key]) {
        byEvent[key] = { totalTickets: 0, totalRevenue: 0 };
      }
      byEvent[key].totalTickets += b.tickets || 0;
      byEvent[key].totalRevenue += b.totalPrice || 0;
    });

    const eventMap = new Map(events.map((e) => [e._id.toString(), e]));

    const items = Object.entries(byEvent).map(([eventId, agg]) => {
      const ev = eventMap.get(eventId);
      const totalTickets = agg.totalTickets;
      const totalRevenue = agg.totalRevenue;
      const averagePrice =
        totalTickets > 0
          ? Math.round(totalRevenue / totalTickets)
          : ev?.price || 0;

      return {
        eventId,
        name: ev?.name || "Event",
        totalTickets,
        totalRevenue,
        averagePrice,
        date: ev?.date,
      };
    });

    items.sort((a, b) => {
      if (b.totalTickets !== a.totalTickets) {
        return b.totalTickets - a.totalTickets;
      }
      return b.totalRevenue - a.totalRevenue;
    });

    const top3 = items.slice(0, 3);

    return res.json({ success: true, items: top3 });
  } catch (error) {
    console.error("❌ Error fetching host top events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top events",
    });
  }
};

/**
 * 👤 Host-level event bookings (for PartnerBookings)
 * GET /api/event-bookings/host/me
 *
 * Used in PartnerBookings when isEventHost === true
 */
export const getHostEventBookings = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // Try to match events by brand name first (organizer),
    // otherwise fallback to host user id
    const gym = await Gym.findOne({ owner: userId }).lean();

    const eventQuery = {};
    if (gym?.name) {
      eventQuery.organizer = gym.name;
    } else {
      eventQuery.host = userId;
    }

    const events = await Event.find(eventQuery)
      .select("_id name date location")
      .lean();

    if (!events.length) {
      return res.json({ success: true, bookings: [] });
    }

    const eventIds = events.map((e) => e._id);

    const bookings = await EventBooking.find({
      event: { $in: eventIds },
    })
      .populate("user", "name email")
      .populate("event", "name date location")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("❌ Error fetching host bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch host bookings",
    });
  }
};
