package com.cryptosoccer.blockchaindatamanager.token;

import org.springframework.data.jpa.repository.JpaRepository;

import javax.transaction.Transactional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Token findByName(String name);
    @Transactional
    void deleteByName(String name);
}
