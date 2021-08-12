package com.alexisdelatorre.deploymentmanager.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    List<User> index() {
        return userRepository.findAll();
    }

    @GetMapping("/{name}")
    User findByName(@PathVariable String name) {
        return userRepository.findUserByName(name);
    }

    @PostMapping
    User create(@RequestBody User newUser) {
        return userRepository.save(newUser);
    }
}
