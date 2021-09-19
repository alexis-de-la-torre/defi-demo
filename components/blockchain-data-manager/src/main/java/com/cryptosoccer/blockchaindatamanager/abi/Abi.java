package com.cryptosoccer.blockchaindatamanager.abi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Abi {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    @Lob
    @Type(type = "org.hibernate.type.TextType")
    private String value;
}
