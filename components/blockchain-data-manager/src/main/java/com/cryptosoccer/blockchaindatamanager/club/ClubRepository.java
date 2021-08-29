package com.cryptosoccer.blockchaindatamanager.club;

import org.springframework.data.jpa.repository.JpaRepository;

import javax.transaction.Transactional;

public interface ClubRepository extends JpaRepository<Club, Long> {
    Club findByName(String name);
    @Transactional
    void deleteByName(String name);
}
