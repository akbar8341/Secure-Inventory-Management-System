package com.inventory.exception;

import com.inventory.dto.APIResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<APIResponseDTO> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(APIResponseDTO.error("NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<APIResponseDTO> handleDuplicateResourceException(DuplicateResourceException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(APIResponseDTO.error("CONFLICT", ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponseDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(APIResponseDTO.builder()
                        .success(false)
                        .error("VALIDATION_ERROR")
                        .message("Invalid input data")
                        .data(errors)
                        .build());
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<APIResponseDTO> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(APIResponseDTO.error("UNAUTHORIZED", "Invalid username or password"));
    }
    
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<APIResponseDTO> handleDataAccessException(DataAccessException ex) {
        logger.error("Database error: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(APIResponseDTO.error("DATABASE_ERROR", "Database error: " + ex.getMostSpecificCause().getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponseDTO> handleGenericException(Exception ex) {
        logger.error("Unexpected error: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(APIResponseDTO.error("INTERNAL_ERROR", ex.getMessage()));
    }
}
