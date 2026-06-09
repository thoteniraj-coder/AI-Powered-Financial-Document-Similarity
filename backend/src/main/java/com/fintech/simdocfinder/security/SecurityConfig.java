package com.fintech.simdocfinder.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/api/auth/**").permitAll()
                .requestMatchers("/api/users/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE_MANAGER", "ROLE_COMPLIANCE_OFFICER")
                .requestMatchers("/api/retention-policies/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_COMPLIANCE_OFFICER")
                .requestMatchers("/api/audit/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AUDITOR", "ROLE_COMPLIANCE_OFFICER")
                .requestMatchers("/api/alerts/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE_MANAGER", "ROLE_COMPLIANCE_OFFICER")
                .requestMatchers(HttpMethod.DELETE, "/api/documents/*/erase").hasAnyAuthority("ROLE_ADMIN", "ROLE_COMPLIANCE_OFFICER")
                .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE_MANAGER")
                .requestMatchers(HttpMethod.POST, "/api/documents/upload", "/api/documents/search", "/api/documents/compare", "/api/documents/*/find-similar").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE_MANAGER", "ROLE_FINANCE_CLERK")
                .requestMatchers(HttpMethod.GET, "/api/documents/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_FINANCE_MANAGER", "ROLE_FINANCE_CLERK", "ROLE_AUDITOR", "ROLE_VIEWER", "ROLE_COMPLIANCE_OFFICER")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Content-Disposition", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
