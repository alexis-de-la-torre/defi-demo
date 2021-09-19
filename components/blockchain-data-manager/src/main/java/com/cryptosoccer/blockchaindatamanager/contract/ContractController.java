package com.cryptosoccer.blockchaindatamanager.contract;

import com.cryptosoccer.blockchaindatamanager.abi.AbiService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("contracts")
public class ContractController {
    @Autowired
    private ContractService contractService;
    @Autowired
    private AbiService abiService;

    @Autowired
    ModelMapper modelMapper;

    @GetMapping
    public List<ContractDto> getContracts(@RequestParam(required = false) String abiName) {
        if (abiName != null) {
            return contractService.getContractsByAbiName(abiName)
                    .stream()
                    .map(contractService::convertToDto)
                    .collect(Collectors.toList());
        }

        return contractService.getContracts()
                .stream()
                .map(contractService::convertToDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{name}")
    public ContractDto getContract(@PathVariable String name) {
        Contract contract = contractService.getContractByName(name);
        return contractService.convertToDto(contract);
    }

    @PostMapping
    public ContractDto saveContract(@RequestBody ContractDto contractDto) {
        Contract contract = contractService.convertFromDto(contractDto);

        Contract createdContract =
                contractService.saveContract(contract);

        return contractService.convertToDto(createdContract);
    }
}
