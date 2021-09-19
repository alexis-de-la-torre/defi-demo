package com.cryptosoccer.blockchaindatamanager.abi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/abis")
public class AbiController {
    @Autowired
    AbiService abiService;

    @GetMapping
    public List<AbiDto> getAbis() {
        return abiService.getAbis()
                .stream()
                .map(abiService::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{name}")
    public AbiDto getAbi(@PathVariable String name) {
        Abi abi = abiService.getAbiByName(name);
        return abiService.convertToDto(abi);
    }

    @PostMapping
    public Abi create(@RequestBody AbiDto abiDto) {
        Abi abi = abiService.convertFromDto(abiDto);
        return abiService.saveAbi(abi);
    }
}
