package com.alexisdelatorre.deploymentmanager.user;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue
    private Long id;
    String name;
    String address;
    String privateKey;
}
