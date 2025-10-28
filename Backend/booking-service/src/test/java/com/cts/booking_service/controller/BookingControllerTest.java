package com.cts.booking_service.controller;

import com.cts.booking_service.dto.*;
import com.cts.booking_service.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@ActiveProfiles("test")
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    private AvailabilityRequestDTO availabilityRequest;
    private AvailabilityResponseDTO availabilityResponse;
    private BookingRequestDTO bookingRequest;
    private BookingResponseDTO bookingResponse;

    @BeforeEach
    void setUp() {
        availabilityRequest = new AvailabilityRequestDTO();
        availabilityRequest.setHotelId("hotel1");
        availabilityRequest.setRoomId("room1");
        availabilityRequest.setCheckInDate(LocalDate.now().plusDays(1));
        availabilityRequest.setCheckOutDate(LocalDate.now().plusDays(3));
        availabilityRequest.setRequiredNumberOfRooms(1);

        availabilityResponse = new AvailabilityResponseDTO(true, "Available", 5);

        bookingRequest = new BookingRequestDTO();
        bookingRequest.setHotelId("hotel1");
        bookingRequest.setRoomId("room1");
        bookingRequest.setCheckInDate(LocalDate.now().plusDays(1));
        bookingRequest.setCheckOutDate(LocalDate.now().plusDays(3));
        bookingRequest.setNumberOfRooms(1);
        bookingRequest.setTotalAmount(BigDecimal.valueOf(100));

        bookingResponse = new BookingResponseDTO();
        bookingResponse.setId("booking1");
    }

    @Test
    void shouldCheckRoomAvailability() throws Exception {
        when(bookingService.checkAvailability(any(AvailabilityRequestDTO.class)))
                .thenReturn(availabilityResponse);

        mockMvc.perform(post("/api/bookings/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availabilityRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.availableRooms").value(5));
    }

    @Test
    void shouldCreateBooking() throws Exception {
        when(bookingService.createBooking(any(BookingRequestDTO.class), anyString()))
                .thenReturn(bookingResponse);

        mockMvc.perform(post("/api/bookings")
                        .header("X-Roles", "ROLE_USER")
                        .header("X-User-Id", "user1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("booking1"));
    }

    @Test
    void shouldGetMyBookings() throws Exception {
        when(bookingService.getBookingsByUserId("user1"))
                .thenReturn(List.of(bookingResponse));

        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("X-Roles", "ROLE_USER")
                        .header("X-User-Id", "user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value("booking1"));
    }

    @Test
    void shouldReturnBadRequestForInvalidDates() throws Exception {
        availabilityRequest.setCheckInDate(LocalDate.now().plusDays(3));
        availabilityRequest.setCheckOutDate(LocalDate.now().plusDays(1));

        mockMvc.perform(post("/api/bookings/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availabilityRequest)))
                .andExpect(status().isBadRequest());
    }
}