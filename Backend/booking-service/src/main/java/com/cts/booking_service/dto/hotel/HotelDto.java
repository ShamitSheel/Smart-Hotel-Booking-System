package com.cts.booking_service.dto.hotel;

import lombok.Data;
import java.util.List;

@Data
public class HotelDto {
    private String id;
    private String name;
    private String managerId;
    private List<RoomDto> rooms; // Add this line
}