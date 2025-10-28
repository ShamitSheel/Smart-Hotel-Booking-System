package com.cts.booking_service.service;

import com.cts.booking_service.dto.CouponValidateRequestDTO;
import com.cts.booking_service.dto.CouponValidateResponseDTO;
import com.cts.booking_service.models.Coupon;
import com.cts.booking_service.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceImplTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponServiceImpl couponService;

    private CouponValidateRequestDTO requestDTO;
    private Coupon validCoupon;

    @BeforeEach
    void setUp() {
        requestDTO = new CouponValidateRequestDTO();
        requestDTO.setCouponCode("TEST10");
        requestDTO.setTotalAmount(100.0);

        validCoupon = new Coupon();
        validCoupon.setCode("TEST10");
        validCoupon.setDiscount(10.0);
        validCoupon.setMinAmount(50.0);
        validCoupon.setExpiryDate(LocalDate.now().plusDays(30));
        validCoupon.setValid(true);
    }

    @Test
    void shouldValidateCouponSuccessfully() {
        when(couponRepository.findByCode("TEST10")).thenReturn(Optional.of(validCoupon));

        CouponValidateResponseDTO result = couponService.validateCoupon(requestDTO);

        assertThat(result.isValid()).isTrue();
        assertThat(result.getDiscountAmount()).isEqualTo(10.0);
        assertThat(result.getMessage()).contains("valid");
    }

    @Test
    void shouldReturnInvalidWhenCouponNotFound() {
        when(couponRepository.findByCode("INVALID")).thenReturn(Optional.empty());
        requestDTO.setCouponCode("INVALID");

        CouponValidateResponseDTO result = couponService.validateCoupon(requestDTO);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("not found");
    }

    @Test
    void shouldReturnInvalidWhenCouponExpired() {
        validCoupon.setExpiryDate(LocalDate.now().minusDays(1));
        when(couponRepository.findByCode("TEST10")).thenReturn(Optional.of(validCoupon));

        CouponValidateResponseDTO result = couponService.validateCoupon(requestDTO);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("expired");
    }

    @Test
    void shouldReturnInvalidWhenAmountBelowMinimum() {
        requestDTO.setTotalAmount(30.0);
        when(couponRepository.findByCode("TEST10")).thenReturn(Optional.of(validCoupon));

        CouponValidateResponseDTO result = couponService.validateCoupon(requestDTO);

        assertThat(result.isValid()).isFalse();
        assertThat(result.getMessage()).contains("minimum amount");
    }
}