package com.cryptosoccer.blockchaindatamanager.contract;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractDto {
    private Long id;
    private String name;
    private String address;
    private Long abiId;
}
