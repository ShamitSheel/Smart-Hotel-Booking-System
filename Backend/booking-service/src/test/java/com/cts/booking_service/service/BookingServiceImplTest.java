package com.cts.booking_service.service;

import com.cts.booking_service.client.HotelServiceClient;
import com.cts.booking_service.dto.*;
import com.cts.booking_service.dto.hotel.RoomDto;
import com.cts.booking_service.exception.ResourceNotFoundException;
import com.cts.booking_service.models.*;
import com.cts.booking_service.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private HotelServiceClient hotelServiceClient;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private BookingRequestDTO bookingRequestDTO;
    private Booking booking;
    private BookingResponseDTO bookingResponseDTO;

    @BeforeEach
    void setUp() {
        bookingRequestDTO = new BookingRequestDTO();
        bookingRequestDTO.setRoomId("room1");
        bookingRequestDTO.setHotelId("hotel1");
        bookingRequestDTO.setCheckInDate(LocalDate.now().plusDays(1));
        bookingRequestDTO.setCheckOutDate(LocalDate.now().plusDays(3));
        bookingRequestDTO.setNumberOfRooms(1);
        bookingRequestDTO.setTotalAmount(BigDecimal.valueOf(100));

        booking = new Booking();
        booking.setId("booking1");
        booking.setUserId("user1");

        bookingResponseDTO = new BookingResponseDTO();
        bookingResponseDTO.setId("booking1");
    }

    @Test
    void shouldCreateBookingSuccessfully() {
        when(modelMapper.map(bookingRequestDTO, Booking.class)).thenReturn(booking);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(modelMapper.map(booking, BookingResponseDTO.class)).thenReturn(bookingResponseDTO);

        BookingResponseDTO result = bookingService.createBooking(bookingRequestDTO, "user1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("booking1");
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void shouldGetBookingById() {
        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));
        when(modelMapper.map(booking, BookingResponseDTO.class)).thenReturn(bookingResponseDTO);

        BookingResponseDTO result = bookingService.getBookingById("booking1");

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("booking1");
    }

    @Test
    void shouldThrowExceptionWhenBookingNotFound() {
        when(bookingRepository.findById("nonexistent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBookingById("nonexistent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Booking not found");
    }

    @Test
    void shouldCheckAvailability() {
        AvailabilityRequestDTO requestDTO = new AvailabilityRequestDTO();
        requestDTO.setRoomId("room1");
        requestDTO.setCheckInDate(LocalDate.now().plusDays(1));
        requestDTO.setCheckOutDate(LocalDate.now().plusDays(3));
        requestDTO.setRequiredNumberOfRooms(1);
        requestDTO.setQuantityOfRooms(5);

        when(bookingRepository.findOverlappingBookings(anyString(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        AvailabilityResponseDTO result = bookingService.checkAvailability(requestDTO);

        assertThat(result.isAvailable()).isTrue();
        assertThat(result.getAvailableRooms()).isEqualTo(5);
    }
}