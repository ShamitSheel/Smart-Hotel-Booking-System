package com.cts.booking_service.service;

import com.cts.booking_service.client.HotelServiceClient;
import com.cts.booking_service.dto.*;
import com.cts.booking_service.dto.hotel.HotelDto;
import com.cts.booking_service.dto.hotel.RoomDto;
import com.cts.booking_service.exception.ResourceNotFoundException;
import com.cts.booking_service.models.Booking;
import com.cts.booking_service.models.BookingStatus;
import com.cts.booking_service.models.PaymentMethod;
import com.cts.booking_service.repository.BookingRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ModelMapper modelMapper;
    private final HotelServiceClient hotelServiceClient;

    @Autowired
    public BookingServiceImpl(BookingRepository bookingRepository, ModelMapper modelMapper, HotelServiceClient hotelServiceClient) {
        this.bookingRepository = bookingRepository;
        this.modelMapper = modelMapper;
        this.hotelServiceClient = hotelServiceClient;
    }

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO, String userId) {
        // 1. Map DTO to the entity
        Booking booking = modelMapper.map(bookingRequestDTO, Booking.class);

        // 2. *** CRITICAL STEP: Set the userId from the trusted token parameter ***
        booking.setUserId(userId);

        // 3. Handle payment method and booking status
        try {
            PaymentMethod paymentMethod = PaymentMethod.valueOf(bookingRequestDTO.getPaymentMethod().toUpperCase());
            booking.setPaymentMethod(paymentMethod);

            if (paymentMethod == PaymentMethod.PAY_AT_PROPERTY) {
                booking.setStatus(BookingStatus.PENDING);
            } else {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid paymentMethod value: " + bookingRequestDTO.getPaymentMethod());
        }

        // 4. Save the booking
        Booking savedBooking = bookingRepository.save(booking);

        // 5. Return the response DTO
        return modelMapper.map(savedBooking, BookingResponseDTO.class);
    }

    @Override
    public BookingResponseDTO getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        return modelMapper.map(booking, BookingResponseDTO.class);
    }

    @Override
    public List<BookingResponseDTO> getBookingsByUserId(String userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        if (bookings.isEmpty()) {
            throw new ResourceNotFoundException("No bookings found for user with ID: " + userId);
        }
        return bookings.stream()
                .map(booking -> modelMapper.map(booking, BookingResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getBookingsByHotelIds(List<String> hotelIds) {
        if (hotelIds == null || hotelIds.isEmpty()) {
            return List.of(); // Return empty list if input is empty or null
        }
        List<Booking> bookings = bookingRepository.findByHotelIdIn(hotelIds);
        return bookings.stream()
                .map(booking -> modelMapper.map(booking, BookingResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<EnhancedBookingResponseDTO> getBookingsByManagerId(String managerId) {
        // Step 1: Call the external HOTEL-SERVICE to get all hotels for the manager
        List<HotelDto> hotelsManaged = hotelServiceClient.getHotelsByManagerId(managerId);

        if (hotelsManaged == null || hotelsManaged.isEmpty()) {
            return Collections.emptyList(); // No hotels, so no bookings
        }

        // Step 2: Create efficient lookup maps for hotels and rooms
        Map<String, HotelDto> hotelMap = hotelsManaged.stream()
                .collect(Collectors.toMap(HotelDto::getId, Function.identity()));

        Map<String, RoomDto> roomMap = hotelsManaged.stream()
                .filter(hotel -> hotel.getRooms() != null)
                .flatMap(hotel -> hotel.getRooms().stream())
                .collect(Collectors.toMap(RoomDto::getId, Function.identity()));

        // Step 3: Extract hotel IDs to find the relevant bookings
        List<String> hotelIds = hotelsManaged.stream()
                .map(HotelDto::getId)
                .collect(Collectors.toList());

        List<Booking> bookings = bookingRepository.findByHotelIdIn(hotelIds);

        // Step 4: Map Booking entities to the new EnhancedBookingResponseDTO
        return bookings.stream().map(booking -> {
            EnhancedBookingResponseDTO dto = new EnhancedBookingResponseDTO();
            HotelDto hotel = hotelMap.get(booking.getHotelId());
            RoomDto room = roomMap.get(booking.getRoomId());

            // Map booking details
            dto.setId(booking.getId());
            dto.setUserId(booking.getUserId());
            dto.setRoomId(booking.getRoomId());
            dto.setHotelId(booking.getHotelId());
            dto.setCheckInDate(booking.getCheckInDate().toString());
            dto.setCheckOutDate(booking.getCheckOutDate().toString());
            dto.setBookingDate(booking.getBookingDate().toString());
            dto.setNumberOfRooms(booking.getNumberOfRooms());
            dto.setTotalAmount(booking.getTotalAmount().doubleValue());
            dto.setDiscountApplied(booking.getDiscountApplied().doubleValue());
            dto.setFinalAmount(booking.getFinalAmount().doubleValue());
            dto.setPaymentMethod(booking.getPaymentMethod());
            dto.setStatus(booking.getStatus());
            dto.setGuestDetails(modelMapper.map(booking.getGuestDetails(), GuestDetailsDTO.class));

            // Add enhanced fields
            dto.setHotelName(hotel != null ? hotel.getName() : "Unknown Hotel");
            dto.setRoomName(room != null ? room.getName() : "Unknown Room");
            dto.setCustomerName(booking.getGuestDetails().getFirstName() + " " + booking.getGuestDetails().getLastName());

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public ManagerDashboardDTO getDashboardData(String managerId) {
        // Step 1: Get all hotels managed by the user. This is the ONLY network call to hotel-service.
        List<HotelDto> hotelsManaged = hotelServiceClient.getHotelsByManagerId(managerId);

        if (hotelsManaged == null || hotelsManaged.isEmpty()) {
            // Return a default, empty dashboard if the manager has no hotels
            return ManagerDashboardDTO.builder()
                    .totalBookingsCount(0).upcomingBookingsCount(0)
                    .todayCheckInsCount(0).todayCheckOutsCount(0)
                    .totalRevenue(0.0).recentBookings(Collections.emptyList())
                    .build();
        }

        // Step 2: Create efficient lookup maps for hotels and rooms from the list we just fetched
        Map<String, HotelDto> hotelMap = hotelsManaged.stream()
                .collect(Collectors.toMap(HotelDto::getId, Function.identity()));

        Map<String, RoomDto> roomMap = hotelsManaged.stream()
                .filter(hotel -> hotel.getRooms() != null)
                .flatMap(hotel -> hotel.getRooms().stream())
                .collect(Collectors.toMap(RoomDto::getId, Function.identity()));

        // Step 3: Get all bookings for those hotels
        List<String> hotelIds = hotelsManaged.stream().map(HotelDto::getId).collect(Collectors.toList());
        List<Booking> bookings = bookingRepository.findByHotelIdIn(hotelIds);

        LocalDate today = LocalDate.now();

        // Step 4: Calculate all metrics
        long totalBookingsCount = bookings.size();
        double totalRevenue = bookings.stream().mapToDouble(b -> b.getFinalAmount().doubleValue()).sum();
        long upcomingBookingsCount = bookings.stream()
                .filter(b -> b.getCheckInDate().isAfter(today)) // Removed .toLocalDate()
                .count();
        long todayCheckInsCount = bookings.stream()
                .filter(b -> b.getCheckInDate().isEqual(today)) // Removed .toLocalDate()
                .count();
        long todayCheckOutsCount = bookings.stream()
                .filter(b -> b.getCheckOutDate().isEqual(today)) // Removed .toLocalDate()
                .count();

        // Step 5: Get the 5 most recent bookings and enhance them USING THE MAPS
        List<EnhancedBookingResponseDTO> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(Booking::getBookingDate).reversed())
                .limit(5)
                .map(booking -> {
                    HotelDto hotel = hotelMap.get(booking.getHotelId());
                    RoomDto room = roomMap.get(booking.getRoomId());

                    EnhancedBookingResponseDTO dto = new EnhancedBookingResponseDTO();
                    // Map all fields from booking to dto...
                    dto.setId(booking.getId());
                    dto.setHotelId(booking.getHotelId());
                    dto.setRoomId(booking.getRoomId());
                    dto.setCheckInDate(booking.getCheckInDate().toString());
                    dto.setCheckOutDate(booking.getCheckOutDate().toString());
                    dto.setBookingDate(booking.getBookingDate().toString());
                    dto.setFinalAmount(booking.getFinalAmount().doubleValue());
                    dto.setGuestDetails(modelMapper.map(booking.getGuestDetails(), GuestDetailsDTO.class));

                    // Add enhanced fields from the maps
                    dto.setCustomerName(booking.getGuestDetails().getFirstName() + " " + booking.getGuestDetails().getLastName());
                    dto.setHotelName(hotel != null ? hotel.getName() : "Unknown Hotel");
                    dto.setRoomName(room != null ? room.getName() : "Unknown Room");

                    return dto;
                })
                .collect(Collectors.toList());

        // Step 6: Build and return the final DTO
        return ManagerDashboardDTO.builder()
                .totalBookingsCount(totalBookingsCount)
                .upcomingBookingsCount(upcomingBookingsCount)
                .todayCheckInsCount(todayCheckInsCount)
                .todayCheckOutsCount(todayCheckOutsCount)
                .totalRevenue(totalRevenue)
                .recentBookings(recentBookings)
                .build();
    }

    @Override
    public AvailabilityResponseDTO checkAvailability(AvailabilityRequestDTO requestDTO) {
        // Step 1: Find all existing bookings that overlap with the requested dates.
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                requestDTO.getRoomId(),
                requestDTO.getCheckInDate(),
                requestDTO.getCheckOutDate()
        );

        // Step 2: Calculate the total number of rooms already booked during that period.
        int totalRoomsBooked = overlappingBookings.stream()
                .mapToInt(Booking::getNumberOfRooms)
                .sum();

        // Step 3: Calculate the number of available rooms.
        int availableRooms = requestDTO.getQuantityOfRooms() - totalRoomsBooked;

        // Step 4: Check if the available rooms are sufficient.
        if (availableRooms >= requestDTO.getRequiredNumberOfRooms()) {
            // Step 5 (Success): Rooms are available.
            String message = String.format("Success: %d rooms are available.", availableRooms);
            return new AvailabilityResponseDTO(true, message, availableRooms);
        } else {
            // Step 5 (Failure): Not enough rooms are available.
            String message;
            if (availableRooms <= 0) {
                message = "Sorry, no rooms are available for this slot. Please try other dates.";
            } else {
                message = String.format("Sorry, only %d room(s) are available for this slot. Please adjust your request.", availableRooms);
            }
            return new AvailabilityResponseDTO(false, message, availableRooms);
        }
    }
}