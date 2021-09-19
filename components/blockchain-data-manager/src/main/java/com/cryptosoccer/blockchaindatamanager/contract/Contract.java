package com.cryptosoccer.blockchaindatamanager.contract;

import com.cryptosoccer.blockchaindatamanager.abi.Abi;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Contract {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
    private String address;
    @ManyToOne(cascade = CascadeType.MERGE)
    private Abi abi;
}
