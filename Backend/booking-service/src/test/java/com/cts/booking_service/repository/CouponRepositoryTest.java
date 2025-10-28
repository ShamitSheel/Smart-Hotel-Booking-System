package com.cts.booking_service.repository;

import com.cts.booking_service.models.Coupon;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class CouponRepositoryTest {

    @Autowired
    private CouponRepository couponRepository;

    @Test
    void shouldFindCouponByCode() {
        Coupon coupon = createTestCoupon();
        couponRepository.save(coupon);

        Optional<Coupon> result = couponRepository.findByCode("TEST10");

        assertThat(result).isPresent();
        assertThat(result.get().getCode()).isEqualTo("TEST10");
    }

    @Test
    void shouldReturnEmptyWhenCouponNotFound() {
        Optional<Coupon> result = couponRepository.findByCode("NONEXISTENT");

        assertThat(result).isEmpty();
    }

    private Coupon createTestCoupon() {
        Coupon coupon = new Coupon();
        coupon.setCode("TEST10");
        coupon.setDiscount(10.0);
        coupon.setMinAmount(50.0);
        coupon.setExpiryDate(LocalDate.now().plusDays(30));
        coupon.setValid(true);
        return coupon;
    }
}