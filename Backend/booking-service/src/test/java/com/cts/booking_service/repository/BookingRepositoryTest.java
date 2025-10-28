package com.cts.booking_service.repository;

import com.cts.booking_service.models.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void shouldFindBookingsByUserId() {
        Booking booking = createTestBooking();
        bookingRepository.save(booking);

        List<Booking> result = bookingRepository.findByUserId("user1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("user1");
    }

    @Test
    void shouldFindBookingsByHotelIds() {
        Booking booking = createTestBooking();
        bookingRepository.save(booking);

        List<Booking> result = bookingRepository.findByHotelIdIn(List.of("hotel1"));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getHotelId()).isEqualTo("hotel1");
    }

    private Booking createTestBooking() {
        Booking booking = new Booking();
        booking.setUserId("user1");
        booking.setRoomId("room1");
        booking.setHotelId("hotel1");
        booking.setCheckInDate(LocalDate.now().plusDays(1));
        booking.setCheckOutDate(LocalDate.now().plusDays(3));
        booking.setBookingDate(LocalDate.now());
        booking.setNumberOfRooms(1);
        booking.setTotalAmount(BigDecimal.valueOf(100));
        booking.setFinalAmount(BigDecimal.valueOf(100));
        booking.setPaymentMethod(PaymentMethod.CARD);
        booking.setStatus(BookingStatus.CONFIRMED);
        
        GuestDetails guestDetails = new GuestDetails();
        guestDetails.setFirstName("John");
        guestDetails.setLastName("Doe");
        guestDetails.setEmail("john@example.com");
        guestDetails.setPhone("1234567890");
        booking.setGuestDetails(guestDetails);
        
        return booking;
    }
}