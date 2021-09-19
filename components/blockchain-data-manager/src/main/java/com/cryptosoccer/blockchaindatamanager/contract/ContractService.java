package com.cryptosoccer.blockchaindatamanager.contract;

import com.cryptosoccer.blockchaindatamanager.abi.Abi;
import com.cryptosoccer.blockchaindatamanager.abi.AbiRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class ContractService {
    @Autowired
    private ContractRepository contractRepository;
    @Autowired
    private AbiRepository abiRepository;

    @Autowired
    ModelMapper modelMapper;

    public List<Contract> getContracts() {
        return contractRepository.findAll();
    }

    public Contract saveContract(Contract contract) {
        return contractRepository.save(contract);
    }

    public ContractDto convertToDto(Contract contract) {
        // TODO: Use propertyMapper
        return modelMapper.map(contract, ContractDto.class);
    }

    public Contract convertFromDto(ContractDto contractDto) {
        // TODO: Use propertyMapper
        Contract contract = modelMapper.map(contractDto, Contract.class);

        Abi abi = abiRepository.findById(contractDto.getAbiId())
                .orElseThrow();

        contract.setAbi(abi);

        return contract;
    }

    public Contract getContractByName(String name) {
        return contractRepository.findByName(name);
    }

    public List<Contract> getContractsByAbiName(String abiName) {
        return contractRepository.findContractsByAbi_Name(abiName);
    }
}
