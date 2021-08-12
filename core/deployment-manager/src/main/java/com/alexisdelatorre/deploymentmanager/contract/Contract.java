package com.alexisdelatorre.deploymentmanager.contract;

import lombok.Builder;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
@Data
public class Contract {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String address;
    @Lob
    private String abi;
}
