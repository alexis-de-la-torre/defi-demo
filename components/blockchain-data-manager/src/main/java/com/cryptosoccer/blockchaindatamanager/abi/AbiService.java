package com.cryptosoccer.blockchaindatamanager.abi;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AbiService {
    @Autowired
    AbiRepository abiRepository;

    @Autowired
    ModelMapper modelMapper;

    public Optional<Abi> getAbi(Long abiId) {
        return abiRepository.findById(abiId);
    }

    public List<Abi> getAbis() {
        return abiRepository.findAll();
    }

    public Abi getAbiByName(String name) {
        return abiRepository.findByName(name);
    }

    public Abi saveAbi(Abi abi) {
        return abiRepository.save(abi);
    }

    public AbiDto convertToDto(Abi abi) {
        return modelMapper.map(abi, AbiDto.class);
    }

    public Abi convertFromDto(AbiDto abiDto) {
        return modelMapper.map(abiDto, Abi.class);
    }
}
