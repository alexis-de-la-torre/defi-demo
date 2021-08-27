package com.cryptosoccer.blockchaindatamanager.club;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubController {
    @Autowired
    private ClubRepository clubRepository;

    @GetMapping
    List<Club> index() {
        return clubRepository.findAll();
    }

    @GetMapping("/{name}")
    Club findByName(@PathVariable String name) {
        return clubRepository.findByName(name);
    }

    @PostMapping
    Club create(@RequestBody Club newContract) {
        return clubRepository.save(newContract);
    }

    @DeleteMapping("/{name}")
    void delete(@PathVariable String name) {
        clubRepository.deleteByName(name);
    }
}
