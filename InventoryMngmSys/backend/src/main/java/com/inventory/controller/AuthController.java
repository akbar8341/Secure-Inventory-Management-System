package com.inventory.controller;

import com.inventory.dto.APIResponseDTO;
import com.inventory.dto.AuthResponseDTO;
import com.inventory.dto.LoginDTO;
import com.inventory.dto.RegisterDTO;
import com.inventory.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<APIResponseDTO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        AuthResponseDTO response = authService.register(registerDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(APIResponseDTO.success("User registered successfully", response));
    }
    
    @PostMapping("/login")
    public ResponseEntity<APIResponseDTO> login(@Valid @RequestBody LoginDTO loginDTO) {
        AuthResponseDTO response = authService.login(loginDTO);
        return ResponseEntity.ok(APIResponseDTO.success("Login successful", response));
    }
}
