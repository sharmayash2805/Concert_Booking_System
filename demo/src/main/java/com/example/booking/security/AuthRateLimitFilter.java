package com.example.booking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;

public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_ATTEMPTS = 5;
    private final ConcurrentHashMap<String, Window> attemptsByIp = new ConcurrentHashMap<>();
    private final Clock clock = Clock.systemUTC();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        return !("/api/auth/login".equals(path) || "/api/auth/register".equals(path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        long now = clock.millis();
        String key = request.getRemoteAddr();
        Window window = attemptsByIp.compute(key, (ip, current) -> {
            if (current == null || now - current.startedAt >= WINDOW_MILLIS) {
                return new Window(now, 1);
            }
            synchronized (current) {
                current.attempts++;
            }
            return current;
        });

        if (window.attempts > MAX_ATTEMPTS) {
            long retrySeconds = Math.max(1, (window.startedAt + WINDOW_MILLIS - now + 999) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(retrySeconds));
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":429,\"code\":\"RATE_LIMITED\",\"message\":\"Too many authentication attempts\"}");
            return;
        }

        if (attemptsByIp.size() > 10_000) {
            attemptsByIp.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= WINDOW_MILLIS);
        }
        filterChain.doFilter(request, response);
    }

    private static final class Window {
        private final long startedAt;
        private int attempts;

        private Window(long startedAt, int attempts) {
            this.startedAt = startedAt;
            this.attempts = attempts;
        }
    }
}