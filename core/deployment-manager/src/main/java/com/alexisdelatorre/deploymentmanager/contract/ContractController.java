package com.alexisdelatorre.deploymentmanager.contract;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
public class ContractController {
    @Autowired
    private ContractRepository contractRepository;

    @GetMapping
    List<Contract> index() {
        return contractRepository.findAll();
    }

    @GetMapping("/{name}")
    Contract findByName(@PathVariable String name) {
        return contractRepository.findContractByName(name);
    }

    @PostMapping
    Contract create(@RequestBody Contract newContract) {
        return contractRepository.save(newContract);
    }
}
