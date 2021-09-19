package com.cryptosoccer.blockchaindatamanager.abi;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AbiRepository extends JpaRepository<Abi, Long> {
    Abi findByName(String name);
}
