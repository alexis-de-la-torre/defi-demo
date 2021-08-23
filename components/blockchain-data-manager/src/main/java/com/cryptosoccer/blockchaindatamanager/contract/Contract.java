package com.cryptosoccer.blockchaindatamanager.contract;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Data
public class Contract {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String address;
}
