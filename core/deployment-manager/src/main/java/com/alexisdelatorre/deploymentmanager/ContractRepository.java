package com.alexisdelatorre.deploymentmanager;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Contract findContractByName(String name);
}
