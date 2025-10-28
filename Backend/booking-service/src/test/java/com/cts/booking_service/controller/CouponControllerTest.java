package com.cts.booking_service.controller;

import com.cts.booking_service.dto.CouponValidateRequestDTO;
import com.cts.booking_service.dto.CouponValidateResponseDTO;
import com.cts.booking_service.service.CouponService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CouponController.class)
@ActiveProfiles("test")
class CouponControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CouponService couponService;

    @Autowired
    private ObjectMapper objectMapper;

    private CouponValidateRequestDTO validateRequest;
    private CouponValidateResponseDTO validateResponse;

    @BeforeEach
    void setUp() {
        validateRequest = new CouponValidateRequestDTO();
        validateRequest.setCouponCode("TEST10");
        validateRequest.setTotalAmount(100.0);

        validateResponse = CouponValidateResponseDTO.builder()
                .isValid(true)
                .discountAmount(10.0)
                .message("Coupon is valid")
                .build();
    }

    @Test
    void shouldValidateCoupon() throws Exception {
        when(couponService.validateCoupon(any(CouponValidateRequestDTO.class)))
                .thenReturn(validateResponse);

        mockMvc.perform(post("/api/coupons/validate")
                        .header("X-Roles", "[ROLE_USER]")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.discountAmount").value(10.0));
    }

    @Test
    void shouldReturnUnauthorizedWithoutUserRole() throws Exception {
        mockMvc.perform(post("/api/coupons/validate")
                        .header("X-Roles", "[ROLE_ADMIN]")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validateRequest)))
                .andExpect(status().isForbidden());
    }
}