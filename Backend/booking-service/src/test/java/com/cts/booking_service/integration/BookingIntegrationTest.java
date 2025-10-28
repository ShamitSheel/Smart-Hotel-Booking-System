package com.cts.booking_service.integration;

import com.cts.booking_service.dto.AvailabilityRequestDTO;
import com.cts.booking_service.models.*;
import com.cts.booking_service.repository.BookingRepository;
import com.cts.booking_service.repository.CouponRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class BookingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        couponRepository.deleteAll();
        
        Coupon coupon = new Coupon();
        coupon.setCode("TEST10");
        coupon.setDiscount(10.0);
        coupon.setMinAmount(50.0);
        coupon.setExpiryDate(LocalDate.now().plusDays(30));
        coupon.setValid(true);
        couponRepository.save(coupon);
    }

    @Test
    void shouldCheckAvailabilityEndToEnd() throws Exception {
        AvailabilityRequestDTO request = new AvailabilityRequestDTO();
        request.setHotelId("hotel1");
        request.setRoomId("room1");
        request.setCheckInDate(LocalDate.now().plusDays(1));
        request.setCheckOutDate(LocalDate.now().plusDays(3));
        request.setRequiredNumberOfRooms(1);
        request.setQuantityOfRooms(5);

        mockMvc.perform(post("/api/bookings/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").exists());
    }
}