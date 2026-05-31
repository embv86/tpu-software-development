package com.marketplace.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // Белый список URL, которые шлюз пропускает без проверки токена
    private static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login"
    );

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 0. ФИКС CORS: Пропускаем предварительные запросы OPTIONS без проверки токена
            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            // 1. Проверяем, входит ли путь в белый список авторизации/регистрации
            boolean isOpenEndpoint = openApiEndpoints.stream().anyMatch(path::startsWith);

            // 2. Если это GET-запрос к объявлениям, его тоже разрешаем смотреть гостям
            boolean isGetListings = request.getMethod() == HttpMethod.GET && path.startsWith("/api/v1/listings");

            if (isOpenEndpoint || isGetListings) {
                return chain.filter(exchange); // Пропускаем дальше без авторизации
            }

            // 3. Для всех остальных запросов (POST, PUT, DELETE к профилю, объявлениям, картинкам, чатам) требуем токен
            if (!request.getHeaders().containsKey("Authorization")) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getOrEmpty("Authorization").getFirst();
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Извлекаем роли
                List<?> rawRoles = claims.get("roles", List.class);
                List<String> roles = rawRoles != null
                        ? rawRoles.stream().map(Object::toString).toList()
                        : List.of();

                // Извлекаем ID пользователя (из клейма "jti")
                String userId = claims.getId();

                if (userId == null) {
                    throw new RuntimeException("User ID (jti claim) missing in token");
                }

                // Пробрасываем заголовки в микросервисы
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Roles", String.join(",", roles))
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                System.out.println(">>> [GATEWAY AUTH ERROR] Path: " + path + " | Error: " + e.getMessage());
                return onError(exchange, "Invalid Token", HttpStatus.FORBIDDEN);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}