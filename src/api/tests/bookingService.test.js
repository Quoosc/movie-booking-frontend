import { describe, it, expect, vi, beforeEach } from "vitest";

const apiFetchMock = vi.fn();
vi.mock("../fetchConfig", () => ({
  apiFetch: (...args) => apiFetchMock(...args),
}));

// Import sau khi mock
import {
  getSeatLayout,
  getSnacksByCinema,
  releaseSeats,
  previewPrice,
  lockSeats,
  createBooking,
  createPaymentOrder,
  getBookingById,
  getMyBookings,
  getBookingDetail,
} from "../bookingService";

function setGuestSession(id = "guest-123") {
  localStorage.setItem("cv_guest_session_id", id);
  return id;
}

describe("bookingService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    localStorage.clear();

    // đảm bảo không bị thiếu crypto.randomUUID trong môi trường test
    if (!globalThis.crypto) globalThis.crypto = {};
    if (!globalThis.crypto.randomUUID) {
      globalThis.crypto.randomUUID = () => "uuid-fixed-123";
    }
  });

  it("getSeatLayout calls /seats/layout and maps seat fields", async () => {
    apiFetchMock.mockResolvedValue({
      data: [
        {
          showtimeSeatId: "ss-1",
          row: "A",
          number: 1,
          type: "VIP",
          status: "AVAILABLE",
          price: 100000,
        },
      ],
    });

    const res = await getSeatLayout("st-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/seats/layout?showtime_id=st-1");
    expect(res).toEqual([
      {
        seat_id: "ss-1",
        showtimeSeatId: "ss-1",
        row: "A",
        number: 1,
        type: "VIP",
        status: "AVAILABLE",
        price: 100000,
      },
    ]);
  });

  it("getSnacksByCinema calls /cinemas/snacks and maps basic fields", async () => {
    apiFetchMock.mockResolvedValue({
      data: [
        {
          snackId: "sn-1",
          cinemaId: "c-1",
          name: "Coke",
          description: "330ml",
          price: 25000,
          type: "DRINK",
          imageUrl: "http://img",
          imageCloudinaryId: "cld-1",
        },
      ],
    });

    const res = await getSnacksByCinema("c-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/cinemas/snacks?cinemaId=c-1");
    expect(res[0]).toMatchObject({
      snack_id: "sn-1",
      cinema_id: "c-1",
      name: "Coke",
      price: 25000,
      type: "DRINK",
    });
    // category default theo type DRINK
    expect(res[0].category).toBe("NƯỚC NGỌT");
  });

  it("releaseSeats sends DELETE /seat-locks/showtime/:id with X-Session-Id", async () => {
    const sid = setGuestSession("guest-xyz");
    apiFetchMock.mockResolvedValue({ ok: true });

    const res = await releaseSeats("st-9");

    expect(apiFetchMock).toHaveBeenCalledWith("/seat-locks/showtime/st-9", {
      method: "DELETE",
      headers: { "X-Session-Id": sid },
    });
    expect(res).toEqual({ message: "Seats released" });
  });

  it("previewPrice posts /bookings/price-preview with lockId + snacks mapped and X-Session-Id", async () => {
    const sid = setGuestSession("guest-xyz");
    apiFetchMock.mockResolvedValue({ code: 200, data: { total: 123 } });

    const res = await previewPrice({
      lockId: "lock-1",
      promotionCode: "SALE20",
      snacks: [{ snack_id: "sn-1", quantity: 2 }],
    });

    expect(apiFetchMock).toHaveBeenCalledTimes(1);

    const [path, opts] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/bookings/price-preview");
    expect(opts.method).toBe("POST");
    expect(opts.headers).toEqual({ "X-Session-Id": sid });

    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      lockId: "lock-1",
      promotionCode: "SALE20",
      snacks: [{ snackId: "sn-1", quantity: 2 }],
    });

    expect(res).toEqual({ code: 200, data: { total: 123 } });
  });

  it("lockSeats throws when missing showtimeId or seats empty", async () => {
    await expect(lockSeats({ showtimeId: "", seats: [] })).rejects.toThrow(
      "lockSeats: thiếu showtimeId hoặc seats"
    );
    await expect(lockSeats({ showtimeId: "st-1", seats: [] })).rejects.toThrow(
      "lockSeats: thiếu showtimeId hoặc seats"
    );
  });

  it("lockSeats posts /seat-locks with seatsPayload + X-Session-Id", async () => {
    const sid = setGuestSession("guest-abc");
    apiFetchMock.mockResolvedValue({ lockId: "L1" });

    const res = await lockSeats({
      showtimeId: "st-1",
      seats: [
        { seat_id: "ss-1", ticketTypeId: "tt-1" },
        { showtimeSeatId: "ss-2", ticketTypeId: "tt-2" },
      ],
    });

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, opts] = apiFetchMock.mock.calls[0];

    expect(path).toBe("/seat-locks");
    expect(opts.method).toBe("POST");
    expect(opts.headers).toEqual({ "X-Session-Id": sid });

    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      showtimeId: "st-1",
      seats: [
        { showtimeSeatId: "ss-1", ticketTypeId: "tt-1" },
        { showtimeSeatId: "ss-2", ticketTypeId: "tt-2" },
      ],
    });

    expect(res).toEqual({ lockId: "L1" });
  });

  it("createBooking throws if missing lockId and legacy data", async () => {
    await expect(createBooking({})).rejects.toThrow(
      "createBooking: cần lockId (flow mới) hoặc showtimeId + seatIds (legacy mock)"
    );
  });

  it("createBooking posts /bookings/confirm with lockId + snackCombos + guestInfo + X-Session-Id", async () => {
    const sid = setGuestSession("guest-999");
    apiFetchMock.mockResolvedValue({ code: 201, data: { bookingId: "b1" } });

    const res = await createBooking({
      lockId: "lock-9",
      promotionCode: "SALE10",
      snacks: [{ snack_id: "sn-1", quantity: 1 }],
      guestInfo: {
        email: "a@b.com",
        username: "Guest A",
        phoneNumber: "0123",
      },
    });

    const [path, opts] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/bookings/confirm");
    expect(opts.method).toBe("POST");
    expect(opts.headers).toEqual({ "X-Session-Id": sid });

    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      lockId: "lock-9",
      promotionCode: "SALE10",
      snackCombos: [{ snackId: "sn-1", quantity: 1 }],
      guestInfo: {
        email: "a@b.com",
        username: "Guest A",
        phoneNumber: "0123",
      },
    });

    expect(res).toEqual({ code: 201, data: { bookingId: "b1" } });
  });

  it("createPaymentOrder posts /payments/order with normalized method", async () => {
    apiFetchMock.mockResolvedValue({ code: 200, data: { paymentUrl: "url" } });

    const res = await createPaymentOrder({
      bookingId: "b-1",
      paymentMethod: "momo",
      amount: 270000,
    });

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, opts] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/payments/order");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body);
    expect(body).toEqual({
      bookingId: "b-1",
      paymentMethod: "MOMO",
      amount: 270000,
    });

    expect(res.code).toBe(200);
  });

  it("getBookingById unwraps response shape", async () => {
    apiFetchMock.mockResolvedValue({ data: { id: "b-99", status: "PENDING" } });

    const res = await getBookingById("b-99");

    expect(apiFetchMock).toHaveBeenCalledWith("/bookings/b-99");
    expect(res).toEqual({ id: "b-99", status: "PENDING" });
  });

  it("getMyBookings returns array from /bookings/my-bookings", async () => {
    apiFetchMock.mockResolvedValue({ data: [{ id: "b1" }, { id: "b2" }] });

    const res = await getMyBookings();

    expect(apiFetchMock).toHaveBeenCalledWith("/bookings/my-bookings");
    expect(res).toEqual([{ id: "b1" }, { id: "b2" }]);
  });

  describe("bookingService - detail", () => {
    it("getBookingById throws if missing bookingId", async () => {
      await expect(getBookingById()).rejects.toThrow(/bookingId là bắt buộc/i);
    });

    it("getBookingById unwraps res.data.data", async () => {
      apiFetchMock.mockResolvedValueOnce({
        data: { data: { bookingId: "b1" } },
      });

      const res = await getBookingById("b1");

      expect(apiFetchMock).toHaveBeenCalledWith("/bookings/b1");
      expect(res).toEqual({ bookingId: "b1" });
    });

    it("getBookingDetail uses getBookingById", async () => {
      apiFetchMock.mockResolvedValueOnce({
        data: { data: { bookingId: "b2" } },
      });

      const res = await getBookingDetail("b2");

      expect(apiFetchMock).toHaveBeenCalledWith("/bookings/b2");
      expect(res).toEqual({ bookingId: "b2" });
    });
  });
});
