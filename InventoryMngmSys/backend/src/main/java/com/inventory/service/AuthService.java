package com.inventory.service;

import com.inventory.dto.AuthResponseDTO;
import com.inventory.dto.LoginDTO;
import com.inventory.dto.RegisterDTO;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.model.User;
import com.inventory.repository.UserRepository;
import com.inventory.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                       JwtUtils jwtUtils, AuthenticationManager authenticationManager,
                       UserDetailsService userDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }
    
    @Transactional
    public AuthResponseDTO register(RegisterDTO registerDTO) {
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new DuplicateResourceException("User", "username", registerDTO.getUsername());
        }
        
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new DuplicateResourceException("User", "email", registerDTO.getEmail());
        }
        
        User user = User.builder()
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .email(registerDTO.getEmail())
                .firstName(registerDTO.getFirstName())
                .lastName(registerDTO.getLastName())
                .role("USER")
                .enabled(true)
                .build();
        
        userRepository.save(user);
        
        String token = jwtUtils.generateToken(userDetailsService.loadUserByUsername(user.getUsername()));
        
        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(jwtUtils.getExpirationTime())
                .build();
    }
    
    public AuthResponseDTO login(LoginDTO loginDTO) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword())
        );
        
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(loginDTO.getUsername());
        String token = jwtUtils.generateToken(userDetails);
        
        return AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .expiresIn(jwtUtils.getExpirationTime())
                .build();
    }
}
