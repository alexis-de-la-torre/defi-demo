package com.cryptosoccer.blockchaindatamanager.token;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tokens")
public class TokenController {
    @Autowired
    private TokenRepository tokenRepository;

    @GetMapping
    List<Token> index() {
        return tokenRepository.findAll();
    }

    @GetMapping("/{name}")
    Token findByName(@PathVariable String name) {
        return tokenRepository.findByName(name);
    }

    @PostMapping
    Token create(@RequestBody Token newContract) {
        return tokenRepository.save(newContract);
    }

    @DeleteMapping("/{name}")
    void delete(@PathVariable String name) {
        tokenRepository.deleteByName(name);
    }
}
