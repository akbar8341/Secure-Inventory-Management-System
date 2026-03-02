package com.inventory.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class APIResponseDTO {
    
    private boolean success;
    private String message;
    private Object data;
    private String error;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    public static APIResponseDTO success(String message) {
        return APIResponseDTO.builder()
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static APIResponseDTO success(String message, Object data) {
        return APIResponseDTO.builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static APIResponseDTO error(String message) {
        return APIResponseDTO.builder()
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static APIResponseDTO error(String error, String message) {
        return APIResponseDTO.builder()
                .success(false)
                .error(error)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
