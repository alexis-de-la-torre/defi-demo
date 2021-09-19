package com.cryptosoccer.blockchaindatamanager.contract;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Contract findByName(String name);
    List<Contract> findContractsByAbi_Name(String abiName);
}
