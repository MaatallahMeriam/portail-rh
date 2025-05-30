package com.example.PORTAIL_RH.conges_service.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "conge_decrementale")
public class CongeDecrementale extends CongeType {


}