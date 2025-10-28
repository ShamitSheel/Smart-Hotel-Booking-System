package com.cts.booking_service.service;

import com.cts.booking_service.dto.*;

import java.util.List;

public interface BookingService {
    BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO, String userId);
    BookingResponseDTO getBookingById(String bookingId);
    List<BookingResponseDTO> getBookingsByUserId(String userId);
    List<BookingResponseDTO> getBookingsByHotelIds(List<String> hotelIds);
    List<EnhancedBookingResponseDTO> getBookingsByManagerId(String managerId);
    ManagerDashboardDTO getDashboardData(String managerId);

    /**
     * Checks if a specified number of rooms are available for a given date range.
     * @param requestDTO The availability request details.
     * @return An availability response indicating if rooms are available.
     */
    AvailabilityResponseDTO checkAvailability(AvailabilityRequestDTO requestDTO);
}
