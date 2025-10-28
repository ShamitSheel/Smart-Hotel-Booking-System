package com.cts.booking_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder // Using builder for easy construction
public class ManagerDashboardDTO {
    private long totalBookingsCount;
    private long upcomingBookingsCount;
    private long todayCheckInsCount;
    private long todayCheckOutsCount;
    private double totalRevenue;
    private List<EnhancedBookingResponseDTO> recentBookings;
}