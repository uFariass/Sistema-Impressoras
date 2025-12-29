package com.impressora.elgisa.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello World!");
    }
    
    @PostMapping("/login")
    public ResponseEntity<String> testLogin(@RequestBody String body) {
        return ResponseEntity.ok("Login test: " + body);
    }
}