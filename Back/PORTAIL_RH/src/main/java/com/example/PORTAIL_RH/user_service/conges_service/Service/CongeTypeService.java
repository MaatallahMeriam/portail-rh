package com.example.PORTAIL_RH.user_service.conges_service.Service;

import com.example.PORTAIL_RH.user_service.conges_service.DTO.CongeTypeDTO;

import java.util.List;

public interface CongeTypeService {
    CongeTypeDTO createCongeType(CongeTypeDTO dto);
    List<CongeTypeDTO> getAllCongeTypes();
    List<CongeTypeDTO> getGlobalCongeTypes();
    void deleteCongeType(Long id);
    CongeTypeDTO updateCongeType(Long id, CongeTypeDTO dto);}