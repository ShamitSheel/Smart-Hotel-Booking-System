package com.cts.hotelservice.config;

import com.cts.hotelservice.dto.RoomUpdateDto;
import com.cts.hotelservice.models.Room;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // --- THE FIX ---
        // Create a specific mapping configuration for RoomUpdateDto -> Room
        TypeMap<RoomUpdateDto, Room> typeMap = modelMapper.createTypeMap(RoomUpdateDto.class, Room.class);

        // Tell ModelMapper to SKIP setting the ID on the destination (Room) object.
        typeMap.addMappings(mapper -> mapper.skip(Room::setId));

        return modelMapper;
    }
}
