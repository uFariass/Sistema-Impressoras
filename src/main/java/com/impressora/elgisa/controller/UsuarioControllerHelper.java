package com.impressora.elgisa.controller;

import jakarta.servlet.http.HttpServletRequest;

public class UsuarioControllerHelper {
    
    public static String getClientIpAddress(HttpServletRequest request) {
        try {
            String xForwardedForHeader = request.getHeader("X-Forwarded-For");
            if (xForwardedForHeader == null) {
                return request.getRemoteAddr();
            } else {
                return xForwardedForHeader.split(",")[0];
            }
        } catch (Exception e) {
            return "unknown";
        }
    }
}