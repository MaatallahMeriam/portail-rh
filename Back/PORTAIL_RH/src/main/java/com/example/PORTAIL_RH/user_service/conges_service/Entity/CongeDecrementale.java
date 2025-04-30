package com.example.PORTAIL_RH.user_service.conges_service.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "conge_decrementale")
public class CongeDecrementale extends CongeType {


}