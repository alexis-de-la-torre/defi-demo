package com.alexisdelatorre.deploymentmanager.contract;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Contract findContractByName(String name);
}
