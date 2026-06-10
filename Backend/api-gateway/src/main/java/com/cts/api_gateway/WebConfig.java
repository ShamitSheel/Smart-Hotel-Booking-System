package com.cts.api_gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig {

    @Value("${cors.allowed-origins:https://smart-hotel-booking-system.vercel.app,http://localhost:4200}")
    private String allowedOrigins;

    /**
     * Configures global CORS settings for the API Gateway.
     * This is the single point of entry for the frontend, so CORS is handled here.
     * NOTE: Spring Cloud Gateway uses the reactive stack, so the configuration
     * is slightly different from a standard Spring MVC WebConfig.
     */
    @Bean
    public CorsWebFilter corsWebFilter() {

        CorsConfiguration corsConfig = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
        corsConfig.setAllowedOriginPatterns(origins);
        corsConfig.setMaxAge(3600L); // 1 hour
        corsConfig.addAllowedMethod("*"); // Allow all methods
        corsConfig.addAllowedHeader("*"); // Allow all headers
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Apply to all paths

        return new CorsWebFilter(source);
    }
}
