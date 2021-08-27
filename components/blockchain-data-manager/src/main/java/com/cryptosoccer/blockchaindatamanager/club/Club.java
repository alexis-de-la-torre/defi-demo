package com.cryptosoccer.blockchaindatamanager.club;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Club {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String displayName;
    private String address;
    @Lob
    @Type(type = "org.hibernate.type.TextType")
    private String abi;
}
