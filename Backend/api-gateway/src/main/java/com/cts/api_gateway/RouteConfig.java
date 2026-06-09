package com.cts.api_gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {
    @Autowired
    private GatewayApiAuthenticationFilter gatewayApiAuthenticationFilter;

    @Value("${user.service.url}")
    private String userServiceUrl;

    @Value("${hotel.service.url}")
    private String hotelServiceUrl;

    @Value("${booking.service.url}")
    private String bookingServiceUrl;

    @Value("${ratings.service.url}")
    private String ratingsServiceUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // --- USER-SERVICE Routes ---
                .route("user_service_users_route", // Unique ID
                        r -> r.path("/api/users/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(userServiceUrl))

                .route("user_service_password_route", // Unique ID
                        r -> r.path("/api/forgotPassword/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(userServiceUrl))

                // --- HOTEL-SERVICE Routes ---
                .route("hotel_service_hotels_route", // Unique ID
                        r -> r.path("/api/hotels/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(hotelServiceUrl))

                // --- BOOKING-SERVICE Routes ---
                .route("booking_service_bookings_route", // Unique ID
                        r -> r.path("/api/bookings/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(bookingServiceUrl))

                .route("booking_service_coupons_route", // Unique ID
                        r -> r.path("/api/coupons/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(bookingServiceUrl))
                .route("review_and_rating_service_route", // Unique ID
                        r -> r.path("/api/reviews/**")
                                .filters(f -> f.filter(gatewayApiAuthenticationFilter))
                                .uri(ratingsServiceUrl))
                .build();
    }
}
